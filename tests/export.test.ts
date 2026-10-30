import {it,expect,describe} from 'vitest';
import {readFileSync} from 'node:fs';
import Papa from 'papaparse';
import {inspectFile,initialFilters} from '@/lib/data';
import {makeCsv,EXPORT_FIELDS} from '@/lib/export';
const records=inspectFile(readFileSync('data/현장공정기성.csv','utf8'),'csv').records;
describe('CSV 내보내기',()=>{
 it.each([['D','','',1],['','인천','공동주택',2],['','','',12]])('현재 월·필터만 내보낸다', (siteId,region,projectType,count)=>{const csv=makeCsv(records,{...initialFilters,siteId:String(siteId),region:String(region),projectType:String(projectType)});expect(csv.charCodeAt(0)).toBe(0xFEFF);const result=Papa.parse<Record<string,string>>(csv,{header:true,skipEmptyLines:true});expect(result.data).toHaveLength(Number(count));expect(result.meta.fields).toEqual(EXPORT_FIELDS);expect(result.data.every(r=>r.month==='2026-09')).toBe(true);expect(inspectFile(csv,'csv').errors).toEqual([]);});
 it('금액·단위·정확한 계산값과 원문을 유지한다',()=>{const csv=makeCsv(records,{...initialFilters,siteId:'D'});const r=Papa.parse<Record<string,string>>(csv,{header:true}).data[0];expect(r.contractAmount).toBe('72600');expect(r['기성률(%)']).toBe('69.4');expect(r['공정차이(pp)']).toBe('-10.7');expect(r['당월기성액(백만원)']).toBe('3339.6');expect(r.siteName).toContain('[가상]');expect(EXPORT_FIELDS).toHaveLength(19);});
 it('첫 달 계산 불가와 J의 7월 정상 0.0을 구별한다',()=>{const first=Papa.parse<Record<string,string>>(makeCsv(records,{...initialFilters,month:'2025-10'}),{header:true}).data[0];expect(first['당월기성액(백만원)']).toBe('계산 불가');const j=Papa.parse<Record<string,string>>(makeCsv(records,{...initialFilters,month:'2026-07',siteId:'J'}),{header:true}).data[0];expect(j['당월기성액(백만원)']).toBe('0.0');});
 it('쉼표·따옴표·줄바꿈이 있는 기록을 재가져와도 보존한다',()=>{const copy=structuredClone(records);copy.find(r=>r.month==='2026-09'&&r.siteId==='D')!.issueSummary='현장, 기록 "확인"\n다음 줄';const csv=makeCsv(copy,{...initialFilters,siteId:'D'});expect(inspectFile(csv,'csv').records[0].issueSummary).toBe('현장, 기록 "확인"\n다음 줄');});
});
