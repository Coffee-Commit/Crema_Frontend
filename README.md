# [CREMA] 커피챗 플랫폼
<div align="center">
    <div>
        <img src="https://github.com/Coffee-Commit/Crema_Infra/blob/main/docs/img/mainHero.webp?raw=true" 
        alt="Main Image" width="300" height= "300">
    </div>
</div>


# 🚀 목차
- [📌 프로젝트 소개](#프로젝트-소개)
  - [개요](#개요)
  - [주요 기능](#주요-기능)
  - [멤버](#멤버)
  
- [🎨 화면 구성](#화면-구성)
  - [데모 영상](#데모-영상)
  - [스크린샷](#스크린샷)

- [🛠️ 기술 스택](#기술-스택)

- [💡 아키텍처](#아키텍처)

- [🗂️ ERD Diagram](#ERD-Diagram)

- [💥 Challenges & Troubleshooting](#challenges--troubleshooting)
  
- [🚦 시작 가이드](#시작-가이드)

- [🌐 문서 보기](#문서-목록)

---

<br><br><br>

# 프로젝트 소개
### "Cream는 취업 준비 과정에서 현직자와 구직자를 부담 없이 연결할 수 있는 1:1 커피챗 서비스"
## 개요
- ### 프로젝트 이름: Crema (크레마) - 커피챗 플랫폼
- ### 문제 정의
  - "주니어 멘토는 자신의 경험이 과연 누군가에게 도움이 될 만큼 가치 있는지에 대한 불안 때문에 참여를 주저"
  - "취업, 이직을 준비하는 사람들은 현직자의 경험과 맥락적 정보를 원함"
  - "장기 네트워킹, 오프라인 모임은 시간, 비용, 심리적 부담이 커서 참여 장벽이 높음"
- ### 프로젝트 목적
  - 주니어 멘토가 부담 없이 대화할 수 있도록, 크레마는 '멘토링'이 아닌 '커피챗'으로 포지셔닝
  - 화상, 음성, 채팅, 자료공유 등 자유롭게 이야기할 수 있는 환경 제공
  - 짧고 부담 없는 '1:1 온라인 커피챗 경험'을 통해 멘토, 멘티 모두의 진입 장벽을 낮춤
  - '예약, 화상채팅, 일정 관리' 기능을 통합하여 원스톱 커리어 네트워킹 서비스 구축
- ### 프로젝트 기간: 2025.08.11 ~ 2025.09.15 (35일)
  ![Developer Day #1](https://github.com/Coffee-Commit/Crema_Infra/blob/main/docs/img/calendar1.png)
  ![Developer Day #2](https://github.com/Coffee-Commit/Crema_Infra/raw/main/docs/img/calendar2.png)

## 주요 기능
- ### 로그인 / 회원가입 
  - OAuth2(Google, Kakao)를 통한 간편 로그인
- ### 예약 기능
  - 멘토/멘티 간 커피챗 일정 예약 및 관리
- ### 화상 채팅
  - OpenVidu 라이브러리를 활용한 실시간 1:1 화상 대화
- ### 마이페이지
  - 예약 내역, 진행 예정 커피챗, 알림 기록 확인
- ### 멘토/멘티 프로필
  - 멘토의 전문 분야, 경력, 관심사 공개 및 검색 가능
- ### 후기/피드백
  - 커피챗 종료 후 간단한 후기 작성 기능

<br><br><br>

## 멤버
<div align="center">
    <table style="width:100%; border:none;">
        <tr style="border:none;">
            <td align="center" style="border:none;">
                <a href="https://github.com/Coffee-Commit" target="_blank">
                    <img src="https://avatars.githubusercontent.com/u/225826661?s=200&v=4" alt="김민지" width="100px" height="100px" style="border-radius:50%; margin-bottom: 10px;">
                    <br />
                    <b>김민지</b>
                    <br />
                    <samp>Product Management</samp>
                </a>
            </td>
            <td align="center" style="border:none;">
                <a href="https://github.com/hyakki54" target="_blank">
                    <img src="https://avatars.githubusercontent.com/u/132263433?v=4" alt="김선민" width="100px" height="100px" style="border-radius:50%; margin-bottom: 10px;">
                    <br />
                    <b>김선민</b>
                    <br />
                    <samp>Product Designer</samp>
                </a>
            </td>
            <td align="center" style="border:none;">
                <a href="https://github.com/H0D0D0" target="_blank">
                    <img src="https://avatars.githubusercontent.com/u/191853420?v=4" alt="멤버3 이름" width="100px" height="100px" style="border-radius:50%; margin-bottom: 10px;">
                    <br />
                    <b>윤하정</b>
                    <br />
                    <samp>Product Designer</samp>
                </a>
            </td>
            <td align="center" style="border:none;">
                <a href="https://github.com/yg5057" target="_blank">
                    <img src="https://avatars.githubusercontent.com/u/120440647?v=4" alt="조연경" width="100px" height="100px" style="border-radius:50%; margin-bottom: 10px;">
                    <br />
                    <b>조연경</b>
                    <br />
                    <samp>FrontEnd</samp>
                </a>
            </td>
        </tr>
        <tr style="border:none;">
            <td align="center" style="border:none;">
                <a href="https://github.com/jam9582" target="_blank">
                    <img src="https://avatars.githubusercontent.com/u/100444769?v=4" alt="권재은" width="100px" height="100px" style="border-radius:50%; margin-bottom: 10px;">
                    <br />
                    <b>권재은</b>
                    <br />
                    <samp>BackEnd</samp>
                </a>
            </td>
            <td align="center" style="border:none;">
                <a href="https://github.com/Roysung0625" target="_blank">
                    <img src="https://avatars.githubusercontent.com/u/50332234?v=4" alt="성정현" width="100px" height="100px" style="border-radius:50%; margin-bottom: 10px;">
                    <br />
                    <b>성정현</b>
                    <br />
                    <samp>BackEnd</samp>
                </a>
            </td>
            <td align="center" style="border:none;">
                <a href="https://github.com/BDOR665" target="_blank">
                    <img src="https://avatars.githubusercontent.com/u/165445587?v=4" alt="장윤영" width="100px" height="100px" style="border-radius:50%; margin-bottom: 10px;">
                    <br />
                    <b>장윤영</b>
                    <br />
                    <samp>BackEnd</samp>
                </a>
            </td>
            <td align="center" style="border:none;">
                <a href="https://github.com/csyhorizon" target="_blank">
                    <img src="https://avatars.githubusercontent.com/u/20658149?v=4" alt="최수용" width="100px" height="100px" style="border-radius:50%; margin-bottom: 10px;">
                    <br />
                    <b>최수용</b>
                    <br />
                    <samp>Infra & DevOps</samp>
                </a>
            </td>
        </tr>
    </table>
</div>

---

<br><br><br>

# 화면 구성
## 데모 영상
- [데모 영상 바로가기](https://youtu.be/Mw2rVH66TLg)
## 스크린샷
- 아직 없음
---

<br><br><br>

## 기술 스택
### 🖥️ FrontEnd
![Next JS](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/tailwindcss-06B6D4.svg?&style=for-the-badge&logo=tailwindcss&logoColor=white)

### 🔧 BackEnd
![Java](https://img.shields.io/badge/java-%23ED8B00.svg?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)


### 💾 Database
![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)
![MySQL](https://img.shields.io/badge/mysql-4479A1.svg?style=for-the-badge&logo=mysql&logoColor=white)

### Cloud Storage
![Amazon S3](https://img.shields.io/badge/Amazon%20S3-FF9900?style=for-the-badge&logo=amazons3&logoColor=white)


### 🛠️ Development Tools
![Swagger](https://img.shields.io/badge/-Swagger-%23Clojure?style=for-the-badge&logo=swagger&logoColor=white)
![Jenkins](https://img.shields.io/badge/jenkins-%232C5263.svg?style=for-the-badge&logo=jenkins&logoColor=white)
![Argo CD](https://img.shields.io/badge/Argo%20CD-FF470F?style=for-the-badge&logo=argocd&logoColor=white)

### ☁️ Infra
![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)
![Google Cloud](https://img.shields.io/badge/GoogleCloud-%234285F4.svg?style=for-the-badge&logo=google-cloud&logoColor=white)
![Kubernetes](https://img.shields.io/badge/kubernetes-%23326ce5.svg?style=for-the-badge&logo=kubernetes&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![Nginx](https://img.shields.io/badge/nginx-%23009639.svg?style=for-the-badge&logo=nginx&logoColor=white)

### 📈 Monitoring
![Grafana](https://img.shields.io/badge/grafana-%23F46800.svg?style=for-the-badge&logo=grafana&logoColor=white)
![Prometheus](https://img.shields.io/badge/Prometheus-E6522C?style=for-the-badge&logo=Prometheus&logoColor=white)

### 💬 Communication & Design Tools
![GitHub](https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white)
![Notion](https://img.shields.io/badge/Notion-%23000000.svg?style=for-the-badge&logo=notion&logoColor=white)
![Discord](https://img.shields.io/badge/Discord-%235865F2.svg?style=for-the-badge&logo=discord&logoColor=white)
![Figma](https://img.shields.io/badge/figma-%23F24E1E.svg?style=for-the-badge&logo=figma&logoColor=white)
---

<br><br><br>

## 아키텍처
![Architecture Diagram](https://github.com/Coffee-Commit/Crema_Infra/raw/main/docs/img/system_architecture.png)

---

<br><br><br>

## ERD Diagram
![ERD Diagram](https://github.com/Coffee-Commit/Crema_Infra/blob/main/docs/img/erd_diagram.png)

- **회원/사용자 관련**
  - `멤버(루키) 테이블`: 멘토/멘티 계정 정보 저장
  - `멤버 직무 테이블`: 멤버별 관심 직무 정보
- **커피챗/예약 관련**
  - `예약 테이블`: 멘토와 멘티 간 커피챗 예약 내역
  - `스케줄 테이블` + `시간 테이블`: 멘토의 가능한 일정 관리
  - `커피챗 단위시간 테이블`: 시간 단위별 요금/예약 단위
  - `화상채팅 테이블`: 예약에 대한 화상 채팅 기록
- **가이드/주제 관련**
  - `가이드 테이블`: 멘토 가이드 정보
  - `가이드 직무 테이블`, `가이드 커피챗 주제 중간 테이블`: 가이드별 주제와 직무 매핑
  - `경험 대주제 테이블`, `경험 소주제 테이블`: 커피챗에서 다루는 경험 주제
- **커뮤니케이션/부가 기능**
  - `알림 테이블`: 예약/채팅 알림 기록
  - `사전질문 테이블`, `사전질문 파일`: 사전 질문과 첨부 파일 관리
  - `후기 테이블`, `멘티 경험 리뷰 테이블`: 커피챗 후기/피드백
- **태그/중간 테이블**
  - `해시태그 테이블`, `멤버 커피챗 중간 테이블`, `커피챗 테이블`: 주제/태그/연관 관계 관리

---

<br><br><br>

## 시작 가이드

> ⚠️ **현재 배포 서버는 종료되어 직접 실행할 수 없습니다.**
> 
> Crema 서비스의 주요 기능 및 사용자 경험은 아래 시연 영상을 통해 확인하실 수 있습니다.
> 
> 🔗 **[시연 영상 링크]** (여기에 YouTube 또는 기타 영상 링크를 삽입해 주세요.)
---

<br><br><br>

## 문서 목록
📖 [API 문서 보기](https://coffee-commit.github.io/Crema_Infra/html/api-doc.html)
