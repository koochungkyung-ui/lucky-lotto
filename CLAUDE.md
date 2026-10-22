# 행운의 로또 번호 생성기 & 포춘 스케치북

빌드 도구 없이 `index.html` 한 파일(HTML·CSS·JS)로 만든 정적 웹앱입니다. 화면 하나에 탭 5개(🍀 로또 · 🔮 운세 · 🃏 타로 · ✏️ 스케치북 · 📮 제휴)가 있고, 한국어·영어·중국어·일본어를 지원합니다.

- 사이트: https://cloverpick.app/ (2026-10-19에 Cloudflare에서 산 도메인을 Pages 사용자 설정 도메인으로 연결. DNS는 `@` CNAME → `codespaces-blank-d5v.pages.dev`)
- 예전 주소 https://codespaces-blank-d5v.pages.dev/ 도 같은 내용으로 계속 열립니다. 페이지의 canonical·`og:`·사이트맵은 모두 `cloverpick.app`을 씁니다.
- 저장소: https://github.com/koochungkyung-ui/lucky-lotto (공개, 2026-10-16에 `codespaces-blank`에서 이름 변경)
- Codespace 안의 작업 폴더 이름은 예전 그대로 `/workspaces/codespaces-blank`입니다. Cloudflare 프로젝트 이름과 `*.pages.dev` 주소도 예전 이름을 그대로 씁니다. 외부에 알리는 주소는 `https://cloverpick.app`입니다.

## 배포

- `main`에 푸시하면 Cloudflare Pages(프로젝트 `codespaces-blank`)가 자동으로 배포합니다. 빌드 단계는 없고, 저장소 루트가 그대로 공개됩니다. 그래서 이 파일도 `/CLAUDE.md` 주소로 누구나 볼 수 있으니 비밀 정보는 넣지 않습니다.
- 배포 결과는 커밋의 체크 런으로 확인합니다.
  `gh api repos/koochungkyung-ui/lucky-lotto/commits/<sha>/check-runs` → 이름이 `Cloudflare Pages`인 항목의 `status`·`conclusion`(완료되면 `completed success`)
- GitHub Pages는 꺼 두었습니다. Cloudflare만 씁니다.
- Codespace에 기본으로 들어 있는 `GITHUB_TOKEN`으로는 이 저장소에 푸시만 할 수 있습니다. 저장소 설정(공개 여부, Pages 등)은 바꿀 수 없으니, 그런 작업은 사용자에게 GitHub 웹 화면에서 하도록 안내합니다.
- 커밋, 푸시, 배포는 사용자가 요청할 때만 합니다.

## 다른 앱을 cloverpick 주소에 올릴 때 (아직 안 함, 2026-10-22 정리)

지금 `cloverpick.app/` 첫 화면은 로또 앱 자체이고, 원스토어 앱(TWA)도 이 주소를 엽니다. 사용자 결정: 지금은 그대로 두고, 두 번째 앱이 생기면 아래 중에서 고릅니다.

- **하위 도메인(추천)**: `todo.cloverpick.app`처럼 앱마다 새 저장소 + 새 Cloudflare Pages 프로젝트 + 사용자 설정 도메인. 도메인이 이미 Cloudflare에 있어 추가 비용이 없고 로또 앱을 건드리지 않습니다.
- **하위 폴더**: `cloverpick.app/todo` 구조. 이 저장소에 폴더를 넣으면 로또의 서비스 워커(범위 `/`)와 manifest(범위 `/`)가 다른 앱까지 덮고, 다른 앱을 고칠 때마다 로또도 다시 배포되므로 그대로 넣지 않습니다. 이 구조로 가려면 먼저 로또를 `/lotto`로 옮깁니다:
  1. 로또 파일을 `/lotto`로 옮기고 Cloudflare `_redirects`로 예전 주소를 301로 넘김(`/about` → `/lotto/about` 등)
  2. 첫 화면에 앱 목록 페이지
  3. `sw.js`·manifest의 범위와 `start_url`을 `/lotto/`로
  4. 애드센스·네이버 서치어드바이저·`sitemap.xml`·canonical·`og:` 주소 갱신
  5. 원스토어 앱은 같은 도메인 안의 이동이라 다시 빌드하지 않아도 동작하지만, 다음 앱 업데이트 때 시작 주소를 `/lotto/`로 바꿈
- 첫 화면을 앱 목록으로 바꾸기만 하는 것은 안 됩니다(원스토어 앱을 열면 로또 대신 목록이 나옴).
- 도메인 자체(예: `.com`)를 바꾸는 것도 가능하지만, 원스토어 앱·`assetlinks.json`·애드센스·검색 등록·공유 링크를 모두 새 주소로 맞춰야 합니다.

## 커밋·배포 전 확인 (필수)

- 사용자가 IDE에 `index.html`을 열어 둔 채 채팅을 하므로, 파일에 엉뚱한 글자가 섞일 수 있습니다. 실제로 CSS 주석 뒤에 `네`가 들어가 배경 규칙 전체가 무시되고 화면이 가려진 적이 있습니다.
  → 커밋 전에 `git diff` 전체를 읽고, 바뀐 줄이 모두 의도한 것인지 확인합니다.
- 스크립트 문법 검사(`<head>`의 Google 태그와 본문 스크립트를 따로 검사):
  `awk '/^  <script>$/{f=1;n++;next} /^  <\/script>$/{f=0;next} f{print > ("/tmp/check" n ".js")}' index.html && for j in /tmp/check[0-9].js; do node --check "$j"; done`
- 화면은 폰 폭(320·360·390px)으로 확인합니다. 헤드리스 Chromium(Playwright)으로 스크린샷을 찍으면 됩니다. Codespace에서 처음 쓸 때는 시스템 라이브러리 설치가 필요합니다(`npx playwright install chromium` 실행 시 안내가 나옵니다).

