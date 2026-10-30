import type { Metadata } from 'next';
import { AppProvider } from '@/state/app';
import {Header,Footer} from '@/components/common';
import './globals.css';
import '@/styles/inspection.css';
import '@/styles/ai.css';
export const metadata:Metadata={title:'현장 공정·기성 | 교육용 대시보드',description:'가상 현장의 월별 공정과 기성을 비교하고 점검하는 교육용 대시보드'};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="ko"><body><AppProvider><Header/><main>{children}</main><Footer/></AppProvider></body></html>;}
