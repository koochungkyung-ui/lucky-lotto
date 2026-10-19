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
- 스크립트 문법 검사:
  `sed -n '/<script>/,/<\/script>/p' index.html | sed '1d;$d' > /tmp/check.js && node --check /tmp/check.js`
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

## 소개·개인정보처리방침 페이지

- `about.html`(사이트 소개)과 `privacy.html`(개인정보처리방침)은 앱과 따로 있는 일반 글 페이지입니다. AdSense 심사와 검색엔진을 위해 만들었습니다. 공용 파일은 `page.css`, `page.js`입니다.
- Cloudflare Pages는 `.html`을 뗀 주소로 자동 이동시킵니다(`/about.html` → `/about`). 그래서 `canonical` 태그와 외부에 알리는 주소(AdSense 등)는 `https://cloverpick.app/about`, `/privacy`처럼 씁니다.
- 4개 언어 내용이 HTML에 모두 들어 있고(`<article class="lang-block" lang="..">`), `page.js`가 앱과 같은 `localStorage` 값(`app-lang`, `app-theme`)을 읽어서 한 언어만 보여 줍니다. 이 페이지들은 `I18N` 사전을 쓰지 않으므로, 문구를 고칠 때는 4개 `article`을 모두 고칩니다.
- 앱에서는 📮 제휴 탭 아래와 하단 푸터에서 링크합니다. 두 페이지에서 앱으로 갈 때 `./#contact`로 링크하면 제휴 탭이 바로 열립니다(해시 이름 + `-card`인 탭을 엽니다).
- 앱에 새 기능을 넣거나 보내는 데이터가 바뀌면 두 페이지 내용도 맞춰 고칩니다(특히 개인정보처리방침의 수집 항목과 처리 업체).

## Google AdSense

- 게시자 ID는 `ca-pub-3330288431208764`입니다(야담 유튜브 채널에 연결된, 이미 승인된 계정. 처음 쓴 `pub-9392454658951872`는 중복 계정이라 2026-10-19에 교체). 모든 HTML(앱, 소개·개인정보, 글 페이지 3개)의 `<head>`에 `google-adsense-account` 메타 태그와 `adsbygoogle.js` 스크립트가 있고, 루트에 `ads.txt`가 있습니다. 새 HTML 페이지를 만들면 같은 두 줄을 넣습니다.
- `sw.js`는 다른 도메인 요청(글꼴 제외)을 건드리지 않으므로 광고 스크립트는 캐시되지 않습니다.
- 페이지 전체가 스크롤되지 않는 구조(`100dvh`)라서, 자동 광고를 켜면 광고가 화면을 가리거나 레이아웃을 밀어낼 수 있습니다. 켠 뒤에는 폰 폭에서 꼭 확인합니다.

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
