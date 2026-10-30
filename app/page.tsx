'use client';
import {useApp} from '@/state/app';
import {aggregate,fmt,status} from '@/lib/data';
import {FiltersBar,Empty,PageTitle,Scope} from '@/components/common';
import {TrendChart} from '@/components/trend-chart';
import {Inspection} from '@/components/inspection';
import {ExportButton} from '@/components/export-button';
export default function Overview(){
 const {state}=useApp();const result=aggregate(state.records,state.filters);
 const metrics=[['전체 기성률',result.rate,'%','계약금액 대비 누적기성액'],['계획 공정률',result.planned,'%','계약금액 비중을 반영한 계획'],['실제 공정률',result.actual,'%','계약금액 비중을 반영한 실제'],['공정차이',result.gap,'pp','실제 공정률 − 계획 공정률']];
 return <><PageTitle eyebrow="PROJECT OVERVIEW" title="현황 요약" description="전체 흐름을 확인하고, 점검이 필요한 현장을 살펴보세요."><div className="title-actions"><Scope/><ExportButton/></div></PageTitle><FiltersBar/>{!state.records.length?<Empty/>:<><div className="metrics">{metrics.map(([label,value,unit,description],i)=><section className={`metric panel ${i===3&&value!==null?status(value!)==='정상'?'tone-normal':status(value!)==='주의'?'tone-warning':'tone-critical':''}`} key={label!}><p className="metric-label"><i/>{label}</p><div className={`metric-value ${value===null?'unavailable':''}`}>{fmt(value,i===3)}{value!==null&&<span>{unit}</span>}</div><p className="metric-description">{description}</p><div className="metric-footer">{i===0?<><span>누적기성액 <b>{fmt(result.cumulative)}</b></span><span>계약금액 <b>{fmt(result.contract)}</b></span></>:i===3?<span>당월기성액 <b>{fmt(result.monthly)}{result.monthly!==null?' 백만원':''}</b></span>:<span>{result.count}개 현장 · 선택 월 기준</span>}</div></section>)}</div>{state.warnings.length>0&&<div className="notice warning-notice">{state.warnings.join(' ')}</div>}{!result.count?<Empty noMatch/>:<><Inspection/><TrendChart key={JSON.stringify(state.filters)} records={state.records} filters={state.filters}/></>}</>}</>;
}
