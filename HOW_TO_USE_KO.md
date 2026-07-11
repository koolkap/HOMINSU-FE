# HOMINSU 프런트엔드 사용 안내서

이 문서는 HOMINSU React 프런트엔드를 설치하고 실행하는 방법부터 화면별
사용법, 개발용 로그인 계정, 백엔드 연결 및 문제 해결 방법까지 설명합니다.

## 1. 서비스 모드

하나의 애플리케이션에서 세 가지 서비스 모드를 제공합니다.

| 모드 | 대표 색상 | 경로 | 주요 사용자 |
| --- | --- | --- | --- |
| 소비자 홈 | 빨간색 | `/` | VR 콘텐츠를 탐색하고 구매하는 시청자 |
| VR Studio | 파란색 | `/creator` | 콘텐츠를 탐색하고 제작하는 크리에이터 |
| PRO Studio | 금색 | `/pro/operator` | 체험장의 VR 헤드셋을 관리하는 운영자 |

화면 상단의 모드 전환 메뉴로 각 서비스에 이동할 수 있습니다.

## 2. 사전 준비

- Node.js 20 이상
- npm 10 이상
- `https://hominsu-be-production.up.railway.app`의 HOMINSU 백엔드 접속 권한
- 최신 Chrome, Edge, Firefox 또는 Safari

버전을 확인합니다.

```bash
node --version
npm --version
```

## 3. 설치 및 환경 설정

### Ubuntu

```bash
cd /path/to/HOMINSU-FE
npm install
```

프로젝트 루트에 `.env.local` 파일을 만들고 다음 값을 입력합니다.

```text
VITE_API_BASE_URL=https://hominsu-be-production.up.railway.app/api/v1
```

### Windows PowerShell

```powershell
Set-Location C:\path\to\HOMINSU-FE
npm install
Set-Content -Path .env.local -Value "VITE_API_BASE_URL=https://hominsu-be-production.up.railway.app/api/v1"
```

`VITE_API_BASE_URL`에는 `/api/v1`까지 포함해야 합니다. Swagger 주소를
입력하면 안 됩니다. 환경 변수를 변경한 뒤에는 Vite를 다시 실행합니다.

## 4. 실행 방법

먼저 백엔드를 실행한 후 다음 명령으로 프런트엔드를 시작합니다.

```bash
npm run dev
```

브라우저에서 `http://localhost:5173`을 엽니다. 같은 네트워크의 다른
기기에서도 접속하려면 다음 명령을 사용합니다.

```bash
npm run dev -- --host 0.0.0.0
```

권장 실행 순서:

1. `https://hominsu-be-production.up.railway.app/health`에서 `status: ok`를 확인합니다.
2. API 주소를 별도로 지정해야 할 때는 `.env.example`을 `.env.local`로 복사합니다.
3. 프런트엔드를 5173번 포트에서 실행합니다.
4. `http://localhost:5173`에 접속합니다.

## 5. 개발용 계정

| 역할 | 이메일 | 비밀번호 | 주요 권한 |
| --- | --- | --- | --- |
| 일반 회원 | `member@hominsu.local` | `member1234` | 프로필, 지갑, 충전, 콘텐츠 잠금 해제 |
| 운영자 | `operator@hominsu.local` | `operator1234` | 디바이스 제어 및 동기화 API |
| 관리자 | `admin@hominsu.local` | `admin1234` | 운영자 API 및 관리자 역할 |

위 계정은 로컬 시드 데이터 전용입니다. 운영 환경에서는 사용하지 마십시오.

## 6. 로그인

1. `/`에서 **로그인**을 누르거나 `/profile`에서 로그인 메뉴를 누릅니다.
2. 개발용 계정 정보를 입력합니다.
3. 로그인 폼을 제출합니다.
4. 발급된 JWT는 `homeinsu_token`, 화면에 표시할 사용자 정보는
   `homeinsu_user`라는 이름으로 브라우저 Local Storage에 저장됩니다.
5. 로그인 버튼이 사용자의 Gravatar와 표시 이름으로 변경됩니다.
6. 이후 프로필, 지갑, 충전, 잠금 해제 및 운영자 요청에 토큰이 포함됩니다.