## index.html 구조

| 위치 | 내용 |
|---|---|
| `<head>` | Open Graph/트위터 공유 미리보기 태그(이미지 `og-image.png`), PWA manifest·아이콘 태그 |
| `<style>` | 라이트/다크 색상 변수(`:root`, `body.dark`), 화면별 스타일, 맨 끝에 "한 화면 탭 레이아웃"과 폰용(`@media (max-width: 540px)`) 규칙 |
| `<body>` | 언어 버튼(`.lang-switch`), 다크모드 버튼, 탭 바(`.tab-nav`), 탭마다 하나씩 있는 `section.card` |
| 스크립트 `0. 다국어` | `I18N` 사전(`ko/en/zh/ja`), `t(key, vars)`, `tData()` |
| `0-1` ~ `8` | 탭 전환, 다크모드, 소리, 로또 추첨(`lotteryTypes`), 운세+달력, 타로, 스케치북, 콘페티, 제휴 문의 폼(`6-1`), 토스트, `applyLanguage()` |

## 문구와 번역 규칙

- 화면에 보이는 문구는 코드에 직접 쓰지 않고 `I18N` 사전에 넣습니다. **4개 언어 모두에 같은 키**를 추가해야 합니다(빠지면 한국어로 대체되어 보입니다).
- HTML 고정 문구는 `data-i18n="키"`를 씁니다. 속성은 `data-i18n-aria`, `data-i18n-title`, `data-i18n-placeholder`를 씁니다.
- JS로 만드는 문구는 `t('키', { 변수 })`를 씁니다. 운세 문장·띠·별자리·타로 해석 같은 데이터는 `I18N.<lang>.data`에 넣습니다.
- 결과 화면(운세·타로)은 상태를 저장해 두고 `render*()` 함수로 그립니다. 그래서 `applyLanguage()`가 언어를 바꿀 때 같은 결과를 새 언어로 다시 그릴 수 있습니다. 새 결과 화면을 추가할 때도 이 방식을 따르고, `applyLanguage()`에 다시 그리기 호출을 넣습니다.
- 공유 미리보기(`og:` 태그)는 SNS가 JS를 실행하지 않으므로 한국어로 고정입니다.

## 복권 규칙 (`lotteryTypes`)

| 키 | 기본 번호 | 보너스 번호 |
|---|---|---|
| `kr` 로또 6/45 | 6개 / 1~45 | 없음 (번호대별 공 색상) |
| `powerball` | 5개 / 1~69 | 1개 / 1~26 |
| `megamillions` | 5개 / 1~70 | 1개 / 1~24 (2025년 4월 변경 규칙) |
| `euromillions` | 5개 / 1~50 | 2개 / 1~12 |
| `eurojackpot` | 5개 / 1~50 | 2개 / 1~12 |

- 운세·타로에서 나온 번호는 한국 로또용입니다. 메인 추첨기로 보내면(`applyToMainLotto`) 한국 로또로 자동 전환됩니다.
- 복권 규칙이 바뀌면 이 표와 `I18N`의 `lot.<키>.rule` 문구도 함께 고칩니다.
- 해외복권 구매대행 사이트 링크는 사용자 결정으로 보류 중입니다. 각 복권의 공식 홈페이지 링크만 넣어 두었습니다.

## 로또 6/45 당첨번호 데이터 (`data/lotto645.json`)

- 1회부터 최신 회차까지의 당첨번호 파일입니다. `node scripts/update-lotto645.mjs`로 만들고, 다시 실행하면 새 회차만 덧붙입니다(새 회차가 없으면 파일을 건드리지 않음).
- 형식: `fields`(열 이름), `latest`(최신 회차), `draws`(회차마다 한 줄 `[회차, "YYYY-MM-DD", 번호 6개(오름차순), 보너스, 1~5등 1인당 당첨금]`). 1등 당첨금 0은 1등이 없던 회차(이월)입니다.
- 출처는 동행복권 추첨결과 화면이 쓰는 주소(`/lt645/selectPstLt645InfoNew.do?srchDir=center&srchLtEpsd=회차`, 회차-5~회차+4의 10회차를 돌려줌)입니다. 공식 공개 API가 아니므로 동행복권 사이트가 바뀌면 스크립트를 고칩니다. 예전 주소(`common.do?method=getLottoNumber`)는 2026-10 기준 홈페이지로 넘어가서 쓸 수 없습니다.
- 스크립트는 요청 사이를 0.7초씩 띄웁니다. 처음부터 다시 받을 일이 아니면 파일을 지우지 않습니다.
- 자동 갱신: `.github/workflows/update-lotto645.yml`이 토 21:00·23:00, 일 09:00(KST)에 스크립트를 돌려 새 회차가 있으면 `github-actions[bot]`으로 커밋해 main에 push합니다(→ Cloudflare 배포). Actions 화면에서 직접 실행(workflow_dispatch)할 수도 있습니다.
- `--check-fresh`를 붙이면 최신 회차 추첨일이 한국 날짜로 8일 이상 지났을 때 실패로 끝납니다. 일요일 아침 실행이 실패하면 새 회차를 못 받은 것이니(동행복권 주소 변경 등) 스크립트를 확인합니다. GitHub는 예약 실행 실패를 워크플로를 마지막으로 수정한 사람에게 메일로 알립니다.
- 공개 저장소의 예약 실행은 저장소에 60일 동안 활동이 없으면 꺼집니다. 매주 자동 커밋이 생기므로 보통 문제없지만, 꺼지면 Actions 화면에서 다시 켭니다.
- `sw.js`는 `/data/` 아래 파일만 네트워크를 먼저 씁니다(추첨 직후에도 새 회차가 보이도록). 오프라인이면 저장해 둔 것을 씁니다.

