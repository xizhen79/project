import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {aggregate,timeline,selectRows,inScope,initialFilters} from '../lib/data.ts';
const {records}=JSON.parse(await readFile(new URL('../data/현장공정기성.json',import.meta.url),'utf8'));
const base=process.argv[2]??'http://127.0.0.1:3210';
const cases=[['D','D 현장은 왜 점검 대상이고 기록된 대응 계획은 무엇인가요?'],['D','8월 대비 9월 공정차이 추이와 현재 상태를 설명해 주세요.'],['J','7월 당월기성액이 왜 0.0이었나요?'],['D','실제 준공일과 미수금은 얼마인가요?']];
const result=[];
for(const [siteId,question] of cases){const filters={...initialFilters,siteId};const context={filters,units:{money:'백만원',progress:'%',gap:'pp'},summary:aggregate(records,filters),monthlySummary:timeline(records,filters),sourceRows:selectRows(records,filters),historyRows:records.filter(r=>inScope(r,filters)&&r.month<=filters.month),note:'교육용 가상 원문·프로그램 계산 요약'};
 try{const response=await fetch(`${base}/api/ask`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question,context,requestId:`verification-${result.length+1}`,revision:1}),signal:AbortSignal.timeout(35000)});const value=await response.json();result.push({question,status:response.status,model:value.model??null,mock:value.mock??false,answer:value.answer??null,error:value.error??null});console.log(JSON.stringify(result.at(-1)));if(!response.ok)break;}
 catch{result.push({question,status:0,error:'로컬 AI 요청을 완료하지 못했습니다.'});console.log(JSON.stringify(result.at(-1)));break;}
}
await mkdir(new URL('../.local/',import.meta.url),{recursive:true});
await writeFile(new URL('../.local/ai-verification.json',import.meta.url),JSON.stringify({results:result,planned:cases.length},null,2));
