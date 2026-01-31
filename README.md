# 예측거래소 MVP (Prediction Exchange)

토스증권 스타일의 예측 시장 웹 프론트엔드입니다. 현재는 mock 데이터 기반으로 동작하며, 추후 API 연동이 쉬운 구조로 설계되었습니다.

## 주요 기능

### 페이지 구성
- **홈 (/)**: 히어로 섹션, 실시간 마켓 섹션, 검색/필터링
- **마켓 리스트 (/markets)**: 전체 마켓 목록
- **마켓 상세 (/markets/:id)**: 배팅 패널, 확률 히스토리 차트, 정산 기준, 근거 링크

### 핵심 기능
- ✅ 실시간 마켓 검색 및 카테고리 필터링
- ✅ 기간별 확률 히스토리 차트 (1일/1주/1개월/3개월/6개월/1년)
- ✅ LMSR 기반 견적 시스템 (수수료, 슬리피지 계산)
- ✅ 투자위험(HIGH) 마켓 필터링
- ✅ 반응형 디자인 (모바일/태블릿/데스크톱)

## 기술 스택

- **React 19** + **TypeScript**
- **Vite** - 빌드 도구
- **React Router** - 라우팅
- **Tailwind CSS v4** - 스타일링
- **shadcn/ui** - UI 컴포넌트
- **Framer Motion** - 애니메이션
- **Recharts** - 차트 시각화
- **Lucide React** - 아이콘

## 프로젝트 구조

```
prediction-exchange/
├── src/
│   ├── components/
│   │   └── ui/              # shadcn/ui 컴포넌트
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── badge.tsx
│   │       ├── input.tsx
│   │       ├── select.tsx
│   │       ├── separator.tsx
│   │       └── switch.tsx
│   ├── lib/
│   │   └── utils.ts         # 유틸리티 함수 (cn)
│   ├── App.tsx              # 메인 애플리케이션 (모든 컴포넌트 포함)
│   ├── main.tsx             # 엔트리 포인트
│   └── index.css            # 글로벌 스타일 (Tailwind)
├── package.json
├── vite.config.ts
├── tsconfig.json
└── tailwind.config.js (v4는 설정 불필요)
```

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 열기

### 3. 프로덕션 빌드

```bash
npm run build
```

빌드된 파일은 `dist/` 디렉토리에 생성됩니다.

### 4. 프리뷰

```bash
npm run preview
```

## 설치된 주요 패키지

### 프로덕션 의존성
```json
{
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "react-router-dom": "^6.30.3",
  "framer-motion": "^12.29.2",
  "recharts": "^3.7.0",
  "lucide-react": "^0.563.0",
  "class-variance-authority": "latest",
  "clsx": "latest",
  "tailwind-merge": "latest",
  "@radix-ui/react-select": "latest",
  "@radix-ui/react-separator": "latest",
  "@radix-ui/react-switch": "latest",
  "@radix-ui/react-slot": "latest"
}
```

### 개발 의존성
```json
{
  "vite": "^7.2.4",
  "typescript": "~5.9.3",
  "tailwindcss": "^4.1.18",
  "autoprefixer": "^10.4.23",
  "postcss": "^8.5.6"
}
```

## API 연동 준비

현재는 mock 데이터로 동작하지만, API 연동 시 다음 엔드포인트를 사용할 수 있도록 주석이 표시되어 있습니다:

### 주요 API 엔드포인트 (예정)

```typescript
// 마켓 목록
GET /api/markets
  ?category=economy
  &query=환율
  &hideHighRisk=true
  &limit=10

// 마켓 상세
GET /api/markets/:id

// 확률 히스토리
GET /api/odds/history/:marketId
  ?range=1d

// 배팅 견적 (시뮬레이션)
POST /api/quote
{
  "marketId": "mkt-001",
  "outcomeId": "o1",
  "stake": 10000
}

// 배팅 생성
POST /api/bets
{
  "marketId": "mkt-001",
  "outcomeId": "o1",
  "stake": 10000,
  "maxSlippage": 5
}
```

코드 내 `// API 연동 시:` 주석을 검색하면 연동 지점을 찾을 수 있습니다.

## 디자인 시스템

### 색상 (Tailwind CSS Variables)
- `--background`: 배경색
- `--foreground`: 전경색 (텍스트)
- `--muted`: 보조 배경색
- `--muted-foreground`: 보조 텍스트색
- `--border`: 테두리색
- `--primary`: 주요 액션 색상
- `--destructive`: 경고/삭제 색상

### 라운드 (Border Radius)
- `rounded-2xl`: 카드, 버튼, 입력 필드
- `rounded-3xl`: 대형 카드, 섹션
- `rounded-full`: 배지, 토글

## 개발 가이드

### 새 컴포넌트 추가

```typescript
// src/components/ui/my-component.tsx
import { cn } from "@/lib/utils"

export function MyComponent({ className, ...props }) {
  return (
    <div className={cn("base-styles", className)} {...props}>
      {/* 컴포넌트 내용 */}
    </div>
  )
}
```

### 스타일링 규칙
- Tailwind CSS 클래스 사용
- `cn()` 함수로 조건부 클래스 적용
- 컴포넌트별 일관된 spacing/padding 유지
- 반응형: `sm:`, `md:`, `lg:` breakpoints 활용

### 라우팅 추가

```typescript
// src/App.tsx의 Routes 섹션에 추가
<Route path="/new-page" element={<NewPage />} />
```

## 주요 기능 설명

### 1. 마켓 필터링
- 검색어: 제목 기반 검색
- 카테고리: 경제, 사회, IT, 연예, 스포츠, 국제, 기타
- 투자위험: HIGH 태그 마켓 숨기기

### 2. 확률 히스토리 차트
- Recharts 기반 라인 차트
- 기간별 탭: 1일/1주/1개월/3개월/6개월/1년
- Mock 데이터는 seeded random으로 생성

### 3. 배팅 견적 (LMSR)
- 수수료: 2%
- 슬리피지: 유동성 대비 자동 계산
- 최대 허용 슬리피지 초과 시 버튼 비활성화

## 트러블슈팅

### Node 버전 경고
현재 Node v18을 사용 중이며, Vite 7은 Node 20+ 권장. 대부분 정상 동작하지만, 가능하면 Node 20 이상 사용 권장.

### Tailwind CSS v4 주의사항
- `@import "tailwindcss"` 방식 사용
- 설정 파일(`tailwind.config.js`) 불필요
- CSS 변수 기반 테마 시스템

### Path Alias (@/)
`tsconfig.app.json`과 `vite.config.ts`에 이미 설정되어 있습니다:
```typescript
import { Button } from "@/components/ui/button"
```

## 라이선스

MIT

## 기여

이슈 제보 및 PR 환영합니다.

---

**Built with ❤️ using Vite + React + Tailwind CSS**
