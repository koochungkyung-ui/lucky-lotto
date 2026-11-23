// 연금복권720+ 당첨번호 파일(data/pension720.json)을 만들거나 새 회차를 덧붙인다.
// 사용: node scripts/update-pension720.mjs [--check-fresh]
// 동행복권 연금복권 추첨결과 화면이 쓰는 주소(/pt720/selectPstPt720WnList.do)에서 받는다.
// 이 주소는 한 번에 1회부터 최신 회차까지 모두 돌려준다(회차, 추첨일, 1등 조, 1등 6자리, 보너스 6자리).
// 등수별 당첨금은 회차마다 같으므로(1등 월 700만원×20년 등) 파일에 넣지 않고 앱에 고정값으로 둔다.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const FILE = fileURLToPath(new URL('../data/pension720.json', import.meta.url));
const API = 'https://www.dhlottery.co.kr/pt720/selectPstPt720WnList.do';
const FIELDS = ['round', 'date', 'group', 'number', 'bonus'];
const ATTEMPTS = 5; // 네트워크가 잠깐 끊기는 경우를 대비해 2·4·8·16초 쉬며 5번까지 시도

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function fetchAll() {
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    try {
      const res = await fetch(API, {
        headers: { 'User-Agent': 'Mozilla/5.0 (cloverpick.app lotto results updater)', 'Accept': 'application/json' },
        redirect: 'manual',
        signal: AbortSignal.timeout(20000),
      });
      if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const list = json?.data?.result;
      if (!Array.isArray(list) || !list.length) throw new Error('응답에 data.result가 없음');
      return list;
    } catch (err) {
      if (attempt === ATTEMPTS) throw new Error(`연금복권 회차 목록 요청 실패: ${err.message}`);
      await sleep(1000 * 2 ** attempt);
    }
  }
}

function toRow(it) {
  const ymd = String(it.psltRflYmd);
  const row = [Number(it.psltEpsd), `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}`,
    Number(it.wnBndNo), String(it.wnRnkVl), String(it.bnsRnkVl)];
  if (!Number.isInteger(row[0]) || row[0] < 1) throw new Error(`잘못된 회차: ${JSON.stringify(it)}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(row[1])) throw new Error(`${row[0]}회 날짜 형식 오류: ${ymd}`);
  if (!Number.isInteger(row[2]) || row[2] < 1 || row[2] > 5) throw new Error(`${row[0]}회 조 오류: ${it.wnBndNo}`);
  if (!/^\d{6}$/.test(row[3]) || !/^\d{6}$/.test(row[4])) throw new Error(`${row[0]}회 번호 오류: ${row[3]} / ${row[4]}`);
  return row;
}

async function main() {
  let rows = [];
  try {
    rows = JSON.parse(await readFile(FILE, 'utf8')).draws;
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
  const byRound = new Map(rows.map(r => [r[0], r]));
  const before = byRound.size;

  for (const it of await fetchAll()) {
    const row = toRow(it);
    if (!byRound.has(row[0])) byRound.set(row[0], row);
  }

  const draws = [...byRound.values()].sort((a, b) => a[0] - b[0]);
  draws.forEach((r, i) => { if (r[0] !== i + 1) throw new Error(`${i + 1}회가 빠짐`); });

  if (draws.length === before) {
    console.log(`새 회차 없음 (최신 ${draws.at(-1)[0]}회)`);
  } else {
    // 회차마다 한 줄로 써서 git diff에서 추가된 회차가 잘 보이게 한다
    const text = '{\n' +
      `  "fields": ${JSON.stringify(FIELDS)},\n` +
      `  "latest": ${draws.at(-1)[0]},\n` +
      '  "draws": [\n' + draws.map(r => '    ' + JSON.stringify(r)).join(',\n') + '\n  ]\n}\n';
    await mkdir(dirname(FILE), { recursive: true });
    await writeFile(FILE, text);
    console.log(`${draws.length - before}개 회차 추가 (${before + 1}~${draws.at(-1)[0]}회), 파일: data/pension720.json`);
  }

  // --check-fresh: 최신 회차 추첨일(목요일)이 한국 날짜로 8일 이상 지났으면 실패로 끝낸다 (새 회차를 못 받아온 것)
  if (process.argv.includes('--check-fresh')) {
    const latestDate = draws.at(-1)[1];
    const todayKst = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
    const days = Math.round((Date.parse(todayKst) - Date.parse(latestDate)) / 86400000);
    if (days >= 8) throw new Error(`최신 회차(${draws.at(-1)[0]}회, ${latestDate})가 ${days}일 전입니다. 새 회차를 받아오지 못했습니다.`);
    console.log(`최신 회차 ${draws.at(-1)[0]}회 (${latestDate}, ${days}일 전)`);
  }
}

main().catch(err => { console.error(err.message); process.exit(1); });
