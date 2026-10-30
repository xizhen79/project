import {readdir,readFile,writeFile,mkdir} from 'node:fs/promises';
import {join} from 'node:path';
const base=process.argv[2]??'http://127.0.0.1:3210';
const results=[];
for(const [path,title] of [['/','현황 요약'],['/import','자료 가져오기'],['/comparison','현장별 비교표'],['/ask','AI에게 묻기']]){const response=await fetch(base+path);const html=await response.text();results.push({item:`화면 ${path}`,passed:response.status===200&&html.includes(`<h1>${title}</h1>`),status:response.status});}
for(const path of ['/.env.local','/.git/config']){const response=await fetch(base+path);results.push({item:`비공개 파일 ${path}`,passed:response.status===404,status:response.status});}
const invalid=await fetch(base+'/api/ask',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});results.push({item:'잘못된 AI 요청 거부',passed:invalid.status===400&&invalid.headers.get('Cache-Control')==='no-store',status:invalid.status});
const unsupported=await fetch(base+'/api/ask');results.push({item:'AI GET 요청 거부',passed:unsupported.status===405,status:unsupported.status});
// The credential is used only inside this process for an exact-match leak check.
// Neither the credential nor file contents are printed or written into the report.
process.loadEnvFile('.env.local');
const key=process.env.GEMINI_API_KEY;
let checked=0,leaked=false;
async function scan(path){for(const entry of await readdir(path,{withFileTypes:true})){const target=join(path,entry.name);if(entry.isDirectory())await scan(target);else{checked++;if(key&&key.length>=12&&(await readFile(target)).includes(Buffer.from(key)))leaked=true;}}}
await scan('.next/static');
results.push({item:'브라우저 배포 파일의 키 비노출',passed:!!key&&key.length>=12&&!leaked,checkedFiles:checked});
const ignore=await readFile('.gitignore','utf8');results.push({item:'로컬 환경 파일 제외 규칙',passed:ignore.split(/\r?\n/).includes('.env*.local')});
await mkdir('.local',{recursive:true});await writeFile('.local/local-verification.json',JSON.stringify({results},null,2));
console.log(JSON.stringify({results},null,2));if(results.some(r=>!r.passed))process.exitCode=1;
