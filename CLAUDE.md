# 행운의 로또 번호 추첨기 & 포춘 스케치북

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
- `sw.js`는 `/data/` 아래 파일만 네트워크를 먼저 씁니다(추첨 직후에도 새 회차가 보이도록). 오프라인이면 저장해 둔 것을 씁니다.

## QR 당첨 확인 (로또 탭 📷 버튼, 스크립트 `6-2`)

- 한국 로또를 골랐을 때만 버튼이 보입니다(`selectLottery`). 창(`#qr-modal`)은 카드의 `backdrop-filter` 때문에 `.main-wrapper` 밖에 둡니다.
- 용지 QR 내용: `http://qr.dhlottery.co.kr/?v=<회차 4자리>` 뒤에 게임마다 `영문 1글자 + 두 자리 번호 6개`가 최대 5번, 그 뒤에 용지 고유번호. 영문은 q=자동(실제 용지로 확인), m=수동·s=반자동(알려진 규칙, 미확인). 해석은 `parseLottoQr()`.
- 인식: 브라우저 내장 `BarcodeDetector`(안드로이드 Chrome 등)를 먼저 쓰고, 없으면 `vendor/jsQR.js`(jsQR 1.4.0, Apache-2.0, 라이선스는 `vendor/jsQR-LICENSE.txt`)를 그때 불러옵니다. 외부 CDN을 쓰지 않으므로 개인정보처리방침에 업체를 추가할 필요가 없습니다.
- 카메라는 1080p로 받고, 지원하면 연속 자동 초점을 켭니다(`tuneQrCamera`). 브라우저가 고른 뒷면 카메라가 초점 고정 렌즈(초점 정보에 `continuous`가 없음, 광각 등)면 다른 뒷면 카메라 중 자동 초점이 되는 것으로 바꿉니다(`openQrCamera`).
- 로또 QR은 2cm 정도라 폰을 바짝 대면 초점 최소 거리보다 가까워져 흐려집니다. 그래서 줌을 지원하면 2배(`QR_DEFAULT_ZOOM`)로 시작하고, 화면 오른쪽 아래 버튼으로 1×/2×를 바꿉니다. 카메라 화면을 누르면 초점을 다시 잡습니다(`refocusQrCamera`). 안내 문구도 "한 뼘쯤 떨어져"로 씁니다. `BarcodeDetector`에는 카메라 화면 원본 전체를 그대로 넘기고, jsQR은 전체 화면(긴 변 960px로 줄임)과 가운데 60%(`QR_CENTER_AREA`, 원본 화질)를 번갈아 읽습니다. 처음엔 가운데 일부를 640px로 줄여 0.18초마다 읽었는데, 폰에서 인식이 매우 느렸습니다. 네모 칸(`.qr-frame`)은 위치 안내용입니다.
- 주소에 `?qrdebug`를 붙이면 안내 문구 뒤에 인식 방식(native/jsQR), 카메라 해상도, 한 번 읽는 데 걸린 시간, 브라우저를 보여 줍니다. 폰에서 인식 문제를 찾을 때 씁니다.
- 카메라를 못 쓰면 사진으로 확인하도록 안내하고, 사진은 통째로 한 번 읽은 뒤 겹치는 조각을 키워 가며 다시 읽습니다(QR이 작게 찍힌 사진 대비).
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

- `manifest.webmanifest`(앱 이름·아이콘·색상), `sw.js`(서비스 워커), `icons/`(클로버 아이콘)로 구성됩니다. 세 HTML의 `<head>`에 manifest·아이콘 태그가 있고, 서비스 워커는 `index.html` 스크립트 끝과 `page.js`에서 등록합니다.
- `sw.js`는 페이지(HTML)는 네트워크를 먼저 쓰고(배포하면 바로 반영), 나머지 파일과 Google 글꼴은 캐시를 먼저 씁니다. 그래서 `page.css`·`page.js`·아이콘을 고치면 **`CACHE` 이름의 숫자(`lucky-lotto-v1`)를 올려야** 방문자에게 새 파일이 갑니다. 미리 저장하는 목록(`PRECACHE`)도 함께 맞춥니다.
- `PRECACHE`에는 Cloudflare 주소 규칙대로 `.html` 없이 `/about`, `/privacy`를 씁니다. 목록 중 하나라도 404가 나면 서비스 워커 설치가 통째로 실패합니다.
- 아이콘은 SVG를 resvg로 PNG로 바꿔 만들었습니다(192, 512, maskable 512, apple-touch 180). maskable 아이콘은 그림이 가운데 80% 안에 들어가야 합니다.
- manifest의 앱 이름은 한국어 하나입니다(manifest는 언어별로 바꿀 수 없음).
- 📲 앱 설치 버튼(`#install-btn`)은 다크모드 버튼과 함께 오른쪽 위 `.top-actions` 안에 있습니다. 처음엔 `hidden`이고, 브라우저가 `beforeinstallprompt`를 보낼 때(Chrome·Edge·삼성 인터넷)나 아이폰·아이패드일 때만 보입니다. 아이폰은 설치 창이 없어서 "공유 → 홈 화면에 추가" 안내 토스트(`install.ios`)를 띄웁니다. 이미 설치된 앱으로 열면 보이지 않습니다. 폰에서는 아이콘만 보입니다.

## 공유 미리보기 이미지

- `og-image.png`는 1200×630입니다. SVG를 resvg(`@resvg/resvg-js`)와 Pretendard 글꼴로 PNG로 바꿔서 만들었습니다.
- Pretendard에는 한자·가나가 없어서, 이미지 안에서는 "KO · EN · ZH · JA" 같은 영문 표기를 씁니다.
- 이미지를 바꾼 뒤 카카오톡에 예전 미리보기가 계속 나오면, [카카오 공유 디버거](https://developers.kakao.com/tool/debugger/sharing)에서 캐시를 초기화합니다.

## 안드로이드 앱 (TWA)

- 패키지 ID `app.cloverpick.lotto`(2026-10-20 확정, 바꿀 수 없음). Bubblewrap으로 사이트를 감싼 앱이라, 사이트를 배포하면 앱에도 바로 반영됩니다.
- 앱 프로젝트와 서명 키는 저장소 **밖** `/workspaces/cloverpick-android`에 있습니다(저장소 루트는 공개되므로 키를 넣으면 안 됨). 비밀번호는 같은 폴더의 `KEYSTORE-PASSWORD.txt`. 키를 잃으면 원스토어·갤럭시 스토어 앱을 더는 업데이트할 수 없으니 사용자가 따로 백업해 둡니다.
- 빌드 도구: `~/android-tools`(JDK 17, Android SDK), 설정은 `~/.bubblewrap/config.json`. 새로 빌드할 때는 `twa-manifest.json`의 `appVersionCode`(와 `appVersion`)를 올리고 `bubblewrap update` → `bubblewrap build`(비밀번호는 `BUBBLEWRAP_KEYSTORE_PASSWORD`, `BUBBLEWRAP_KEY_PASSWORD` 환경 변수).
- `/.well-known/assetlinks.json`에 서명 키의 SHA-256 지문이 있어야 앱 위에 주소창이 안 보입니다. Google Play는 앱을 자체 키로 다시 서명하므로, Play Console의 "앱 서명 키 인증서" SHA-256도 이 파일에 추가합니다.
