// @vitest-environment jsdom
import {describe,it,expect,vi,afterEach,beforeEach} from 'vitest';
import {render,screen,cleanup,waitFor,act} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {readFileSync} from 'node:fs';
import type {ReactNode} from 'react';
import {AppProvider,useApp} from '@/state/app';
import {inspectFile} from '@/lib/data';
import ImportPage from '@/app/import/page';
import Overview from '@/app/page';
import Comparison from '@/app/comparison/page';
import Ask from '@/app/ask/page';
const {push}=vi.hoisted(()=>({push:vi.fn()}));
vi.mock('next/navigation',()=>({useRouter:()=>({push}),usePathname:()=>'/'}));
const csv=readFileSync('data/현장공정기성.csv','utf8');
const records=inspectFile(csv,'csv').records;
function Seed(){const {state,dispatch}=useApp();return <><button onClick={()=>dispatch({type:'load',records,filename:'data.csv',warnings:[]})}>자료 준비</button><output aria-label="적용 자료 수">{state.records.length}</output></>;}
function view(child:ReactNode){return <AppProvider><Seed/>{child}</AppProvider>;}
beforeEach(()=>{HTMLElement.prototype.scrollIntoView=vi.fn();push.mockClear();});
afterEach(()=>{cleanup();vi.unstubAllGlobals();});
describe('화면 동작 자동 검사 — 실제 브라우저 시각 검증과 구분',()=>{
 it('파일 선택·미리보기·전체 교체·JSON 재교체·오류·취소가 동작한다',async()=>{
  const user=userEvent.setup();render(view(<ImportPage/>));const input=screen.getByLabelText('CSV 또는 JSON 파일 선택');
  await user.upload(input,new File([csv],'data.csv',{type:'text/csv'}));await screen.findByText('검사 통과');expect(screen.getByLabelText('적용 자료 수').textContent).toBe('0');
  await user.click(screen.getByRole('button',{name:'데이터 전체 교체 적용하기'}));expect(screen.getByLabelText('적용 자료 수').textContent).toBe('144');
  await user.upload(input,new File([readFileSync('data/현장공정기성.json','utf8')],'data.json',{type:'application/json'}));await screen.findByText('검사 통과');await user.click(screen.getByRole('button',{name:'데이터 전체 교체 적용하기'}));expect(screen.getByLabelText('적용 자료 수').textContent).toBe('144');
  await user.upload(input,new File([readFileSync('data/검증용_오류데이터/오류_공정률빈값.csv','utf8')],'error.csv',{type:'text/csv'}));await screen.findByRole('alert');expect((screen.getByRole('button',{name:'데이터 전체 교체 적용하기'}) as HTMLButtonElement).disabled).toBe(true);expect(screen.getByLabelText('적용 자료 수').textContent).toBe('144');await user.click(screen.getByRole('button',{name:'취소하고 기존 자료 유지'}));expect(screen.queryByRole('alert')).toBeNull();
 });
 it('필터·숫자·계산 불가와 정상 0.0을 화면에서 구별한다',async()=>{
  const user=userEvent.setup();const root=render(view(<Overview/>));await user.click(screen.getByText('자료 준비'));expect(root.container.querySelector('.metrics')?.textContent).toContain('67.2');
  await user.selectOptions(screen.getByLabelText('지역'),'인천');await user.selectOptions(screen.getByLabelText('공사 유형'),'공동주택');expect(root.container.querySelector('.metrics')?.textContent).toContain('61.2');expect(screen.getByText('점검 대상이 없습니다')).toBeTruthy();
  await user.click(screen.getByRole('button',{name:/필터 초기화/}));await user.selectOptions(screen.getByLabelText('현장'),'D');await user.selectOptions(screen.getByLabelText('지역'),'인천');expect((screen.getByLabelText('현장') as HTMLSelectElement).value).toBe('');
  await user.click(screen.getByRole('button',{name:/필터 초기화/}));await user.selectOptions(screen.getByLabelText('현장'),'J');await user.selectOptions(screen.getByLabelText('기준 월'),'2026-07');expect(root.container.querySelectorAll('.metric-footer')[3].textContent).toContain('0.0 백만원');
  await user.selectOptions(screen.getByLabelText('기준 월'),'2025-10');expect(root.container.querySelectorAll('.metric-footer')[3].textContent).toContain('계산 불가');expect(root.container.querySelectorAll('.month-buttons button')).toHaveLength(1);
 });
 it('두 현장의 기록을 함께 펼치고 전체 접기로 닫는다',async()=>{const user=userEvent.setup();render(view(<Comparison/>));await user.click(screen.getByText('자료 준비'));expect(screen.getAllByRole('row')).toHaveLength(13);await user.click(screen.getByLabelText('D 기록 펼침'));await user.click(screen.getByLabelText('I 기록 펼침'));expect(screen.getByLabelText('D 기록 접기').getAttribute('aria-expanded')).toBe('true');expect(screen.getByText('골조 자재 공급 정상화 후 작업면 추가 운영 중. 최근 누적 공정차이는 줄고 있으나 지연이 남아 있음.')).toBeTruthy();expect(screen.getAllByRole('row')).toHaveLength(15);await user.click(screen.getByRole('button',{name:'전체 접기'}));expect(screen.getAllByRole('row')).toHaveLength(13);});
 it('점검 순위 클릭은 필터를 유지한 비교표의 행을 강조·펼친다',async()=>{const user=userEvent.setup();const root=render(view(<Overview/>));await user.click(screen.getByText('자료 준비'));await user.click(screen.getByRole('button',{name:/김포 공동주택 신축/}));expect(push).toHaveBeenCalledWith('/comparison');root.rerender(view(<Comparison/>));expect(root.container.querySelector('.focused-row')?.textContent).toContain('[가상] 김포');expect(screen.getByLabelText('D 기록 접기')).toBeTruthy();expect(screen.getAllByRole('row')).toHaveLength(14);});
 it('AI 대기 중 필터 변경 후 돌아온 오래된 답변을 표시하지 않는다',async()=>{const user=userEvent.setup();let finish!:(v:unknown)=>void;vi.stubGlobal('fetch',vi.fn(()=>new Promise(resolve=>{finish=resolve;})));render(view(<Ask/>));await user.click(screen.getByText('자료 준비'));await user.selectOptions(screen.getByLabelText('현장'),'D');await user.click(screen.getByRole('button',{name:/D 현장은 왜 점검 대상이고/}));await user.click(screen.getByRole('button',{name:/질문 전송/}));expect(screen.getByText('AI 답변을 기다리는 중입니다')).toBeTruthy();await user.selectOptions(screen.getByLabelText('지역'),'인천');await act(async()=>{finish({ok:true,headers:new Headers(),json:async()=>({answer:'이전 D 답변',requestId:'1',model:'gemini-3.8-flash',mock:false})});});expect(screen.queryByText('이전 D 답변')).toBeNull();expect(screen.queryByText('AI 답변을 기다리는 중입니다')).toBeNull();});
 it('필터 변경 직후에는 이전 응답을 기다리지 않고 새 질문을 전송한다',async()=>{const user=userEvent.setup();const finishes:((value:unknown)=>void)[]=[];const fetchMock=vi.fn(()=>new Promise(resolve=>finishes.push(resolve)));vi.stubGlobal('fetch',fetchMock);render(view(<Ask/>));await user.click(screen.getByText('자료 준비'));await user.click(screen.getByRole('button',{name:/D 현장은 왜 점검 대상이고/}));await user.click(screen.getByRole('button',{name:/질문 전송/}));await user.selectOptions(screen.getByLabelText('지역'),'인천');await user.type(screen.getByLabelText('AI 질문'),'현재 범위 요약');await user.click(screen.getByRole('button',{name:/질문 전송/}));expect(fetchMock).toHaveBeenCalledTimes(2);await act(async()=>{finishes[0]({ok:true,headers:new Headers(),json:async()=>({answer:'이전 전체 답변',requestId:'1',mock:true})});finishes[1]({ok:true,headers:new Headers(),json:async()=>({answer:'새 인천 범위 답변',requestId:'2',mock:true})});});expect(screen.queryByText('이전 전체 답변')).toBeNull();expect(screen.getByText('새 인천 범위 답변')).toBeTruthy();});
 it('모의 실패를 구분하고 실패 후에도 질문과 조회 자료를 유지한다',async()=>{const user=userEvent.setup();vi.stubGlobal('fetch',vi.fn(async()=>({ok:false,headers:new Headers({'X-Dashboard-AI-Mode':'mock'}),json:async()=>({error:'모의 연결 실패',mock:true})})));render(view(<Ask/>));await user.click(screen.getByText('자료 준비'));await user.click(screen.getByRole('button',{name:/실제 준공일과 미수금은/}));await user.click(screen.getByRole('button',{name:/질문 전송/}));await waitFor(()=>expect(screen.getByRole('alert').textContent).toContain('모의 연결 실패'));expect(screen.getByText('모의 응답')).toBeTruthy();expect((screen.getByLabelText('AI 질문') as HTMLTextAreaElement).value).toContain('실제 준공일');expect(screen.getByLabelText('적용 자료 수').textContent).toBe('144');await user.click(screen.getByRole('button',{name:/대화 초기화/}));expect(screen.queryByRole('alert')).toBeNull();expect(screen.getByLabelText('적용 자료 수').textContent).toBe('144');});
});