## QR 당첨 확인 (로또 탭 📷 버튼, 스크립트 `6-2`)

- 한국 로또를 골랐을 때만 버튼(`#qr-check-wrap`)이 보입니다(`selectLottery`). 기본 버튼 "📷 QR로 당첨 확인"(`#btn-qr-live`)은 사이트 안 실시간 카메라를 열고, 그 아래 보조 버튼 "카메라 앱으로 찍어서 확인"(`#qr-capture-main`, `<input capture="environment">`)은 폰 기본 카메라 앱으로 찍어 사진을 받으면 창을 열어 읽습니다. 한때 카메라 앱을 기본으로 했다가, S20 초점 문제를 고친 뒤 실시간 스캔을 기본으로 되돌렸습니다(2026-10-21).
- 카메라 앱의 QR 인식 팝업은 QR 안의 동행복권 주소를 열기 때문에 우리 앱과 바로 연결할 수 없습니다. 원스토어 앱을 다시 빌드할 때 웹 공유 대상(share target)을 넣으면 카메라·구글 렌즈에서 "공유"로 QR 주소를 받아 결과를 보여 줄 수 있습니다(아직 안 함). 창(`#qr-modal`)은 카드의 `backdrop-filter` 때문에 `.main-wrapper` 밖에 둡니다.
- 용지 QR 내용: `http://qr.dhlottery.co.kr/?v=<회차 4자리>` 뒤에 게임마다 `영문 1글자 + 두 자리 번호 6개`가 최대 5번, 그 뒤에 용지 고유번호. 영문은 q=자동(실제 용지로 확인), m=수동·s=반자동(알려진 규칙, 미확인). 해석은 `parseLottoQr()`.
- 인식: 브라우저 내장 `BarcodeDetector`(안드로이드 Chrome 등)를 먼저 쓰고, 없으면 `vendor/jsQR.js`(jsQR 1.4.0, Apache-2.0, 라이선스는 `vendor/jsQR-LICENSE.txt`)를 그때 불러옵니다. 외부 CDN을 쓰지 않으므로 개인정보처리방침에 업체를 추가할 필요가 없습니다.
- 카메라는 1080p로 받고, 지원하면 연속 자동 초점을 켭니다(`tuneQrCamera`). 브라우저가 고른 뒷면 카메라가 초점 고정 렌즈(초점 정보에 `continuous`가 없음, 광각 등)면 다른 뒷면 카메라 중 자동 초점이 되는 것으로 바꿉니다(`openQrCamera`).
- 스캔 중(`starting`·`scanning`)에는 창에 `fullscreen` 클래스를 붙여 카메라를 전체 화면으로 보여 주고, 가운데 네모 칸(`--qr-box`) 밖을 어둡게 합니다. jsQR은 전체 화면과 이 칸 영역(`qrBoxInVideo`, 칸보다 15% 넓게, 원본 화질)을 번갈아 읽습니다. 창을 열 때 `history.pushState`를 해 두어 폰의 뒤로 가기로 창만 닫힙니다.
- 폰에 따라 브라우저 카메라가 어느 거리에서도 초점을 못 맞추는 경우가 있었습니다(2026-10-21, 기종 미확인). 그래서 📸 "카메라 앱으로 찍기"(`<input capture="environment">`, 폰 기본 카메라 앱으로 찍어 사진으로 읽음)를 가장 눈에 띄는 버튼으로 두고, 뒷면 렌즈가 여러 개면 🔄 버튼으로 바꿀 수 있게 했습니다. 고른 렌즈는 `localStorage`의 `qr-camera`에 기억합니다. 실제 폰에서 카메라 앱으로 찍기는 동작을 확인했습니다(2026-10-21).
- 스캔을 시작하고 6초(`QR_NUDGE_AFTER`) 안에 못 읽으면 안내 문구를 `qr.nudge`로 바꾸고 카메라 앱 버튼을 깜빡여 강조합니다(`nudge` 클래스).
- 갤럭시 S20 크롬 155 진단 결과(2026-10-21): 브라우저가 기본으로 `camera 2, facing back`을 고르고, 초점 능력이 `focusMode: manual`뿐(자동 초점 없음), `focusDistance` 0~1.27이었습니다. 그래서 렌즈 이름에 번호가 있으면 `camera 0`(기본 렌즈)을 먼저 열고(`openQrCamera`), 수동 초점만 되는 카메라는 초점 거리를 0.3초마다 바꿔 가며 훑습니다(`startQrFocusSweep`). 이렇게 고친 뒤 S20에서 실시간 스캔이 바로 인식되는 것을 확인했습니다.
- 로또 QR은 2cm 정도라 폰을 바짝 대면 초점 최소 거리보다 가까워져 흐려집니다. 그래서 줌을 지원하면 2배(`QR_DEFAULT_ZOOM`)로 시작하고, 화면 오른쪽 아래 버튼으로 1×/2×를 바꿉니다. 카메라 화면을 누르면 초점을 다시 잡습니다(`refocusQrCamera`). 안내 문구도 "한 뼘쯤 떨어져"로 씁니다. `BarcodeDetector`에는 카메라 화면 원본 전체를 그대로 넘기고, jsQR은 전체 화면(긴 변 960px로 줄임)과 가운데 60%(`QR_CENTER_AREA`, 원본 화질)를 번갈아 읽습니다. 처음엔 가운데 일부를 640px로 줄여 0.18초마다 읽었는데, 폰에서 인식이 매우 느렸습니다. 네모 칸(`.qr-frame`)은 위치 안내용입니다.
- 주소에 `?qrdebug`를 붙이면 안내 문구 뒤에 인식 방식(native/jsQR), 카메라 해상도, 한 번 읽는 데 걸린 시간, 브라우저를 보여 줍니다. 폰에서 인식 문제를 찾을 때 씁니다.
- 카메라를 못 쓰면 사진으로 확인하도록 안내합니다. 사진은 `BarcodeDetector`에 원본을 먼저 주고, 통째로(긴 변 2000px·1200px) 읽은 뒤 겹치는 조각을 키워 가며 다시 읽습니다(QR이 작게 찍힌 사진 대비). 못 읽으면 찍힌 사진과 진단 정보(크기·형식·시도 횟수·인식 방식·읽은 다른 QR)를 보여 줍니다(`failQrPhoto`).
- 카메라 앱으로 찍기를 누르면 먼저 스캔 카메라를 끕니다. 안드로이드에서 카메라 앱이 열린 동안 브라우저 탭이 메모리 부족으로 새로 고쳐지면 찍은 사진이 전달되지 않을 수 있습니다.
- 결과는 `qrState`에 두고 `renderQr()`로 그리며 `applyLanguage()`에서 다시 그립니다. 파일에 없는 다음 회차는 "추첨 전"(최신 회차 날짜 + 7일 × 차이)으로 보여 줍니다.
- 카메라 화면·사진·용지 번호는 기기 밖으로 보내지 않습니다(개인정보처리방침 2번에 4개 언어로 적음). 이 방식을 바꾸면 방침도 고칩니다.
- Claude 앱의 브라우저 창은 카메라를 막아 두므로, 실제 카메라 스캔은 폰에서 확인합니다.

