'use client';
import {useState} from 'react';
import {useApp} from '@/state/app';
import {selectRows} from '@/lib/data';
import {makeCsv} from '@/lib/export';
import styles from './export-button.module.css';
export function ExportButton(){const {state}=useApp();const [notice,setNotice]=useState('');const rows=selectRows(state.records,state.filters);function download(){try{const blob=new Blob([makeCsv(state.records,state.filters)],{type:'text/csv;charset=utf-8;'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`현장공정기성_${state.filters.month}_${state.filters.siteId||'선택범위'}.csv`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);setNotice(`${rows.length}행 CSV를 내려받았습니다.`);}catch{setNotice('다운로드를 시작하지 못했습니다. 다시 시도해 주세요. 자료는 유지됩니다.');}}return <div className={styles.control}><button className="button dark" disabled={!rows.length} onClick={download}>↓ CSV 내보내기</button><span className={styles.notice} role="status">{notice}</span></div>;}
