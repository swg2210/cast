# GitHub에 코드 푸시하기

## 현재 상황
- ✅ Git 커밋 완료
- ✅ GitHub 저장소 생성: https://github.com/swg2210/cast
- ⏳ 코드 푸시 필요

---

## 방법 1: GitHub Desktop (추천!)

### 설치
https://desktop.github.com/

### 사용법
1. GitHub Desktop 설치 및 로그인
2. File → Add Local Repository
3. `C:\Users\USER\prediction-exchange` 선택
4. "Publish repository" 클릭
5. Repository name: `cast` 입력
6. "Publish repository" 완료!

---

## 방법 2: Personal Access Token

### Token 생성
1. https://github.com/settings/tokens 접속
2. "Generate new token" → "Generate new token (classic)"
3. Note: `prediction-exchange-deploy`
4. Expiration: `90 days`
5. 권한 선택: `repo` 전체 체크
6. "Generate token" 클릭
7. **Token 복사** (한 번만 보임!)

### 푸시 명령어
```bash
cd /mnt/c/Users/USER/prediction-exchange

# Token으로 푸시 (YOUR_TOKEN을 복사한 토큰으로 교체)
git push https://YOUR_TOKEN@github.com/swg2210/cast.git main
```

---

## 방법 3: Git Credential Manager

Windows에서 자동으로 인증:

```bash
# Windows Credential Manager 사용
git config --global credential.helper wincred

# 푸시 시도 (브라우저에서 로그인 창이 열림)
git push -u origin main
```

---

## 푸시 완료 후

GitHub 저장소 확인:
https://github.com/swg2210/cast

코드가 올라갔으면 다음 단계로!
