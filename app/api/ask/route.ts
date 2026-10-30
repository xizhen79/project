import 'server-only';
import {handleAsk,safeError} from '@/lib/server/ask-handler';
import {mockMode,mockAnswer} from '@/lib/server/mock-ai';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function POST(request:Request){
 const mode=mockMode();const headers:Record<string,string>={'Cache-Control':'no-store'};if(mode)headers['X-Dashboard-AI-Mode']='mock';
 try{
  const declared=Number(request.headers.get('content-length')??0);if(declared>1_000_000)return Response.json({error:'질문 자료의 크기가 너무 큽니다. 현장을 선택해 범위를 줄여 주세요.'},{status:400,headers});
  const text=await request.text();if(text.length>1_000_000)return Response.json({error:'질문 자료의 크기가 너무 큽니다.'},{status:400,headers});
  let body:unknown;try{body=JSON.parse(text);}catch{return Response.json({error:'질문 자료 형식을 확인해 주세요.'},{status:400,headers});}
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),30000);const onAbort=()=>controller.abort();request.signal.addEventListener('abort',onAbort,{once:true});
  try{return Response.json(mode?await mockAnswer(body,mode,controller.signal):await handleAsk(body,{apiKey:process.env.GEMINI_API_KEY,signal:controller.signal}),{headers});}finally{clearTimeout(timer);request.signal.removeEventListener('abort',onAbort);}
 }catch(error){const failure=safeError(error);return Response.json({error:failure.message,mock:!!mode},{status:failure.code,headers});}
}
