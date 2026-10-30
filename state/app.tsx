'use client';
import {createContext,useContext,useReducer,useRef,useEffect, type ReactNode} from 'react';
import {defaultFilters,initialFilters,normalizeFilters,type Filters,type SiteRecord} from '@/lib/data';
import {buildAskContext,type AskContext,type AskResponse} from '@/lib/ai-context';
import {emptyAI,responseIsCurrent,type AIState} from '@/lib/ask-state';
export type AppState={records:SiteRecord[];filters:Filters;filename:string;warnings:string[];expanded:string[];focus:string;revision:number;ai:AIState};
export type Action={type:'load';records:SiteRecord[];filename:string;warnings:string[]}|{type:'filter';patch:Partial<Filters>}|{type:'reset'}|{type:'expand';id:string}|{type:'collapse'}|{type:'focus';id:string}|{type:'question';value:string}|{type:'aiReset'}|{type:'askStart';id:string;context:AskContext;question:string}|{type:'askSuccess';id:string;revision:number;answer:string;mock:boolean}|{type:'askError';id:string;revision:number;message:string;mock?:boolean};
export const initialState:AppState={records:[],filters:initialFilters,filename:'',warnings:[],expanded:[],focus:'',revision:0,ai:emptyAI};
export function reducer(state:AppState,action:Action):AppState {
  switch(action.type){
    case 'load':return {...initialState,records:action.records,filters:defaultFilters(action.records),filename:action.filename,warnings:action.warnings,revision:state.revision+1};
    case 'filter':{const filters=normalizeFilters(state.records,{...state.filters,...action.patch});return JSON.stringify(filters)===JSON.stringify(state.filters)?state:{...state,filters,expanded:[],focus:'',ai:emptyAI,revision:state.revision+1};}
    case 'reset':return {...state,filters:defaultFilters(state.records),expanded:[],focus:'',ai:emptyAI,revision:state.revision+1};
    case 'expand':return {...state,expanded:state.expanded.includes(action.id)?state.expanded.filter(x=>x!==action.id):[...state.expanded,action.id]};
    case 'collapse':return {...state,expanded:[]};
    case 'focus':return {...state,focus:action.id,expanded:[...new Set([...state.expanded,action.id])]};
    case 'question':return {...state,ai:{...state.ai,input:action.value}};
    case 'aiReset':return {...state,ai:emptyAI,revision:state.revision+1};
    case 'askStart':return {...state,ai:{...state.ai,submitted:action.question,answer:'',error:'',status:'pending',requestId:action.id,context:action.context,mock:false}};
    case 'askSuccess':return responseIsCurrent(action.revision,action.id,state.revision,state.ai.requestId)?{...state,ai:{...state.ai,answer:action.answer,status:'success',mock:action.mock}}:state;
    case 'askError':return responseIsCurrent(action.revision,action.id,state.revision,state.ai.requestId)?{...state,ai:{...state.ai,error:action.message,status:'error',mock:!!action.mock}}:state;
  }
}
const Context=createContext<{state:AppState;dispatch:React.Dispatch<Action>;ask:()=>Promise<void>}|null>(null);
export function AppProvider({children}:{children:ReactNode}) {
 const [state,send]=useReducer(reducer,initialState);const controller=useRef<AbortController|null>(null);const sequence=useRef(0);
 useEffect(()=>()=>{controller.current?.abort();},[]);
 function dispatch(action:Action){if(reducer(state,action).revision!==state.revision){controller.current?.abort();controller.current=null;}send(action);}
 async function ask(){if(controller.current||state.ai.status==='pending')return;const question=state.ai.input.trim();if(!question)return;const context=buildAskContext(state.records,state.filters);const revision=state.revision;const id=String(++sequence.current);const active=new AbortController();let mock=false;controller.current=active;send({type:'askStart',id,context,question});const timer=setTimeout(()=>active.abort(),30000);
  try{const response=await fetch('/api/ask',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question,context,requestId:id,revision}),signal:active.signal});mock=response.headers.get('X-Dashboard-AI-Mode')==='mock';const result=await response.json() as AskResponse&{error?:string};if(!response.ok)throw new Error(result.error||'AI 연결에 실패했습니다.');if(result.requestId!==id||typeof result.answer!=='string')throw new Error('AI 응답을 확인하지 못했습니다. 다시 시도해 주세요.');send({type:'askSuccess',id,revision,answer:result.answer,mock:result.mock});}
  catch(error){send({type:'askError',id,revision,mock,message:active.signal.aborted?'AI 응답이 중단되었거나 시간이 초과되었습니다. 다시 시도해 주세요.':error instanceof Error?error.message:'AI 연결에 실패했습니다.'});}
  finally{clearTimeout(timer);if(controller.current===active)controller.current=null;}
 }
 return <Context.Provider value={{state,dispatch,ask}}>{children}</Context.Provider>;
}
export function useApp(){const value=useContext(Context);if(!value)throw new Error('자료 공유 기능이 준비되지 않았습니다.');return value;}
