import {describe,it,expect,vi} from 'vitest';
import {readFileSync} from 'node:fs';
import {initialFilters,inspectFile} from '@/lib/data';
import {buildAskContext,MODEL} from '@/lib/ai-context';
import {handleAsk,validatePayload,AskFailure,safeError,SYSTEM_INSTRUCTION} from '@/lib/server/ask-handler';
import {initialState,reducer} from '@/state/app';
const records=inspectFile(readFileSync('data/현장공정기성.csv','utf8'),'csv').records;
const context=buildAskContext(records,{...initialFilters,siteId:'D'});
const payload={question:'D 현장의 점검 이유와 대응 계획은?',requestId:'req-1',revision:1,context};
describe('AI 근거 자료',()=>{
 it('같은 필터의 현재 원문과 계산·월별 요약을 구분한다',()=>{expect(context.sourceRows).toHaveLength(1);expect(context.sourceRows[0].month).toBe('2026-09');expect(context.historyRows).toHaveLength(12);expect(context.monthlySummary).toHaveLength(12);expect(context.monthlySummary[0].monthly).toBeNull();expect(context.summary.gap).toBe('-10.7');expect(context.historyRows.every(r=>r.siteId==='D')).toBe(true);expect(validatePayload(payload)).toBe(true);});
 it('전체 범위에는 현장별 과거 기록을 넣지 않는다',()=>{const c=buildAskContext(records,initialFilters);expect(c.sourceRows).toHaveLength(12);expect(c.historyRows).toHaveLength(0);expect(validatePayload({...payload,context:c})).toBe(true);});
 it('J 과거 기록과 실제 0을 보존한다',()=>{const c=buildAskContext(records,{...initialFilters,siteId:'J'});expect(c.historyRows.find(r=>r.month==='2026-07')?.issueSummary).toContain('서류 보완');expect(c.monthlySummary.find(r=>r.month==='2026-07')?.monthly).toBe('0');});
 it.each(['source','scope','number','empty','record'])('잘못된 %s 근거는 거부한다',kind=>{const p=structuredClone(payload);if(kind==='source')p.context.sourceRows[0].siteId='A';if(kind==='scope')p.context.filters.month='2099-01';if(kind==='number')p.context.summary.rate='Infinity';if(kind==='empty')p.question=' ';if(kind==='record')p.context.historyRows[0].actionPlan='';expect(validatePayload(p)).toBe(false);});
 it('설명 지침에 사실 범위와 원문·요약 구별을 포함한다',()=>{expect(SYSTEM_INSTRUCTION).toContain('sourceRows/historyRows');expect(SYSTEM_INSTRUCTION).toContain('실제 준공일');expect(SYSTEM_INSTRUCTION).toContain('계획을 실행 완료');});
});
describe('서버 AI 연결과 실패',()=>{
 it('명시적 키로 생성기를 호출하고 모델·요청 번호와 함께 반환한다',async()=>{const generator=vi.fn(async()=> '2026-09 D의 공정차이는 -10.7pp입니다.');const r=await handleAsk(payload,{apiKey:'test-only-not-a-real-key',generator});expect(r.model).toBe(MODEL);expect(r.requestId).toBe('req-1');expect(r.mock).toBe(false);expect(generator).toHaveBeenCalledOnce();});
 it('키가 없으면 AI를 호출하지 않는다',async()=>{const generator=vi.fn();await expect(handleAsk(payload,{generator})).rejects.toMatchObject({code:503});expect(generator).not.toHaveBeenCalled();});
 it('잘못된 요청은 키 유무 확인 전 거부한다',async()=>{await expect(handleAsk({},{})).rejects.toMatchObject({code:400});});
 it.each([[429,429],[403,502],[404,502],[500,502]])('외부 코드 %s를 안전한 실패 %s로 바꾼다',async(code,want)=>{const generator=async()=>{throw {status:code,message:'private-key-must-not-appear'};};await expect(handleAsk(payload,{apiKey:'test-key',generator})).rejects.toMatchObject({code:want});try{await handleAsk(payload,{apiKey:'test-key',generator});}catch(e){expect((e as Error).message).not.toContain('private-key');}});
 it('빈 응답을 성공 처리하지 않는다',async()=>{await expect(handleAsk(payload,{apiKey:'test',generator:async()=> ' '})).rejects.toMatchObject({code:502});});
 it('응답이 없는 생성기도 제한 시간 신호로 종료한다',async()=>{const controller=new AbortController();const job=handleAsk(payload,{apiKey:'test',generator:()=>new Promise(()=>{}),signal:controller.signal});controller.abort();await expect(job).rejects.toMatchObject({code:504});});
 it('이미 취소된 요청은 생성기를 호출하지 않는다',async()=>{const controller=new AbortController();controller.abort();const generator=vi.fn();await expect(handleAsk(payload,{apiKey:'test',generator,signal:controller.signal})).rejects.toMatchObject({code:504});expect(generator).not.toHaveBeenCalled();});
 it('완료된 실패 메시지에 키 값·외부 오류 전문을 넣지 않는다',()=>{expect(safeError(new Error('private')).message).not.toContain('private');expect(safeError(new AskFailure(503,'설정 필요')).code).toBe(503);});
});
describe('이전 AI 답변 차단',()=>{
 function started(){let s=reducer(initialState,{type:'load',records,filename:'data',warnings:[]});s=reducer(s,{type:'question',value:payload.question});s=reducer(s,{type:'askStart',id:payload.requestId,context,question:payload.question});return s;}
 it('현재 요청의 답변만 표시한다',()=>{const s=started();expect(reducer(s,{type:'askSuccess',id:s.ai.requestId,revision:s.revision,answer:'현재 답변',mock:false}).ai.answer).toBe('현재 답변');expect(reducer(s,{type:'askSuccess',id:'old',revision:s.revision,answer:'이전 답변',mock:false})).toBe(s);});
 it('필터가 A→B→A로 돌아와도 오래된 첫 답변은 버린다',()=>{const s=started();let next=reducer(s,{type:'filter',patch:{region:'인천'}});next=reducer(next,{type:'filter',patch:{region:''}});expect(reducer(next,{type:'askSuccess',id:s.ai.requestId,revision:s.revision,answer:'이전 답변',mock:false}).ai.answer).toBe('');});
 it.each(['load','reset','aiReset'] as const)('%s 이후의 응답·오류를 버리고 기존 자료는 유지한다',type=>{const s=started();const next=type==='load'?reducer(s,{type:'load',records,filename:'new',warnings:[]}):reducer(s,{type});expect(reducer(next,{type:'askError',id:s.ai.requestId,revision:s.revision,message:'이전 오류'}).ai.error).toBe('');expect(next.records).toHaveLength(144);});
 it('실패해도 질문·적용 자료·필터를 유지한다',()=>{const s=started();const next=reducer(s,{type:'askError',id:s.ai.requestId,revision:s.revision,message:'실패'});expect(next.ai.input).toBe(payload.question);expect(next.records).toEqual(records);expect(next.filters).toEqual(s.filters);});
});
