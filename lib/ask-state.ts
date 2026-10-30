import type {AskContext} from './ai-context';
export type AIState={input:string;submitted:string;answer:string;error:string;status:'idle'|'pending'|'success'|'error';requestId:string;context:AskContext|null;mock:boolean};
export const emptyAI:AIState={input:'',submitted:'',answer:'',error:'',status:'idle',requestId:'',context:null,mock:false};
export function responseIsCurrent(revision:number,requestId:string,currentRevision:number,currentRequestId:string){return revision===currentRevision&&requestId===currentRequestId;}