`/pro/operator`를 사용하기 전에는 운영자 계정으로 로그인해야 합니다.
일반 회원 토큰으로 운영 명령을 보내면 백엔드에서 HTTP `403`을 반환합니다.

아바타를 누르면 `/profile`로 이동합니다. **로그아웃**을 누르면 JWT와 저장된
사용자 정보를 삭제한 뒤 홈으로 이동합니다. 개발 중 세션을 직접 삭제하려면
브라우저 콘솔에서 다음 코드를 실행합니다.

```javascript
localStorage.removeItem('homeinsu_token')
localStorage.removeItem('homeinsu_user')
location.reload()
```

## 7. 화면 경로

| 경로 | 기능 |
| --- | --- |
| `/` | 히어로, 카테고리, 라이브, 콘텐츠 목록이 있는 소비자 홈 |
| `/content/:id` | 콘텐츠 상세, 미리보기 및 잠금 해제 |
| `/live` | 라이브 및 방송 예정 콘텐츠 목록 |
| `/shorts` | 세로형 숏폼 콘텐츠 피드 |
| `/points` | 포인트 잔액, 충전 상품 및 이용 내역 영역 |
| `/profile` | 현재 계정과 MY 메뉴 |
| `/creator` | 파란색 VR Studio 카탈로그 |
| `/pro/operator` | 금색 헤드셋 운영 콘솔 |

등록되지 않은 프런트엔드 경로는 `/`로 이동합니다.

## 8. 소비자 기능 사용법

### 콘텐츠 탐색

1. `/`을 엽니다.
2. 라이브 영역이나 콘텐츠 목록을 탐색합니다.
3. 콘텐츠 카드를 눌러 `/content/<id>`로 이동합니다.
4. 제목, 제작자, 설명, 가격 및 미리보기 상태를 확인합니다.

백엔드에 연결할 수 없으면 공개 조회 화면은 로컬 목 데이터를 표시하고
오프라인 미리보기임을 안내합니다. 로그인, 결제, 운영 명령 같은 변경 요청은
가짜 성공으로 처리하지 않습니다.

### 콘텐츠 잠금 해제

1. 일반 회원 계정으로 로그인합니다.
2. 콘텐츠 상세 화면을 엽니다.
3. 다음 방식 중 하나를 선택합니다.
   - **포인트로 시청**: 콘텐츠 가격만큼 포인트를 차감합니다.
   - **광고 보고 시청**: 현재 데모에서는 광고 방식의 잠금 해제 기록을 만듭니다.
   - **현금 결제**: 시드 지갑의 현금 잔액에서 가격을 차감합니다.
4. 성공하면 화면이 잠금 해제 상태로 변경됩니다.

광고 SDK와 실제 광고 재생은 아직 연결되어 있지 않습니다. 현금 방식도 실제
PG 결제를 호출하지 않는 백엔드 트랜잭션 데모입니다.

### 라이브 및 숏폼

1. `/live`에서 방송 중이거나 예정된 VR 스트림을 확인합니다.
2. `/shorts`에서 위아래로 스크롤하여 세로형 콘텐츠를 봅니다.
3. 숏폼의 전체 보기 버튼으로 콘텐츠 상세 화면에 이동합니다.

## 9. 포인트와 프로필

### 포인트 확인 및 충전

1. 일반 회원 계정으로 로그인합니다.
2. `/points`를 엽니다.
3. 오프라인 안내 대신 실시간 잔액이 표시되는지 확인합니다.
4. 원하는 포인트 상품을 선택합니다.
5. 개발 백엔드는 브라우저가 생성한 고유 결제 참조값을 기록하고 포인트를
   즉시 적립합니다.

현재 충전은 결제가 완료되었다고 가정하는 개발용 기능입니다. 운영 전에는
실제 결제사 연동과 웹훅 검증을 추가해야 합니다.

### 프로필

`/profile`에서 시드 계정의 이름, 이메일, 역할을 확인할 수 있습니다. 결제
관리, 인증 관리, 환경 설정 및 일부 MY 메뉴는 아직 UI 화면만 존재합니다.