## 소개·개인정보처리방침 페이지

- `about.html`(사이트 소개)과 `privacy.html`(개인정보처리방침)은 앱과 따로 있는 일반 글 페이지입니다. AdSense 심사와 검색엔진을 위해 만들었습니다. 공용 파일은 `page.css`, `page.js`입니다.
- Cloudflare Pages는 `.html`을 뗀 주소로 자동 이동시킵니다(`/about.html` → `/about`). 그래서 `canonical` 태그와 외부에 알리는 주소(AdSense 등)는 `https://cloverpick.app/about`, `/privacy`처럼 씁니다.
- 4개 언어 내용이 HTML에 모두 들어 있고(`<article class="lang-block" lang="..">`), `page.js`가 앱과 같은 `localStorage` 값(`app-lang`, `app-theme`)을 읽어서 한 언어만 보여 줍니다. 이 페이지들은 `I18N` 사전을 쓰지 않으므로, 문구를 고칠 때는 4개 `article`을 모두 고칩니다.
- 앱에서는 📮 제휴 탭 아래와 하단 푸터에서 링크합니다. 두 페이지에서 앱으로 갈 때 `./#contact`로 링크하면 제휴 탭이 바로 열립니다(해시 이름 + `-card`인 탭을 엽니다).
- 앱에 새 기능을 넣거나 보내는 데이터가 바뀌면 두 페이지 내용도 맞춰 고칩니다(특히 개인정보처리방침의 수집 항목과 처리 업체).

## Google AdSense

- 게시자 ID는 `ca-pub-3330288431208764`입니다(koock4u 계정. 유튜브 채널 "편의템"도 이 계정에 연결. 처음 쓴 `pub-9392454658951872`는 중복 계정이라 2026-10-19에 해지함). 원래 "YouTube용 애드센스"만 쓰던 계정이라 사이트 광고에는 애드센스 업그레이드가 필요합니다. 모든 HTML(앱, 소개·개인정보, 글 페이지 3개)의 `<head>`에 `google-adsense-account` 메타 태그와 `adsbygoogle.js` 스크립트가 있고, 루트에 `ads.txt`가 있습니다. 새 HTML 페이지를 만들면 같은 두 줄을 넣습니다.
- `sw.js`는 다른 도메인 요청(글꼴 제외)을 건드리지 않으므로 광고 스크립트는 캐시되지 않습니다.
- 페이지 전체가 스크롤되지 않는 구조(`100dvh`)라서, 자동 광고를 켜면 광고가 화면을 가리거나 레이아웃을 밀어낼 수 있습니다. 켠 뒤에는 폰 폭에서 꼭 확인합니다.

## Google 애널리틱스

- 측정 ID는 `G-439VK8ZWR3`입니다. 모든 HTML의 `<head>` 맨 위(`<head>` 바로 다음)에 Google 태그(gtag.js)가 있습니다. 새 HTML 페이지에도 넣습니다.
- 개인정보처리방침 4번(Google LLC 항목)과 5번(광고·방문 통계와 쿠키)에 애널리틱스 사용과 차단 방법을 적어 두었습니다. 추적 방식을 바꾸면 4개 언어를 모두 고칩니다.

## 검색 등록

- 네이버 서치어드바이저: 모든 HTML의 `<head>`에 `naver-site-verification` 메타 태그가 2개 있습니다(`b0832…`는 예전 pages.dev 주소용, `e917a…`는 `cloverpick.app`용). 지우면 소유 확인이 풀립니다. 새 HTML 페이지에도 넣습니다.

## 글 페이지 (가이드)

- `lotto-odds.html`(로또 6/45 확률·등수·세금), `world-lotteries.html`(해외 복권 4종 비교), `tarot-cards.html`(메이저 아르카나 22장 의미)는 애드센스 심사용으로 만든 글 페이지입니다. 구조와 언어 처리는 소개 페이지와 같습니다(`page.css`, `page.js`, 4개 `article`).
- 앱에서는 로또 탭과 타로 탭 맨 아래(`.guide-links`), 하단 푸터에서 링크합니다. 글 페이지 5개(소개·개인정보 포함)의 푸터에도 서로 링크가 있습니다.
- 타로 카드 이름과 정방향·역방향 문구는 앱 `I18N.<lang>.data.tarot`와 같게 맞췄습니다. 번호 만드는 규칙(`generateTarotLottoNumbers`)이나 복권 규칙을 바꾸면 이 글들도 함께 고칩니다.
- 새 페이지를 만들면 `sitemap.xml`에 `.html` 없는 주소로 추가합니다(`robots.txt`가 이 사이트맵을 가리킵니다).

