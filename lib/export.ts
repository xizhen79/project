import Papa from 'papaparse';
import {FIELDS,selectRows,earnedRate,gap,status,monthlyEarned,fmt,type SiteRecord,type Filters} from './data';
export const EXPORT_FIELDS=[...FIELDS,'기성률(%)','공정차이(pp)','상태','당월기성액(백만원)'];
export function makeCsv(records:SiteRecord[],filters:Filters){const rows=selectRows(records,filters);return '\uFEFF'+Papa.unparse({fields:EXPORT_FIELDS,data:rows.map(r=>[...FIELDS.map(f=>r[f]),fmt(earnedRate(r)).replaceAll(',',''),fmt(gap(r).toString()).replaceAll(',',''),status(gap(r)),fmt(monthlyEarned(r,records)).replaceAll(',','')])},{newline:'\r\n'});}
