import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {FIELDS,inspectFile,aggregate,fmt,MONTHS,initialFilters,normalizeFilters,previousMonth,monthlyEarned,selectRows,timeline,status,compareRows,defaultFilters} from '@/lib/data';
import {initialState,reducer} from '@/state/app';
const raw=JSON.parse(readFileSync('data/현장공정기성.json','utf8'));
const csv=readFileSync('data/현장공정기성.csv','utf8');
const source=inspectFile(JSON.stringify(raw),'json').records;
function changed(edit:(v:typeof raw)=>void){const value=structuredClone(raw);edit(value);return inspectFile(JSON.stringify(value),'json');}
describe('자료 전체 검사',()=>{
 it('CSV와 JSON의 원본 15개 열·144행이 같다',()=>{const a=inspectFile(csv,'csv');expect(a.errors).toEqual([]);expect(a.rowCount).toBe(144);expect(a.columnCount).toBe(15);expect(a.records).toEqual(source);expect(source).toHaveLength(144);});
 it.each(['오류_중복키','오류_공정률101','오류_공정률빈값'])('%s 파일을 거부한다',name=>{const result=inspectFile(readFileSync(`data/검증용_오류데이터/${name}.csv`,'utf8'),'csv');expect(result.records).toHaveLength(0);expect(result.errors.some(e=>e.row===(name==='오류_중복키'?146:134))).toBe(true);});
 it.each([
  ['필수값',(v:typeof raw)=>{v.records[0].actualProgress='';}],
  ['숫자 문자',(v:typeof raw)=>{v.records[0].actualProgress='20';}],
  ['잘못된 공정률',(v:typeof raw)=>{v.records[0].actualProgress=101;}],
  ['계약금액 0',(v:typeof raw)=>{v.records[0].contractAmount=0;}],
  ['누적기성 초과',(v:typeof raw)=>{v.records[0].cumulativeEarned=1000000;}],
  ['없는 날짜',(v:typeof raw)=>{v.records[0].startDate='2024-02-30';}],
  ['날짜 순서',(v:typeof raw)=>{v.records[0].startDate='2028-01-01';}],
  ['누적 감소',(v:typeof raw)=>{v.records[12].cumulativeEarned=1;}],
  ['고정 현장 정보',(v:typeof raw)=>{v.records[12].region='경기';}],
  ['월 범위',(v:typeof raw)=>{v.records[0].month='2026-10';}],
  ['JSON 단위',(v:typeof raw)=>{v.metadata.moneyUnit='원';}],
  ['필수 필드 목록',(v:typeof raw)=>{v.metadata.requiredFields.pop();}]
 ])('%s 오류를 거부한다',(_,edit)=>{expect(changed(edit).errors.length).toBeGreaterThan(0);});
 it('JSON·CSV 형식과 중복 헤더·비어 있는 파일 오류를 표시한다',()=>{for(const [text,type] of [['{','json'],['','csv'],['month,month\n2026-09,2026-09','csv']] as const)expect(inspectFile(text,type).errors.length).toBeGreaterThan(0);});
 it('일부 자료를 허용하고 누락 경고를 보여 준다',()=>{const r=changed(v=>{v.records=v.records.slice(-12);});expect(r.errors).toEqual([]);expect(r.records).toHaveLength(12);expect(r.warnings.length).toBeGreaterThan(0);});
 it('CSV 따옴표 안의 줄바꿈·쉼표를 보존한다',()=>{const lines=csv.replace('계획된 기초·지하구조 작업을 진행했으며 주요 중단 사항은 보고되지 않음.','"상황, 기록\n둘째 줄"');const result=inspectFile(lines,'csv');expect(result.errors).toEqual([]);expect(result.records[0].issueSummary).toBe('상황, 기록\n둘째 줄');});
});
describe('검산표 월별 숫자와 상태',()=>{
 const expected=[['105449.7','16.7','19.4','19.6','0.2',null],['125857.8','20.0','22.8','23.2','0.3','20408.1'],['148530.2','23.6','26.9','27.0','0.2','22672.4'],['173599.9','27.5','31.4','31.3','-0.1','25069.7'],['202848.9','32.2','36.7','36.2','-0.4','29249.0'],['233981.1','37.1','42.4','41.6','-0.8','31132.2'],['266640.0','42.3','48.6','47.1','-1.5','32658.9'],['300878.0','47.7','54.8','52.9','-1.9','34238.0'],['335344.9','53.2','60.7','58.3','-2.4','34466.9'],['364718.5','57.8','65.8','63.2','-2.6','29373.6'],['395184.7','62.7','69.9','67.6','-2.3','30466.2'],['424063.4','67.2','73.2','71.2','-2.0','28878.7']];
 it.each(MONTHS.map((month,i)=>({month,want:expected[i]})))('$month의 검산값이 맞다',({month,want})=>{const a=aggregate(source,{...initialFilters,month});expect(a.count).toBe(12);expect(a.contract).toBe('630700');for(const [i,key] of (['cumulative','rate','planned','actual','gap','monthly'] as const).entries())expect(a[key]===null?null:fmt(a[key]).replaceAll(',','')).toBe(want[i]);});
 it('당월은 바로 전월과만 비교하고 J 7월 0.0은 보존한다',()=>{const r=source.find(r=>r.siteId==='J'&&r.month==='2026-07')!;expect(monthlyEarned(r,source)).toBe('0');expect(monthlyEarned(r,source.filter(r=>r.month!=='2026-06'))).toBeNull();expect(previousMonth('2026-01')).toBe('2025-12');expect(aggregate(source.filter(r=>!(r.siteId==='A'&&r.month==='2026-08')),initialFilters).monthly).toBeNull();});
 it('전체 누적액에 다른 달이 중복 합산되지 않는다',()=>{expect(aggregate(source,initialFilters).cumulative).toBe('424063.4');});
 it('D 기성률과 점검 순서·상태 수가 맞다',()=>{expect(fmt(aggregate(source,{...initialFilters,siteId:'D'}).rate)).toBe('69.4');const rows=selectRows(source,initialFilters).sort(compareRows);expect(rows.filter(r=>status(r.actualProgress-r.plannedProgress)==='점검').map(r=>r.siteId)).toEqual(['D','I','K']);expect(rows.filter(r=>status(r.actualProgress-r.plannedProgress)==='정상')).toHaveLength(6);});
 it.each([[0,'정상'],[-4.9,'주의'],[-5,'점검'],[-4.9999,'주의']])('경계값 %s를 반올림 전에 판정한다',(n,want)=>{expect(status(n)).toBe(want);});
 it('지역·유형 필터와 없는 범위를 구분한다',()=>{const f={...initialFilters,region:'인천',projectType:'공동주택'};expect(selectRows(source,f).map(r=>r.siteId)).toEqual(['A','G']);expect(fmt(aggregate(source,f).rate)).toBe('61.2');expect(aggregate(source,{...f,projectType:'생산시설'}).rate).toBeNull();expect(timeline(source,{...f,month:'2026-08'})).toHaveLength(11);});
});
describe('자료·필터의 공통 상태',()=>{
 it('CSV 다음 JSON도 144행으로 교체한다',()=>{const s=reducer(initialState,{type:'load',records:source,filename:'one.csv',warnings:[]});const second=reducer(s,{type:'load',records:source,filename:'two.json',warnings:[]});expect(second.records).toHaveLength(144);expect(second.revision).toBe(2);});
 it('지역 변경으로 범위를 벗어난 현장은 전체로 되돌린다',()=>{expect(normalizeFilters(source,{...initialFilters,siteId:'D',region:'인천'}).siteId).toBe('');});
 it('펼침과 강조는 필터 변경 때 해제하고 변경 번호를 증가시킨다',()=>{let s=reducer(initialState,{type:'load',records:source,filename:'data',warnings:[]});s=reducer(s,{type:'focus',id:'D'});const next=reducer(s,{type:'filter',patch:{region:'인천'}});expect(next.expanded).toEqual([]);expect(next.focus).toBe('');expect(next.revision).toBe(s.revision+1);});
 it('일부 파일의 마지막 월을 기본 조회로 선택한다',()=>{expect(defaultFilters(source.filter(r=>r.month==='2026-07')).month).toBe('2026-07');expect(FIELDS).toHaveLength(15);});
});