## 제휴 문의 폼 (📮 탭)

- Formspree(`https://formspree.io/f/meaepwqd`)로 보냅니다. 받은 문의는 Formspree 계정에 등록한 이메일로 옵니다.
- JS가 `fetch`로 보내고 결과를 폼 아래에 표시합니다(`contactState` → `renderContactStatus()`). 보내는 필드는 `name`, `email`, `message`, 그리고 숨김 필드인 `_subject`, `language`(보낸 사람이 쓰던 언어), 스팸 방지용 `_gotcha`입니다.

## 화면 배치 주의

- 폰(540px 이하)에서는 탭 5개가 한 줄에 들어가도록 아이콘을 글자 위에 둡니다(`.tab-btn { flex-direction: column }`). 탭을 더 늘리면 320px 폭에서 영어·일본어 글자가 넘치는지 확인합니다.
- 폰에서는 공이 고정 크기가 아니라 줄어들 수 있게 되어 있습니다(`flex: 0 1 36px; aspect-ratio: 1`). 한 줄에 공 6~7개와 A~E 표시가 들어가야 하므로, 공 크기를 다시 고정값으로 바꾸면 360px 폭에서 줄바꿈이 생깁니다.
- 페이지 전체는 스크롤되지 않습니다(`body`가 `100dvh`, `overflow: hidden`). 내용이 길면 각 카드 안에서 스크롤됩니다.

## 설치형 웹앱 (PWA)

- `manifest.webmanifest`(앱 이름·아이콘·색상), `sw.js`(서비스 워커), `icons/`(앱 아이콘)로 구성됩니다. 세 HTML의 `<head>`에 manifest·아이콘 태그가 있고, 서비스 워커는 `index.html` 스크립트 끝과 `page.js`에서 등록합니다.
- `sw.js`는 페이지(HTML)는 네트워크를 먼저 쓰고(배포하면 바로 반영), 나머지 파일과 Google 글꼴은 캐시를 먼저 씁니다. 그래서 `page.css`·`page.js`·아이콘·`manifest.webmanifest`를 고치면 **`CACHE` 이름의 숫자(지금 `lucky-lotto-v3`)를 올려야** 방문자에게 새 파일이 갑니다. 미리 저장하는 목록(`PRECACHE`)도 함께 맞춥니다.
- `PRECACHE`에는 Cloudflare 주소 규칙대로 `.html` 없이 `/about`, `/privacy`를 씁니다. 목록 중 하나라도 404가 나면 서비스 워커 설치가 통째로 실패합니다.
- 아이콘(2026-10-21 변경): 보라색 그라데이션 위에 로또 공 세 개(7 노랑, 14 파랑, 23 빨강)와 클로버. 예전 아이콘은 클로버 하나였습니다. `icon.svg`가 원본이고, Edge 헤드리스로 PNG를 만들었습니다(192·512는 둥근 모서리+투명, maskable 512·apple-touch 180은 꽉 찬 사각형에 그림을 80%로 줄여 가운데). 공 숫자는 어느 기기에서나 같게 보이도록 Arial 굵게를 씁니다. maskable 아이콘은 그림이 가운데 80% 안에 들어가야 합니다.
- 원스토어 앱(APK)은 versionCode 2(2026-10-22 배포)부터 새 아이콘입니다. 그 전 versionCode 1은 예전 클로버 아이콘이었습니다.
- manifest의 앱 이름은 한국어 하나입니다(manifest는 언어별로 바꿀 수 없음).
- 📲 앱 설치 버튼(`#install-btn`)은 다크모드 버튼과 함께 오른쪽 위 `.top-actions` 안에 있습니다. 처음엔 `hidden`이고, 브라우저가 `beforeinstallprompt`를 보낼 때(Chrome·Edge·삼성 인터넷)나 아이폰·아이패드일 때만 보입니다. 아이폰은 설치 창이 없어서 "공유 → 홈 화면에 추가" 안내 토스트(`install.ios`)를 띄웁니다. 이미 설치된 앱으로 열면 보이지 않습니다. 폰에서는 아이콘만 보입니다.

## 공유 미리보기 이미지

