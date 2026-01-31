# 배포 가이드

빌드가 완료되었습니다! 이제 여러 방법으로 배포할 수 있습니다.

## 📦 빌드 결과물

```
dist/
├── assets/
│   ├── index-BdmJQu1R.css (21.35 kB)
│   └── index-Chvv2WAm.js (824.20 kB)
├── index.html
└── vite.svg
```

---

## 🚀 배포 방법

### 1. Vercel 배포 (가장 쉬움, 추천!)

#### 방법 A: CLI로 배포
```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 루트에서 실행
vercel

# 프로덕션 배포
vercel --prod
```

질문에 답변:
- Set up and deploy? → Y
- Which scope? → 본인 계정 선택
- Link to existing project? → N
- What's your project's name? → prediction-exchange
- In which directory is your code located? → ./
- Want to override the settings? → N

완료되면 URL이 제공됩니다! (예: `https://prediction-exchange.vercel.app`)

#### 방법 B: GitHub + Vercel 연동 (가장 간편!)

1. GitHub에 코드 푸시
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/prediction-exchange.git
git push -u origin main
```

2. Vercel 웹사이트에서:
   - https://vercel.com 접속
   - "Import Project" 클릭
   - GitHub 저장소 연결
   - prediction-exchange 선택
   - "Deploy" 클릭

✅ 자동 배포 완료! 이후 GitHub에 푸시하면 자동으로 재배포됩니다.

---

### 2. Netlify 배포

#### 방법 A: Drag & Drop
1. https://app.netlify.com/drop 접속
2. `dist` 폴더를 드래그 앤 드롭
3. 즉시 배포 완료!

#### 방법 B: CLI
```bash
# Netlify CLI 설치
npm i -g netlify-cli

# 로그인
netlify login

# 배포
netlify deploy

# 프로덕션 배포
netlify deploy --prod
```

---

### 3. GitHub Pages 배포

#### 1) package.json 수정
```json
{
  "homepage": "https://YOUR_USERNAME.github.io/prediction-exchange"
}
```

#### 2) vite.config.ts 수정
```typescript
export default defineConfig({
  plugins: [react()],
  base: '/prediction-exchange/', // 저장소 이름
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

#### 3) 배포 스크립트 추가
package.json에 추가:
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

#### 4) gh-pages 설치 및 배포
```bash
npm install --save-dev gh-pages
npm run deploy
```

#### 5) GitHub Settings
저장소 → Settings → Pages → Source: `gh-pages` branch 선택

URL: `https://YOUR_USERNAME.github.io/prediction-exchange`

---

### 4. 직접 서버에 배포

#### Nginx 설정 예시
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/prediction-exchange/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### 배포 명령
```bash
# dist 폴더를 서버로 복사
scp -r dist/* user@your-server:/var/www/prediction-exchange/dist/

# 또는 rsync 사용
rsync -avz dist/ user@your-server:/var/www/prediction-exchange/dist/
```

---

### 5. AWS S3 + CloudFront 배포

```bash
# AWS CLI 설치 및 설정
aws configure

# S3 버킷 생성
aws s3 mb s3://prediction-exchange

# dist 폴더 업로드
aws s3 sync dist/ s3://prediction-exchange --delete

# 정적 웹사이트 호스팅 활성화
aws s3 website s3://prediction-exchange --index-document index.html --error-document index.html
```

CloudFront 배포 설정은 AWS 콘솔에서 진행하세요.

---

## 🔧 환경 변수 (향후 API 연동 시)

`.env.production` 파일 생성:
```env
VITE_API_URL=https://api.your-domain.com
VITE_APP_ENV=production
```

코드에서 사용:
```typescript
const API_URL = import.meta.env.VITE_API_URL;
```

---

## ✅ 배포 확인 사항

배포 후 다음을 확인하세요:

- [ ] 홈페이지가 제대로 로드되는가?
- [ ] 스타일이 올바르게 적용되었는가?
- [ ] 라우팅이 작동하는가? (`/markets`, `/markets/:id`)
- [ ] 차트가 표시되는가?
- [ ] 검색 기능이 작동하는가?
- [ ] 모바일에서도 잘 보이는가?

---

## 🎯 추천 배포 방법

### 초보자
→ **Netlify Drag & Drop** (가장 쉬움)

### 프로젝트 관리자
→ **Vercel + GitHub** (자동 배포, 무료, 빠름)

### 커스터마이징 필요
→ **자체 서버 (Nginx/Apache)**

---

## 📱 도메인 연결

배포 후 커스텀 도메인을 연결하려면:

### Vercel
1. Vercel 대시보드 → Settings → Domains
2. 도메인 입력 및 DNS 설정

### Netlify
1. Netlify 대시보드 → Domain Settings
2. Custom domain 추가

---

## 🐛 트러블슈팅

### 404 에러 (라우팅 문제)
모든 경로를 `index.html`로 리디렉트하도록 설정:

**Vercel**: `vercel.json` 생성
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**Netlify**: `netlify.toml` 생성
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### CORS 에러 (API 연동 시)
백엔드에서 CORS 헤더 설정 필요:
```
Access-Control-Allow-Origin: https://your-domain.com
```

---

**배포 완료 후 URL을 저에게 공유해주시면 확인해드릴게요!** 🎉