## 10. 크리에이터 모드

1. 상단 모드 메뉴에서 **VR Studio**를 선택하거나 `/creator`를 엽니다.
2. 파란색 카탈로그와 카테고리를 탐색합니다.
3. 프로젝트를 선택하면 공통 콘텐츠 상세 화면으로 이동합니다.

새 콘텐츠 업로드, 내 프로젝트, 인사이트 및 스튜디오 설정은 현재 디자인
화면입니다. 업로드 API는 아직 구현되지 않았습니다.

## 11. 운영자 모드

1. `operator@hominsu.local` 계정으로 로그인합니다.
2. 상단 모드 메뉴에서 **Operator**를 선택하거나 `/pro/operator`를 엽니다.
3. 온라인/오프라인 수와 모델, 배터리, 펌웨어, IP, 위치, 최근 접속 시간을
   확인합니다.
4. **WAKE**, **SLEEP**, **REBOOT**, **UPDATE**로 전체 디바이스 명령을 보냅니다.
5. 각 카드의 재시작 버튼으로 특정 헤드셋만 재시작 요청합니다.
6. **SYNC PLAY**로 화면에 표시된 디바이스의 동기화 기록을 만듭니다.

명령은 PostgreSQL에 대기 상태로 저장됩니다. 실제 헤드셋에 명령을 전달하려면
별도의 MQTT, WebSocket 또는 디바이스 에이전트 연동이 필요합니다.

## 12. 백엔드 및 Swagger 확인

| 주소 | 용도 |
| --- | --- |
| `https://hominsu-be-production.up.railway.app/` | 백엔드 서비스 정보 |
| `https://hominsu-be-production.up.railway.app/health` | 상태 확인 |
| `https://hominsu-be-production.up.railway.app/docs/` | Swagger API 직접 테스트 |
| `https://hominsu-be-production.up.railway.app/openapi.json` | OpenAPI 원본 문서 |

Swagger를 사용하면 프런트엔드와 별도로 로그인 및 보호 API를 검사할 수 있습니다.

## 13. 배포 빌드

```bash
npm run lint
npm run build
npm run preview
```

배포 파일은 `dist/`에 생성됩니다. React Router 경로를 새로 고침해도 동작하도록
웹 서버에서 알 수 없는 경로를 `index.html`로 전달해야 합니다.

## 14. 문제 해결

| 증상 | 해결 방법 |
| --- | --- |
| 오프라인 미리보기가 표시됨 | Railway 상태와 `VITE_API_BASE_URL`을 확인합니다. |
| 로그인 서버 연결 실패 | Railway 배포 상태와 브라우저 Network 탭을 확인합니다. |
| `401` 응답 | 토큰이 없거나 만료되었으므로 다시 로그인합니다. |
| 운영 명령에서 `403` | 운영자 또는 관리자 계정으로 로그인합니다. |
| API `404` | 주소에 `/api/v1`이 있고 문서화된 경로인지 확인합니다. |
| CORS 오류 | 백엔드 `CORS_ORIGINS`에 프런트엔드 주소를 추가합니다. |
| 5173 포트 사용 중 | `npm run dev -- --port 5174` 실행 후 CORS도 변경합니다. |
| 직접 경로 새로 고침 시 404 | 웹 서버에 SPA의 `index.html` 대체 규칙을 설정합니다. |
| 중복 결제 참조 오류 | 다시 요청하여 새로운 고유 참조값을 사용합니다. |
| 의존성 변경 후 빌드 실패 | `node_modules`를 삭제하고 `npm install` 후 다시 빌드합니다. |

## 15. 보안 주의사항

- 개발용 계정, 즉시 포인트 충전 및 시드 잔액은 운영 결제 수단이 아닙니다.
- 운영 환경에서는 프런트엔드와 백엔드를 모두 HTTPS로 제공해야 합니다.
- `VITE_*` 환경 변수는 브라우저 코드에 포함되므로 DB 비밀번호나 비밀키를
  넣으면 안 됩니다.
- 운영 환경의 XSS 및 갱신 토큰 정책을 고려하여 JWT 저장 방식을 확정하십시오.
