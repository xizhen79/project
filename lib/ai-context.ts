import {aggregate,timeline,selectRows,inScope,type SiteRecord,type Filters} from './data';
export function buildAskContext(records:SiteRecord[],filters:Filters){return {filters,units:{money:'백만원',progress:'%',gap:'pp'},summary:aggregate(records,filters),monthlySummary:timeline(records,filters),sourceRows:selectRows(records,filters),historyRows:filters.siteId?records.filter(r=>inScope(r,filters)&&r.month<=filters.month):[],note:'교육용 가상 자료. sourceRows와 historyRows는 원문 기록, summary와 monthlySummary는 프로그램 계산 요약. null은 계산 불가.'};}
export type AskContext=ReturnType<typeof buildAskContext>;
export type AskPayload={question:string;requestId:string;revision:number;context:AskContext};
export type AskResponse={answer:string;requestId:string;model:string;mock:boolean};
export const MODEL='gemini-3.8-flash';