- `og-image.png`는 1200×630입니다. 처음에는 SVG를 resvg(`@resvg/resvg-js`)와 Pretendard 글꼴로 만들었고, 2026-10-21 이름을 "행운의 로또 번호 생성기"로 바꾸면서 HTML(Noto Sans KR)을 Edge 헤드리스로 찍어 다시 만들었습니다(NEW 📷 QR 당첨 확인 표시 포함).
- 이미지 안의 언어 표기는 "KO · EN · ZH · JA"처럼 영문으로 씁니다.
- 사이트 이름: 한국어 "행운의 로또 번호 생성기", 영어 "Lucky Lotto Number Generator", 중국어 "幸运乐透号码生成器", 일본어 "ラッキーロト番号ジェネレーター"(2026-10-21 "추첨기"에서 변경, 원스토어 앱 이름과 맞춤). 앱 안의 "메인 추첨기" 같은 문구는 로또 탭 기능을 가리키므로 그대로 둡니다. 원스토어 앱(APK) 안의 이름은 다시 빌드해야 바뀝니다. versionCode 1은 전체 이름(설정 화면의 앱 이름)이 "행운의 로또 번호 추첨기 & 포춘 스케치북"이었고, 2026-10-22에 배포한 versionCode 2(1.0.1)부터 "행운의 로또 번호 생성기 & 포춘 스케치북"입니다. 홈 화면 이름(launcherName)은 둘 다 "행운 로또"입니다.
- 이미지를 바꾼 뒤 카카오톡에 예전 미리보기가 계속 나오면, [카카오 공유 디버거](https://developers.kakao.com/tool/debugger/sharing)에서 캐시를 초기화합니다.

## 안드로이드 앱 (TWA)

- 패키지 ID `app.cloverpick.lotto`(2026-10-20 확정, 바꿀 수 없음). Bubblewrap으로 사이트를 감싼 앱이라, 사이트를 배포하면 앱에도 바로 반영됩니다.
- 앱 프로젝트와 서명 키는 저장소 **밖**에 둡니다(저장소 루트는 공개되므로 키를 넣으면 안 됨). 키를 잃으면 원스토어·갤럭시 스토어 앱을 더는 업데이트할 수 없으니 사용자가 따로 백업해 둡니다(다운로드 폴더의 `cloverpick-signing-key-backup.zip`: `android.keystore` + `KEYSTORE-PASSWORD.txt`, 별칭 `cloverpick`). 키 지문이 `assetlinks.json`과 같은 것을 2026-10-22에 `keytool`로 확인했습니다.
- 예전에는 Codespace(`/workspaces/cloverpick-android`, `~/android-tools`)에서 빌드했지만, Codespace가 결제 문제(402)로 열리지 않아 2026-10-22부터 **사용자 Windows PC에서 빌드**합니다.

### PC 빌드 (Windows, 2026-10-22 구성)

- 설치된 것(모두 저장소 밖, 사용자 홈 폴더 `%USERPROFILE%` 아래):
  - JDK 17: Eclipse Temurin(winget `EclipseAdoptium.Temurin.17.JDK`). 경로에 공백이 있으면 Bubblewrap의 서명 명령이 깨지므로 `%USERPROFILE%\android-tools\jdk17` 정션(→ `C:\Program Files\Eclipse Adoptium\jdk-17…`)을 씁니다.
  - Android SDK: `%USERPROFILE%\android-tools\sdk`(명령줄 도구는 `cmdline-tools\latest`, platform-tools, `platforms;android-36`, `build-tools;36.1.0`). Bubblewrap 1.27은 `sdk\tools\bin\sdkmanager`와 `build-tools\36.1.0`을 찾으므로 `sdk\tools` 정션(→ `cmdline-tools\latest`)을 만들어 두었습니다.
  - Bubblewrap CLI 1.27(`npm install -g @bubblewrap/cli`), 설정 `%USERPROFILE%\.bubblewrap\config.json`(`jdkPath`·`androidSdkPath`).
- 앱 프로젝트: `%USERPROFILE%\cloverpick-android`. 원래 프로젝트는 Codespace에 남아 있어, 출시된 APK의 설정(`aapt2 dump`)을 그대로 옮겨 `twa-manifest.json`을 새로 쓰고 `bubblewrap update --skipVersionUpgrade`로 만들었습니다. 같은 폴더 `key\`에 서명 키 사본이 있습니다.
- 설정값: 주소 `cloverpick.app`, 시작 `/`, 세로 고정, 테마·내비게이션 색 `#6366F1`, 배경 `#EEF2FF`, `fallbackType` customtabs, minSdk 24 / targetSdk 36, 홈 화면 이름 "행운 로또", 아이콘은 사이트의 `icons/icon-512.png`·`icon-maskable-512.png`.
- 새 버전 빌드 순서:
  1. `twa-manifest.json`의 `appVersionCode`(1씩 올림)와 `appVersionName`·`appVersion`을 올림
  2. `bubblewrap update --skipVersionUpgrade`
  3. `bubblewrap build --skipPwaValidation` → `app-release-signed.apk`(원스토어용), `app-release-bundle.aab`(Google Play용)
- 빌드할 때 필요한 환경(Claude Code의 PowerShell 기준):
  - `JAVA_HOME`을 정션 경로로, `PATH` 앞에 `%JAVA_HOME%\bin`(AAB 서명에 `jarsigner`가 필요)
  - `NoDefaultCurrentDirectoryInExePath` 환경 변수를 지움(Claude Code가 1로 설정해 두어 Bubblewrap이 `gradlew.bat`을 못 찾음)
  - `BUBBLEWRAP_KEYSTORE_PASSWORD`·`BUBBLEWRAP_KEY_PASSWORD`는 `KEYSTORE-PASSWORD.txt`에서 읽어 넣고, **출력에서 비밀번호를 가림**(서명 명령이 실패하면 Bubblewrap이 비밀번호를 그대로 출력함)
- 빌드 후 확인: `aapt2 dump badging`으로 versionCode·이름, `apksigner verify --print-certs`로 서명 SHA-256이 `7DACDDB7…B0B1A3`(assetlinks와 같음)인지 확인합니다.
- 출시 기록: versionCode 1 / 1.0.0(2026-10-20, Codespace 빌드, 이름 "…추첨기 & 포춘 스케치북", 예전 클로버 아이콘) → versionCode 2 / 1.0.1(2026-10-22, PC 빌드, 이름 "행운의 로또 번호 생성기 & 포춘 스케치북", 새 아이콘). versionCode 2 파일은 다운로드 폴더 `app-release-v2`에 있고, 2026-10-22 원스토어에 "파일 업데이트"(기본 지원단말 유지)로 올려 검증을 요청했고(첨부: 가짜 1246회 용지 QR이 든 `QR-test-guide.pdf`, 원스토어 첨부는 문서 형식만 받음), **같은 날 검증을 통과해 상용 바이너리(판매 중)가 versionCode 2 / 1.0.1로 바뀌었습니다.**
- 폰 확인(2026-10-22, 갤럭시 S20): 원스토어로 1.0.1 업데이트 후 아이콘·이름이 바뀌었고, 원스토어 "실행"과 홈 화면 아이콘 모두 전체 화면(주소창 없음)으로 열립니다. 업데이트 직후 첫 실행에서는 위에 브라우저 탭 막대(←, 돋보기, ⋮)가 잠깐 보였는데, 다시 여니 사라졌습니다(서명 확인이 끝나기 전 상태로 판단).
- 앱 위에 탭 막대나 주소창이 계속 보이면 순서대로 확인합니다: ① `https://cloverpick.app/.well-known/assetlinks.json`이 200·`application/json`으로 열리는지 ② Google 확인 API(`https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://cloverpick.app&relation=delegate_permission/common.handle_all_urls`)에 패키지와 지문이 나오는지 ③ 설치된 APK 서명 지문이 같은지 ④ 폰의 기본 브라우저가 Chrome인지, 앱을 강제 중지 후 인터넷이 켜진 상태에서 다시 여는지.
- `/.well-known/assetlinks.json`에 서명 키의 SHA-256 지문이 있어야 앱 위에 주소창이 안 보입니다. Google Play는 앱을 자체 키로 다시 서명하므로, Play Console의 "앱 서명 키 인증서" SHA-256도 이 파일에 추가합니다.

## Google Play 출시 준비 (2026-10-22, 진행 중)

- 진행 상황: D&B에 D-U-N-S 번호를 신청해 둔 상태(2026-10-22 접수 메일만 받음, 번호 아직 없음). D-U-N-S는 항상 숫자 9자리이고, 접수 메일의 요청 키·케이스 번호는 D-U-N-S가 아닙니다. D&B에 등록되는 업체명은 영문 상호이며, Play Console의 법적 사업자 이름은 D&B 등록 이름과 철자까지 똑같아야 합니다.
- 계정 방침(사용자 결정): YouTube·애드센스용 Google 계정은 그대로 두고, Play Console은 **새 Google 계정**으로 **조직** 유형 가입. 기존 계정의 결제 프로필은 "개인" 유형이라 조직 계정에 쓸 수 없고, 결제 프로필 유형은 나중에 바꿀 수 없습니다. 조직 계정은 개인 계정의 "테스터 12명·14일 테스트" 조건이 없습니다. 개발자 이름 추천은 `Cloverpick`(사이트·패키지 ID와 맞춤).
- 스토어 자료는 저장소 **밖**, 사용자 PC의 다운로드 폴더 `play-store-assets`에 있습니다: `play-icon-512.png`(원스토어와 같은 아이콘), `play-feature-graphic-1024x500.png`, `play-screenshot-1~6-*.png`(1080×1920, 위에 문구 + 실제 앱 화면: QR 스캔 → 결과 → 번호 생성 → 운세 → 타로 → 해외 복권), `play-listing.txt`(앱 이름·간단한 설명·자세한 설명·카테고리·앱 콘텐츠 설문 답변 가이드).
- 스토어 디자인은 앱 아이콘과 원스토어 그래픽에 맞춘 **보라색**(`#6366f1` → `#5b21b6` → `#7e22ce` → `#be3c8a`)입니다. SNS 채널(편의템)의 노랑·남색과 섞지 않습니다. 스크린샷의 로또 용지는 만든 가짜 번호(1246회)입니다.
- 앱 콘텐츠 설문: 타겟층 만 18세 이상, 실제 돈 도박 없음(복권 주제는 있음), 광고는 사이트에 애드센스 광고가 실제로 보일 때만 "포함". 데이터 보안은 앱 화면이 사이트이므로 사이트가 쓰는 Google 애널리틱스·애드센스(앱 상호작용, 기기 ID)와 제휴 문의 폼(Formspree: 이름·이메일·메시지, 선택)을 신고하고, 카메라·사진·용지 번호는 기기 안에서만 처리해 수집하지 않음으로 답합니다. 개인정보처리방침과 내용을 맞춥니다.
- 남은 일: D-U-N-S 발급 → Play Console 가입·인증 → AAB 업로드(versionCode 2 AAB는 PC에서 빌드해 둠, 위 "PC 빌드" 참고) → Play 앱 서명 키 SHA-256을 `assetlinks.json`에 추가.
- **Google Android 개발자 인증(2027년 전까지 필수)**: Google 정책으로 Play 밖에서 배포하는 앱도 인증된 개발자 앱만 안드로이드 기기에 설치되도록 바뀝니다(안내 기준 한국 포함 대부분 국가 2027년부터, 미인증이면 새 설치가 막힐 수 있음). 원스토어 바이너리 화면에 이 앱이 "Android 개발자 인증: 미인증"으로 표시됩니다(2026-10-22 확인, 원스토어 안내: https://onestore-dev.gitbook.io/dev/help/faq/apps/developer-verification). 할 일: Play Console 조직 계정에서 신원 인증을 마친 뒤, 패키지 `app.cloverpick.lotto`와 원스토어 APK의 서명 키(SHA-256 `7D:AC:DD:B7:…:B0:B1:A3`, `assetlinks.json`과 같은 키)를 등록합니다. 정확한 메뉴와 날짜는 그때 Google·원스토어 공지로 다시 확인합니다. 지금 검증·판매에는 영향이 없습니다.
- 이 PC에서 `puppeteer.launch`로 Edge가 실행되지 않을 때(2026-10-22부터): Edge를 `--headless=new --remote-debugging-port=9333 --user-data-dir=<임시 폴더>`로 직접 띄우고 `puppeteer.connect({ browserURL: 'http://127.0.0.1:9333' })`로 연결해 스크린샷을 찍습니다.
- Apple App Store는 보류(사용자와 상의): 연 99달러, TWA 방식이 없어 새로 만들어야 하고, 웹사이트를 감싼 앱은 심사 지침 4.2로 거절되기 쉬워 네이티브 기능(카메라 QR, 위젯, 알림 등)이 필요합니다. 그동안 아이폰은 "홈 화면에 추가"로 씁니다.

## SNS 홍보: 편의템 채널 (2026-10-22 정리)

- 사용자의 채널 "편의템"(인스타그램·유튜브·틱톡, 페이스북은 "편의템" **페이지**를 새로 만드는 중)에서 이 앱을 홍보합니다. 편의템은 로또 전용이 아니라 **생활 꿀템·꿀팁 채널**이고, 로또 앱은 그중 하나로 소개합니다(프로필·채널 설명에서도 "NEW" 한 줄로만 다룸).
- 자료는 저장소 **밖**, 사용자 PC의 다운로드 폴더 `instagram-pyeonuitem`에 있습니다(저장소는 공개라 넣지 않음). 맨 위 `00-전체-체크리스트.txt`에 올리는 순서가 있고, 게시물마다 정리 파일(`post1-caption.txt`, `reel1-caption.txt`, `reel2-caption.txt`, `reel2-shorts.txt`, `profile-bio.txt`, `youtube-channel.txt`)에 글·해시태그·첫 댓글·스토리 방법이 있습니다.
- 만든 것(`instagram-pyeonuitem`): 첫 게시물 사진 5장(1080×1350), 릴스 1편(앱 화면 애니메이션 15초, 소리 없음), 릴스 2편(TopView 아바타가 말하는 14.5초 + 자막 + 끝 장면), 유튜브 쇼츠(릴스 2편 + 끝 1초 표지 장면), 표지 2장, 스토리 공유 이미지 3장, 하이라이트 커버 3장.
- 브랜드 v3(2026-10-22, 다운로드 폴더 `pyeonuitem-brand-v3`): 프로필 사진(`profile-1080`, 유튜브용 `profile-youtube-800`), 유튜브 배너(2560×1440, 이 폴더 것을 씀. `instagram-pyeonuitem`의 예전 배너는 쓰지 않음), 페이스북 페이지 커버(1640×924, PC에서 잘리는 820×312 비율 = 가운데 y 150~774 안에 글자), `brand-text.txt`(유튜브 설명, 페이스북 페이지 만들기·소개(101자 이내)·친구 초대 방법, 틱톡 소개(80자 이내)). 페이스북은 개인 계정(친구 약 4,000명) 이름을 바꾸지 않고 페이지를 따로 만들어 친구를 초대합니다(개인 계정은 실명 원칙).
- 디자인: 노랑(`#ffc83d` 그라데이션) + 남색(`#1e2a4a`), 글꼴 Noto Sans KR(로고·큰 제목은 Black Han Sans). 로고는 **남색 원 바탕 + 노란 말풍선 안 남색 "편의템"**(v3, 2026-10-22 사용자 선택 "B안"). 프로필 사진과 릴스·표지·스토리·게시물 왼쪽 위 작은 로고 모두 이 로고로 바꿨습니다(그 전: v1 노란 원 "편의템" 글자 → v2 노란 원 + 남색 말풍선). 영상·이미지 안의 로고는 그림의 일부라 프로필 사진을 바꿔도 따라 바뀌지 않으므로, 로고를 바꾸면 파일을 다시 만들어 올립니다. 로또 공 7·14·23은 앱 아이콘과 같은 색.
- 만드는 방법: HTML을 Edge 헤드리스(puppeteer-core)로 찍어 PNG를 만들고, 영상은 프레임마다 CSS 애니메이션을 멈추고 시간을 지정해 찍은 뒤(결과가 매번 같음) ffmpeg로 합칩니다. 이 HTML·스크립트는 Claude 세션의 임시 폴더에 있어 사라질 수 있으니, 다시 만들 때는 위 방식으로 새로 씁니다.
- 화면 안전 영역: 인스타 프로필 격자는 세로 영상의 가운데 3:4(y 240~1680)만 보여 줌 / 스토리는 위 약 250px·아래 약 340px이 가려짐 / 하이라이트는 가운데 원만 보임 / 유튜브 배너는 모든 기기에 가운데 1546×423만 보임 / 쇼츠는 직접 만든 표지를 못 올려서 영상 안 장면을 골라야 함.
- TopView(topview.ai): 사용자가 로그인해 둔 계정을 Claude 앱 안 브라우저로 씁니다. 크레딧을 쓰는 생성 버튼은 매번 사용자에게 비용을 말하고 허락을 받은 뒤 누릅니다. 제품 아바타는 결과가 **아바타 사진의 비율**을 따르므로 세로 영상이 필요하면 세로 아바타 사진을 넣습니다. AI 아바타(Avatar 4)는 한국어 중년 여성 목소리 "Eunji"를 썼습니다. 브라우저 창에서는 PC 파일을 올릴 수 없어 업로드는 사용자가 합니다.
- 지킬 것: AI 인물이 나오는 영상은 인스타 "AI 정보"·유튜브 "변경되거나 합성된 콘텐츠"를 켬 / 복권 문구는 "만 19세 이상" 유지, 당첨 확률을 올린다는 표현 금지 / 인스타 해시태그는 게시물당 5개(캡션에만, 댓글에는 넣지 않음), 유튜브는 설명란에 8개 / 인스타 캡션·댓글의 주소는 눌리지 않으므로 "프로필 링크"나 스토리 링크 스티커로 안내 / 게시는 사용자가 직접 합니다.
