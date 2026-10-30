import Papa from 'papaparse';
import Decimal from 'decimal.js';

export const D = Decimal.clone({ precision: 40, rounding: Decimal.ROUND_HALF_UP });
export const FIELDS = ['month','siteId','siteName','contractAmount','plannedProgress','actualProgress','cumulativeEarned','region','projectType','startDate','contractEndDate','currentWork','issueCategory','issueSummary','actionPlan'] as const;
export const FIELD_LABELS:Record<typeof FIELDS[number],string>={month:'기준 월',siteId:'현장 ID',siteName:'가상 현장명',contractAmount:'계약금액(백만원)',plannedProgress:'계획 공정률(%)',actualProgress:'실제 공정률(%)',cumulativeEarned:'누적기성액(백만원)',region:'지역',projectType:'공사 유형',startDate:'착공일',contractEndDate:'계약상 준공일',currentWork:'당월 주요 공종',issueCategory:'특이사항 분류',issueSummary:'기록된 상황',actionPlan:'대응 계획'};
export const MONTHS = Array.from({length:12}, (_,i)=>i<3?`2025-${i+10}`:`2026-${String(i-2).padStart(2,'0')}`);
export const REGIONS = ['인천','경기','충남','충북','세종','강원','대전'];
export const TYPES = ['공동주택','물류시설','업무시설','상업시설','생산시설'];
const NUMBERS = ['contractAmount','plannedProgress','actualProgress','cumulativeEarned'] as const;
export type SiteRecord = {month:string;siteId:string;siteName:string;contractAmount:number;plannedProgress:number;actualProgress:number;cumulativeEarned:number;region:string;projectType:string;startDate:string;contractEndDate:string;currentWork:string;issueCategory:string;issueSummary:string;actionPlan:string};
export type Filters = {month:string;region:string;projectType:string;siteId:string};
export type Issue = {row:number;field:string;message:string;value?:string};
export type Inspection = {records:SiteRecord[];errors:Issue[];warnings:string[];rowCount:number;columnCount:number};
export const initialFilters:Filters = {month:'2026-09',region:'',projectType:'',siteId:''};
export function previousMonth(month:string) { const [y,m]=month.split('-').map(Number);return m===1?`${y-1}-12`:`${y}-${String(m-1).padStart(2,'0')}`; }
export function validDate(s:string) { if(!/^\d{4}-\d{2}-\d{2}$/.test(s))return false; const date=new Date(`${s}T00:00:00Z`);return Number.isFinite(date.getTime())&&date.toISOString().slice(0,10)===s; }
function monthEnd(month:string) {const [y,m]=month.split('-').map(Number);return new Date(Date.UTC(y,m,0)).toISOString().slice(0,10);}
function csvRowStarts(text:string) { const result=[1];let quoted=false,line=1;for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"')i++;else quoted=!quoted;}if(c==='\n'){line++;if(!quoted)result.push(line);}}return result; }
export function inspectFile(text:string,format:'csv'|'json'):Inspection {
  const errors:Issue[]=[];const warnings:string[]=[];let entries:{value:unknown;row:number}[]=[];let columns:string[]=[];
  const fail=(field:string,message:string,row=1,value?:unknown)=>errors.push({row,field,message,value:value===undefined?undefined:String(value)});
  try {
    if(format==='csv') {
      const parsed=Papa.parse<string[]>(text.replace(/^\uFEFF/,''),{skipEmptyLines:false});const starts=csvRowStarts(text);
      const rows=parsed.data.map((value,i)=>({value,row:starts[i]??i+1})).filter(e=>e.value.some(v=>v.trim()!==''));
      columns=rows.shift()?.value.map(v=>v.trim())??[];
      if(new Set(columns).size!==columns.length)fail('열 이름','같은 열 이름이 중복되어 있습니다.');
      parsed.errors.forEach(e=>fail('CSV',`파일 형식을 읽을 수 없습니다: ${e.code}`,starts[e.row??0]??1));
      entries=rows.map(e=>{if(e.value.length!==columns.length)fail('CSV','헤더와 값의 개수가 다릅니다.',e.row);return {row:e.row,value:Object.fromEntries(columns.map((key,i)=>[key,e.value[i]]))};});
    } else {
      const json=JSON.parse(text.replace(/^\uFEFF/,''));
      if(!json||typeof json!=='object'||!json.metadata||!Array.isArray(json.records)){fail('JSON','metadata(자료 설명)와 records(자료 행 목록)가 필요합니다.');return {records:[],errors,warnings,rowCount:0,columnCount:0};}
      const meta=json.metadata;
      if(meta.schemaVersion!=='2.0'||meta.moneyUnit!=='백만원'||meta.progressUnit!=='percent_0_100')fail('metadata','버전 2.0·금액 백만원·공정률 % 기준과 다릅니다.');
      if(!Array.isArray(meta.requiredFields)||meta.requiredFields.length!==FIELDS.length||!FIELDS.every(f=>meta.requiredFields.includes(f)))fail('requiredFields','원본 15개 필드 목록과 다릅니다.');
      columns=[...FIELDS];entries=json.records.map((value:unknown,i:number)=>({value,row:i+1}));
    }
  } catch {fail(format.toUpperCase(),'파일 내용을 읽을 수 없습니다. CSV 또는 JSON 형식을 확인하세요.');}
  FIELDS.forEach(f=>{if(!columns.includes(f))fail(f,'필수 열이 없습니다.');});
  if(!entries.length)fail('자료','자료 행이 없습니다.');
  const records:SiteRecord[]=[];const sourceRows=new Map<SiteRecord,number>();
  for(const entry of entries) {
    if(!entry.value||typeof entry.value!=='object'||Array.isArray(entry.value)){fail('행','행은 필드와 값으로 이루어져야 합니다.',entry.row);continue;}
    const raw=entry.value as Record<string,unknown>;const before=errors.length;const row:Record<string,unknown>={};
    for(const field of FIELDS){const value=raw[field];if(value===null||value===undefined||typeof value==='string'&&!value.trim()){fail(field,'필수값이 비어 있습니다.',entry.row,value);continue;}
      if((NUMBERS as readonly string[]).includes(field)){
        if(typeof value!=='number'&&!(format==='csv'&&typeof value==='string'&&/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(value.trim()))){fail(field,'유효한 숫자가 필요합니다.',entry.row,value);continue;}
        const n=Number(value);if(!Number.isFinite(n)){fail(field,'유한한 숫자가 필요합니다.',entry.row,value);continue;}row[field]=n;
      } else {if(typeof value!=='string'){fail(field,'문자 형식이 필요합니다.',entry.row,value);continue;}row[field]=value;}
    }
    if(errors.length!==before)continue;
    const r=row as SiteRecord;
    if(!MONTHS.includes(r.month))fail('month','2025-10~2026-09의 YYYY-MM이어야 합니다.',entry.row,r.month);
    if(!/^[A-L]$/.test(r.siteId))fail('siteId','현장 ID는 A~L입니다.',entry.row,r.siteId);
    if(!r.siteName.startsWith('[가상]'))fail('siteName','가상 현장명에는 [가상] 표시가 필요합니다.',entry.row,r.siteName);
    if(!REGIONS.includes(r.region))fail('region','교육 자료의 지역 목록과 다릅니다.',entry.row,r.region);
    if(!TYPES.includes(r.projectType))fail('projectType','교육 자료의 공사 유형 목록과 다릅니다.',entry.row,r.projectType);
    if(r.contractAmount<=0)fail('contractAmount','계약금액은 0보다 커야 합니다.',entry.row,r.contractAmount);
    for(const field of ['plannedProgress','actualProgress'] as const)if(r[field]<0||r[field]>100)fail(field,'공정률은 0~100이어야 합니다.',entry.row,r[field]);
    if(r.cumulativeEarned<0||r.cumulativeEarned>r.contractAmount)fail('cumulativeEarned','누적기성액은 0 이상·계약금액 이하여야 합니다.',entry.row,r.cumulativeEarned);
    for(const field of ['startDate','contractEndDate'] as const)if(!validDate(r[field]))fail(field,'YYYY-MM-DD의 실제 날짜가 필요합니다.',entry.row,r[field]);
    if(validDate(r.startDate)&&validDate(r.contractEndDate)&&r.startDate>=r.contractEndDate)fail('contractEndDate','계약상 준공일은 착공일보다 뒤여야 합니다.',entry.row,r.contractEndDate);
    if(MONTHS.includes(r.month)&&validDate(r.startDate)&&monthEnd(r.month)<r.startDate)fail('startDate','기록 월말이 착공일보다 이릅니다.',entry.row,r.startDate);
    records.push(r);sourceRows.set(r,entry.row);
  }
  const seen=new Set<string>();const bySite=new Map<string,SiteRecord[]>();
  for(const r of records){const key=`${r.month}/${r.siteId}`;if(seen.has(key))fail('month+siteId','같은 월·현장이 중복되었습니다.',sourceRows.get(r),key);seen.add(key);bySite.set(r.siteId,[...(bySite.get(r.siteId)??[]),r]);}
  for(const rows of bySite.values()){
    rows.sort((a,b)=>a.month.localeCompare(b.month));const first=rows[0];
    rows.forEach((r,i)=>{
      for(const field of ['siteName','region','projectType','contractAmount','startDate','contractEndDate'] as const)if(r[field]!==first[field])fail(field,'같은 현장의 고정 정보가 월마다 다릅니다.',sourceRows.get(r),r[field]);
      if(i)for(const field of ['plannedProgress','actualProgress','cumulativeEarned'] as const)if(r[field]<rows[i-1][field])fail(field,'누적값이 이전 월보다 감소했습니다.',sourceRows.get(r),r[field]);
    });
  }
  if(records.length&&records.length<144)warnings.push(`정상 원본 144행 중 ${records.length}행만 있습니다. 확인 가능한 현장·월만 집계합니다. 전월이 없으면 당월기성액은 계산 불가입니다.`);
  return {records:errors.length?[]:records,errors,warnings,rowCount:entries.length,columnCount:columns.length};
}
export function defaultFilters(records:SiteRecord[]):Filters {return {...initialFilters,month:records.some(r=>r.month==='2026-09')?'2026-09':[...records].sort((a,b)=>a.month.localeCompare(b.month)).at(-1)?.month??'2026-09'};}
export function inScope(r:SiteRecord,f:Filters){return (!f.region||r.region===f.region)&&(!f.projectType||r.projectType===f.projectType)&&(!f.siteId||r.siteId===f.siteId);}
export function normalizeFilters(records:SiteRecord[],f:Filters):Filters {return f.siteId&&!records.some(r=>r.siteId===f.siteId&&(!f.region||r.region===f.region)&&(!f.projectType||r.projectType===f.projectType))?{...f,siteId:''}:f;}
export function selectRows(records:SiteRecord[],f:Filters){return records.filter(r=>r.month===f.month&&inScope(r,f));}
export type Metric=string|null;
export type Status='정상'|'주의'|'점검';
export function gap(r:SiteRecord){return new D(r.actualProgress).minus(r.plannedProgress);}
export function status(value:Decimal.Value):Status {const n=new D(value);return n.gte(0)?'정상':n.lte(-5)?'점검':'주의';}
export function earnedRate(r:SiteRecord){return new D(r.cumulativeEarned).div(r.contractAmount).mul(100).toString();}
export function monthlyEarned(r:SiteRecord,records:SiteRecord[]):Metric {const prev=records.find(p=>p.siteId===r.siteId&&p.month===previousMonth(r.month));return prev?new D(r.cumulativeEarned).minus(prev.cumulativeEarned).toString():null;}
export function compareRows(a:SiteRecord,b:SiteRecord){return gap(a).cmp(gap(b))||a.siteId.localeCompare(b.siteId);}
export function aggregate(records:SiteRecord[],f:Filters){
  const rows=selectRows(records,f);const sum=(field:typeof NUMBERS[number])=>rows.reduce((v,r)=>v.plus(r[field]),new D(0));const contract=sum('contractAmount');const cumulative=sum('cumulativeEarned');
  const weighted=(field:'plannedProgress'|'actualProgress')=>contract.gt(0)?rows.reduce((v,r)=>v.plus(new D(r.contractAmount).mul(r[field])),new D(0)).div(contract):null;
  const planned=weighted('plannedProgress'),actual=weighted('actualProgress');const amounts=rows.map(r=>monthlyEarned(r,records));
  return {count:rows.length,contract:rows.length?contract.toString():null,cumulative:rows.length?cumulative.toString():null,rate:contract.gt(0)?cumulative.div(contract).mul(100).toString():null,planned:planned?.toString()??null,actual:actual?.toString()??null,gap:actual&&planned?actual.minus(planned).toString():null,monthly:rows.length&&amounts.every(n=>n!==null)?amounts.reduce<Decimal>((v,n)=>v.plus(n!),new D(0)).toString():null};
}
export function timeline(records:SiteRecord[],f:Filters){return MONTHS.filter(m=>m<=f.month).map(month=>({month,...aggregate(records,{...f,month})}));}
export function fmt(value:Metric|number,signed=false){if(value===null)return '계산 불가';const n=new D(value);const rounded=n.toDecimalPlaces(1);const display=Number(rounded.isZero()?0:rounded.toString()).toLocaleString('ko-KR',{minimumFractionDigits:1,maximumFractionDigits:1});return signed&&rounded.gt(0)?`+${display}`:display;}
