// 로또 6/45 당첨번호 파일(data/lotto645.json)을 만들거나 새 회차를 덧붙인다.
// 사용: node scripts/update-lotto645.mjs
// 동행복권 추첨결과 화면이 쓰는 주소에서 받는다. 한 번 요청하면 지정한 회차 근처 10회차(회차-5 ~ 회차+4)가 온다.
// 이미 있는 회차는 다시 받지 않으므로, 매주 실행하면 새 회차만 추가된다.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const FILE = fileURLToPath(new URL('../data/lotto645.json', import.meta.url));
const API = 'https://www.dhlottery.co.kr/lt645/selectPstLt645InfoNew.do?srchDir=center&srchLtEpsd=';
const FIELDS = ['round', 'date', 'n1', 'n2', 'n3', 'n4', 'n5', 'n6', 'bonus', 'prize1', 'prize2', 'prize3', 'prize4', 'prize5'];
const DELAY_MS = 700; // 동행복권 서버에 부담을 주지 않도록 요청 사이를 띄운다

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function fetchAround(round) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(API + round, {
        headers: { 'User-Agent': 'Mozilla/5.0 (cloverpick.app lotto results updater)', 'Accept': 'application/json' },
        redirect: 'manual',
      });
      if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const list = json?.data?.list;
      if (!Array.isArray(list)) throw new Error('응답에 data.list가 없음');
      return list;
    } catch (err) {
      if (attempt === 3) throw new Error(`${round}회 근처 요청 실패: ${err.message}`);
      await sleep(DELAY_MS * attempt * 2);
    }
  }
}

function toRow(it) {
  const nums = [it.tm1WnNo, it.tm2WnNo, it.tm3WnNo, it.tm4WnNo, it.tm5WnNo, it.tm6WnNo].map(Number).sort((a, b) => a - b);
  const bonus = Number(it.bnsWnNo);
  const ymd = String(it.ltRflYmd);
  const row = [Number(it.ltEpsd), `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}`, ...nums, bonus,
    ...[1, 2, 3, 4, 5].map(k => Number(it[`rnk${k}WnAmt`]) || 0)];
  const all = [...nums, bonus];
  if (!Number.isInteger(row[0]) || row[0] < 1) throw new Error(`잘못된 회차: ${JSON.stringify(it)}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(row[1])) throw new Error(`${row[0]}회 날짜 형식 오류: ${ymd}`);
  if (all.some(n => !Number.isInteger(n) || n < 1 || n > 45) || new Set(all).size !== 7) {
    throw new Error(`${row[0]}회 번호 오류: ${all.join(',')}`);
  }
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
  const startLast = rows.length ? Math.max(...byRound.keys()) : 0;
  let last = startLast;

  // 마지막 회차 다음부터 10회차씩 받는다. 새 회차가 하나도 안 오면 최신까지 받은 것.
  while (true) {
    const list = await fetchAround(last + 6);
    let added = 0;
    for (const it of list) {
      const row = toRow(it);
      if (!byRound.has(row[0])) { byRound.set(row[0], row); added++; }
    }
    const newLast = Math.max(...byRound.keys(), 0);
    if (!added || newLast <= last) break;
    last = newLast;
    process.stdout.write(`\r${last}회까지 받음`);
    await sleep(DELAY_MS);
  }
  process.stdout.write('\n');

  const draws = [...byRound.values()].sort((a, b) => a[0] - b[0]);
  // 1회부터 빠진 회차가 없는지 확인
  draws.forEach((r, i) => { if (r[0] !== i + 1) throw new Error(`${i + 1}회가 빠짐`); });

  if (draws.length === rows.length) {
    console.log(`새 회차 없음 (최신 ${last}회)`);
  } else {
    const out = { fields: FIELDS, latest: draws.at(-1)[0], draws };
    // 회차마다 한 줄로 써서 git diff에서 추가된 회차가 잘 보이게 한다
    const text = '{\n' +
      `  "fields": ${JSON.stringify(out.fields)},\n` +
      `  "latest": ${out.latest},\n` +
      '  "draws": [\n' + draws.map(r => '    ' + JSON.stringify(r)).join(',\n') + '\n  ]\n}\n';
    await mkdir(dirname(FILE), { recursive: true });
    await writeFile(FILE, text);
    console.log(`${draws.length - rows.length}개 회차 추가 (${startLast + 1}~${out.latest}회), 파일: data/lotto645.json`);
  }

  // --check-fresh: 최신 회차 추첨일이 한국 날짜로 8일 이상 지났으면 실패로 끝낸다 (새 회차를 못 받아온 것).
  // 토요일 밤 실행에서는 지난 회차가 7일 전이라 통과하고, 일요일 아침에도 새 회차가 없으면 8일이 되어 알린다
  if (process.argv.includes('--check-fresh')) {
    const latestDate = draws.at(-1)[1];
    const todayKst = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
    const days = Math.round((Date.parse(todayKst) - Date.parse(latestDate)) / 86400000);
    if (days >= 8) throw new Error(`최신 회차(${draws.at(-1)[0]}회, ${latestDate})가 ${days}일 전입니다. 새 회차를 받아오지 못했습니다.`);
    console.log(`최신 회차 ${draws.at(-1)[0]}회 (${latestDate}, ${days}일 전)`);
  }
}

main().catch(err => { console.error(err.message); process.exit(1); });
