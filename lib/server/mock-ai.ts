import {validatePayload,AskFailure} from './ask-handler';
import {MODEL,type AskResponse} from '../ai-context';
export function mockMode(){return process.env.NODE_ENV==='development'&&['success','delay','error'].includes(process.env.DASHBOARD_AI_TEST_MODE??'')?process.env.DASHBOARD_AI_TEST_MODE:null;}
export async function mockAnswer(value:unknown,mode:string,signal:AbortSignal):Promise<AskResponse>{
 if(!validatePayload(value))throw new AskFailure(400,'질문 또는 근거 자료를 확인해 주세요.');
 if(mode==='delay')await new Promise<void>((resolve,reject)=>{const timer=setTimeout(()=>{signal.removeEventListener('abort',abort);resolve();},5000);function abort(){clearTimeout(timer);reject(new AskFailure(504,'모의 응답: 대기 요청을 중단했습니다.'));}if(signal.aborted)abort();else signal.addEventListener('abort',abort,{once:true});});
 if(mode==='error')throw new AskFailure(502,'모의 응답: AI 연결 실패를 재현했습니다. 실제 API를 호출하지 않았습니다.');
 return {answer:`[모의 응답 · 실제 AI 호출 아님]\n${value.context.filters.month} · ${value.context.filters.siteId||'전체'} 현장, 공정차이 ${value.context.summary.gap}pp.\n기록된 상황: ${value.context.sourceRows[0].issueSummary}\n대응 계획: ${value.context.sourceRows[0].actionPlan}`,requestId:value.requestId,model:MODEL,mock:true};
}
