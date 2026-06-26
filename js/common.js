document.addEventListener('DOMContentLoaded', () => {
    // 🚀 [애드센스 자동광고 스크립트 동적 주입 엔진]
    const adsenseScript = document.createElement('script');
    adsenseScript.async = true;
    adsenseScript.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4325928042936631";
    adsenseScript.crossOrigin = "anonymous";
    document.head.appendChild(adsenseScript);

    // 🚀 [애드센스 계정 메타 태그 동적 주입]
    const adsenseMeta = document.createElement('meta');
    adsenseMeta.name = "google-adsense-account";
    adsenseMeta.content = "ca-pub-4325928042936631";
    document.head.appendChild(adsenseMeta);

    // 1. [인클루드 엔진] data-include 속성을 가진 요소를 찾아 HTML 조립
    const includeElements = document.querySelectorAll('[data-include]');
    const promises = Array.from(includeElements).map(el => {
        const file = el.getAttribute('data-include');
        if (!file) return Promise.resolve();
        return fetch('/' + file)
            .then(response => {
                if (response.ok) return response.text();
                throw new Error(`${file} 파일을 불러오지 못했습니다.`);
            })
            .then(data => {
                el.innerHTML = data;
                el.removeAttribute('data-include');
                return el;
            })
            .catch(error => console.error(error));
    });

    // 2. 모든 인클루드 조립이 끝난 후 내부에서 모든 초기화 함수를 안전하게 실행합니다.
    Promise.all(promises).then(() => {
        setActiveMenu();
        requestAnimationFrame(() => {
            scrollToActiveMenu();
        });

        initShareButton();
        initBookmarkButton();

        const toggleBtn = document.querySelector('#toggle-open');
        const gnb = document.querySelector('#gnb');

        if (!toggleBtn || !gnb) return;

        const icon = toggleBtn.querySelector('.bi');
        if (!icon) return;

        // 1. 토글 버튼 클릭 이벤트
        toggleBtn.addEventListener('click', (e) => {
            // 🚀 버튼 클릭이 document의 클릭 이벤트로 전파되는 것을 막습니다.
            e.stopPropagation();

            const isOpen = document.body.classList.toggle('is-open');

            // 주석 해제 및 아이콘 교체 로직 완성
            if (isOpen) {
                icon.classList.replace('bi-list', 'bi-x');
            } else {
                icon.classList.replace('bi-x', 'bi-list');
            }
        });

        // 2. 바깥 영역(딤배경 등) 클릭 시 메뉴 닫기
        document.addEventListener('click', (e) => {
            // 🚀 메뉴가 열려있을 때만 작동하도록 조건 추가 (성능 최적화)
            if (!document.body.classList.contains('is-open')) return;

            // 클릭된 타겟이 실제 메뉴창(<nav>) 내부가 아닐 때만 닫기 실행
            if (!e.target.closest('nav')) {
                document.body.classList.remove('is-open');
                icon.classList.replace('bi-x', 'bi-list');
            }
        });
    });


    /**
     * 현재 인터넷 주소창의 경로를 분석하여
     * #gnb 사이드바 안의 메뉴 링크에 'active' 클래스를 붙여주는 함수
     */
    function setActiveMenu() {
        const currentPath = window.location.pathname;
        const menuLinks = document.querySelectorAll('#gnb nav a');

        menuLinks.forEach(link => {
            const linkHref = link.getAttribute('href');

            // 메인 홈(/) 처리
            if (linkHref === '/' || linkHref === '/index.html') {
                if (currentPath === '/' || currentPath === '/index.html') {
                    link.classList.add('active');
                }
            }
            // 서브 폴더 페이지 처리
            else if (linkHref && currentPath.includes(linkHref)) {
                link.classList.add('active');
            }
        });
    }
    function scrollToActiveMenu() {
        const menuWrapper = document.querySelector('#gnb');
        const activeMenu = document.querySelector('#gnb nav a.active'); // 🚀 li → a 로 변경

        if (!menuWrapper || !activeMenu) {
            console.log('조건 불만족으로 return');
            return;
        }

        const wrapperRect = menuWrapper.getBoundingClientRect();
        const activeRect = activeMenu.getBoundingClientRect();

        const scrollTarget = menuWrapper.scrollTop
            + (activeRect.top - wrapperRect.top)
            - (menuWrapper.clientHeight / 2)
            + (activeMenu.offsetHeight / 2);

        console.log('scrollTarget:', scrollTarget);

        menuWrapper.scrollTo({
            top: scrollTarget,
            behavior: 'smooth'
        });
    }


});

function initBookmarkButton() {
    const btnBookmark = document.getElementById('btn-bookmark-site');
    if (!btnBookmark) return;

    btnBookmark.addEventListener('click', () => {
        const title = document.title;
        const url = window.location.href;

        if (window.sidebar && window.sidebar.addPanel) {
            window.sidebar.addPanel(title, url, '');
        } else if (window.external && ('AddFavorite' in window.external)) {
            window.external.AddFavorite(url, title);
        } else {
            const userAgent = navigator.userAgent.toLowerCase();

            // 1. 아이폰 / 아이패드 유저 판별
            if (userAgent.indexOf('iphone') > -1 || userAgent.indexOf('ipad') > -1) {
                // 사파리 외 다른 브라우저들 판별 (크롬, 네이버, 카카오톡, 라인, 페이스북 등)
                const isNotSafari = /crios|crumbs|fxios|naver|kakaotalk|line|fbios|fban/.test(userAgent);

                if (isNotSafari) {
                    alert('📱 [아이폰 유저 안내]\n현재 브라우저에서는 홈 화면 추가가 지원되지 않습니다.\n[사파리(Safari)] 앱으로 접속하시면 앱처럼 사용 가능합니다!');
                } else {
                    alert('📱 [아이폰 유저 안내]\n브라우저 하단의 [공유] 버튼을 누른 뒤\n[홈 화면에 추가]를 선택하시면 앱처럼 편하게 쓰실 수 있습니다!');
                }
            }
            // 2. 안드로이드 유저 판별
            else if (userAgent.indexOf('android') > -1) {
                alert('📱 [갤럭시 유저 안내]\n브라우저 우측 상단 또는 하단의 [메뉴(점3개)]를 누른 뒤\n[현재 페이지 추가] 또는 [북마크 추가]를 선택해 주세요!');
            }
            // 3. PC 및 기타 기기 유저 대응
            else {
                alert('💻 [PC 유저 안내]\n키보드에서 [ Ctrl + D ] 키를 동시에 누르시면\n현재 계산기가 북마크에 바로 등록됩니다!');
            }
        }
    });
}


function initShareButton() {
    const btnShare = document.getElementById('btn-share-site');
    if (!btnShare) return;

    btnShare.addEventListener('click', async () => {
        const shareData = {
            title: document.title,
            text: document.querySelector('meta[name="description"]')?.getAttribute('content') || '만능 계산기 툴박스',
            url: window.location.href
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.log('공유가 취소되었거나 오류가 발생했습니다.', err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(shareData.url);
                alert('🔗 현재 계산기 주소가 클립보드에 복사되었습니다! 원하시는 곳에 붙여넣기(Ctrl+V) 하세요.');
            } catch (err) {
                const textArea = document.createElement("textarea");
                textArea.value = shareData.url;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                alert('🔗 주소가 복사되었습니다.');
            }
        }
    });
}

// ==========================================
// 📐 EVERY CALC 전역 계산기 완성형 검색 데이터베이스
// ==========================================
var everyCalcDatabase = [
    { title: "🍀 로또 번호 생성기", url: "/lotto/", keywords: "로또 당첨 번호 추천 복권 행운 번호 추첨 ㄹㄸ" },
    { title: "⏳ 만 나이 계산기", url: "/korean-age/", keywords: "만나이 연나이 생일 나이 계산 법적나이 나이 기준 ㄴㅇ" },
    { title: "🍽️ 다이어트 탄단지 계산기", url: "/diet-macros/", keywords: "다이어트 기초대사량 탄단지 비율 식단 매크로 칼로리 ㄷㅇㅇㅌ" },
    { title: "🚗 자동차 채권 환급 계산기", url: "/car-bond/", keywords: "자동차채권 미환급금 지역개발채권 도시철도 미청구 채권 환급 ㅈㄷㅊ" },
    { title: "💰 예적금 만기 이자 계산기", url: "/savings/", keywords: "정기예금 정기적금 복리 단리 만기이자 세후 실수령액 적금 이자 ㅈㄱ" },
    { title: "📉 해외주식 절세 계산기", url: "/global-stock-tax/", keywords: "미국주식 양도소득세 분할매도 250만원 공제 손실확정 절세 전략 ㅈㅅ" },
    { title: "📉 주식 물타기 계산기", url: "/stock-average/", keywords: "평단가 평단 물타기 추매 추가매수 주식 평단 계산기 평단가낮추기 ㅈㅅ" },
    { title: "📈 주식 수익률 계산기", url: "/stock-roi/", keywords: "수익률 실현손익 매매수수료 세금 주식 정산 평단가 수익률계산 ㅈㅅ" },
    { title: "🏦 대환대출 이자 계산기", url: "/loan-refinancing/", keywords: "대출이자 대환대출 갈아타기 중도상환수수료 금리인하 원리금균등 ㄷㅊ" },
    { title: "📦 쿠팡 파트너스 계산기", url: "/coupang-partners/", keywords: "쿠팡파트너스 제휴마케팅 부업 정산 수익 링크 수익률 ㅋㅍ" },
    { title: "🎁 쿠팡 체험단 점수 & 확률 계산기", url: "/coupang-reviewer/", keywords: "쿠팡체험단 리뷰어점수 고가 가전 선정확률 도움돼요 리뷰점수 ㅋㅍ" },
    { title: "📱 숏폼 수익 계산기", url: "/shorts-revenue/", keywords: "유튜브 쇼츠 인스타 릴스 틱톡 조회수 수익 플랫폼 정산 PPL 단가 ㅅㅊ" },
    { title: "📈 셀러 마진율 계산기", url: "/seller-margin/", keywords: "스마트스토어 오픈마켓 판매 마진 수수료 세금 원가 도매 마진율 ㅅㄹ" },
    { title: "✈️ 직구 관부가세 계산기", url: "/customs-duty/", keywords: "해외직구 관세 부가세 고시환율 면세 한도 통관 배대지 ㅈㄱ" },
    { title: "🔤 웹폰트 서브셋 생성기", url: "/font-subset/", keywords: "웹폰트 경량화 woff2 서브셋 폰트 용량 줄이기 웹디자인 ㅍㅌ" },
    { title: "📸 인스타 피드 이미지 분할기", url: "/insta-splitter/", keywords: "인스타그램 피드 분할 자르기 그리드 이미지 분할 바둑판 ㅇㅅㅌ" },
    { title: "🧶 코바늘 게이지 계산기", url: "/gauge/", keywords: "코바늘 대바늘 뜨개질 게이지 스와치 단수 콧수 뜨개 계산 ㄱㅇㅈ" },
    { title: "📅 군대 전역일 계산기", url: "/military-calc/", keywords: "육군 해군 공군 의경 해병대 전역일 복무일 휴가 계산 군대 ㅈㅇ" },
    { title: "🔨 인쇄 픽셀 환산기", url: "/print-size/", keywords: "인쇄 사이즈 dpi 픽셀 mm 변환 실사출력 현수막 인쇄 크기 ㅇㅅ" },
    { title: "💰 중고거래 마진 계산기", url: "/used-trade/", keywords: "당근 중고나라 번개장터 리셀 중고마진 수익 계산 차익 거래 ㅈㄱ" },
    { title: "🎓 학점 변환기", url: "/gpa-converter/", keywords: "대학학점 백분율 평점 4.5 4.3 취업 이력서 학점 계산 ㅎㅈ" },
    { title: "🧾 프리랜서 3.3% 세금 계산기", url: "/freelancer-tax/", keywords: "원천징수 사업소득 3.3 세후 실수령액 종합소득세 알바 프리랜서 세금 ㅂㅇ" },
    { title: "🚗 유류비 정산 계산기", url: "/fuel-cost/", keywords: "연비 기름값 유류비 출장 정산 카풀 주유비 차비 계산 ㅇㄹㅂ" },
    { title: "💸 주휴수당 계산기", url: "/weekly-holiday-pay/", keywords: "알바 주휴수당 시급 주 15시간 최저임금 근로기준법 수당 ㅈㅎㅅㄷ" },
    { title: "💼 퇴사 가치, 실업급여 환산기", url: "/exit-salary/", keywords: "퇴직금 평균임금 실업급여 수급기간 하한액 고용보험 이직 확정금액 ㅌㅅ" },
    { title: "📅 연차 수당 계산기", url: "/annual-leave/", keywords: "미사용 연차 연차수당 통상임금 연차일수 근로기준법 월급 환산 ㅇㅊ" },
    { title: "🔤 연봉 인상률 계산기", url: "/salary-increment/", keywords: "연봉 협상 인상률 실수령액 세후 인상금액 임금인상 ㅇㅂ" },
    { title: "👶 아기 예방접종 계산기", url: "/baby-vaccine/", keywords: "영유아 예방접종 차수별 국가예방접종 필수접종 아기 건강 육아 ㅇㄱ" },
    { title: "🏦 청년도약계좌 만기 & 해지 계산기", url: "youth-leap", keywords: "청년도약 비과세 정부기여금 적금 만기수령 중도해지 특별해지 사유 ㅊㄴ" },
    { title: "💵 건강보험 피부양자 계산기", url: "/hi-dependent/", keywords: "건보료 피부양자 자격상실 사업소득 과세표준 지역가입자 건강보험 ㄱㅂㄹ" },
    { title: "🧾 신용카드 소득공제 계산기", url: "/card-deduction/", keywords: "연말정산 신용카드 체크카드 현금영수증 소득공제 문턱 황금비율 환급 ㅋㄷ" },
    { title: "📊 연금저축 IRP 환급 계산기", url: "/irp-tax/", keywords: "연금저축 세액공제 IRP 개인형퇴직연금 연말정산 환급금 절세 한도 ㅇㄱ" },
    { title: "🚗 배달 라이더 순수익 계산기", url: "/delivery-rider/", keywords: "배민커넥트 쿠팡이츠 배달파트너 라이더 순시급 유류비 긱워커 부업 오토바이 ㅂㄷ" },
    { title: "💰 무인 점포 창업 손익분기점 계산기", url: "/unmanned-store/", keywords: "무인카페 무인아이스크림 인생네컷 사진관 창업 손익분기점 마진율 고정비 bep 부업 ㅁㅇ" },
    { title: "🏥 실손보험 세대별 갱신 및 4세대 전환 비교기", url: "/indemnity-insurance/", keywords: "실비보험 실손의료보험 4세대실비 보험료인상 갱신보험료 보험갈아타기 ㅂㅎ" },
    { title: "🏦 마이너스통장 vs 신용대출 이자 비교기", url: "/minus-loan/", keywords: "마이너스통장 마통 신용대출 대출이자 일할계산 한도대출 복리이자 대출비교 ㄷㅊ" },
    { title: "📦 당근·중고나라 택배비 최저가 비교기", url: "/parcel-cost/", keywords: "반값택배 알뜰택배 편의점택배 우체국택배 배송비비교 중고거래 택배요금 ㅌ배" },
    { title: "📐 UI 픽셀-rem 배수별 환산기", url: "/rem-converter/", keywords: "픽셀변환 rem em px 디자이너 피그마 모바일배수 레티나 해상도 ㅍㅅ" },
    { title: "📐 CSS Clamp() 반응형 자동 계산기", url: "/css-clamp/", keywords: "클램프계산기 cssclamp 유동형폰트 반응형웹 모바일비율 픽셀환산 패딩마진 ㅋㄹ" },
    { title: "🕒 CSS 큐빅 베이지어 애니메이션 계산기", url: "/css-bezier/", keywords: "큐빅베이지어 cubicbezier 가속도계산기 css트랜지션 이징함수 애니메이션 효과 ㅊㅈ" },
    { title: "🎨 화사한 그라디언트 중간톤 보정기", url: "/gradient-blend/", keywords: "그라디언트 그라데이션 피그마 색상보정 cssgradient 컬러블렌딩 디자이너 ㅋㄹ" },
    { title: "🔲 모던 UI 다중 그림자 생성기", url: "/box-shadow/", keywords: "박스섀도우 boxshadow 그림자효과 피그마그림자 다중그림자 레이어 그림자디자인 ㅂㅅ" },
    { title: "✍️ 네이버 블로그 글자수 & 원고지 환산기", url: "/blog-wordcount/", keywords: "블로그글자수 공백제외 스마트에디터 원고대행 상위노출 체험단 원고지 환산 ㅂㄹㄱ" },
    { title: "📅 외주 프로젝트 마일스톤 D-Day 플래너", url: "/project-milestone/", keywords: "프리랜서 외주마감 일정관리 마일스톤 디데이 크몽 사파리날짜버그 플래너 ㅍㄹㅈㅌ" },
    { title: "💼 프리랜서 적정 종합 시급 환산기", url: "/freelancer-wage/", keywords: "프리랜서시급 외주단가 연봉환산 프리랜서단가 몸값계산 프로젝트단가 부업 ㅂㅇ" },
    { title: "🏢 숨만 쉬고 건물 사기 기회비용 계산기", url: "/breathe-save/", keywords: "숨만쉬고모으기 건물주 적금 자산형성 부업권장 유머 스낵 밈 ㅁㅁ" },
    { title: "💻 내 직업 AI 대체 위험도 진단기", url: "/ai-replacement/", keywords: "AI대체 위험도 계산기 직업수명 챗지피티 대체확률 인공지능 일자리 유머 스낵 밈 ㅁㅁ" },
    { title: "🔗 QR코드 생성기", url: "/url-qr/", keywords: "qr코드생성기 무료큐알코드 큐알코드만들기 모바일마케팅 명함전단지 링크 ㅋㅇ" },
    { title: "✈️ 해외 의류·신발 사이즈 변환기", url: "/size-converter/", keywords: "해외직구 옷사이즈 미국사이즈 유럽사이즈 신발사이즈표 직구 사이즈변환 ㅈㄱ" },
    { title: "🏢 평수/제곱미터(㎡) 양방향 변환기", url: "/pyeong-converter/", keywords: "평수계산 제곱미터변환 아파트면적 전용면적 공급면적 평형 환산 부동산 ㅂㄷㅅ" },
    { title: "💵 연봉 실수령액 상세 계산기", url: "/salary-calc/", keywords: "연봉계산기 월급실수령액 4대보험 근로소득세 비과세 세후월급 실수령 랭킹 ㅇㅂ" },
    { title: "🔌 에어컨/난방 가전 전기세 폭탄 방지 계산기", url: "/electronic-bill/", keywords: "전기세계산기 에어컨전기세 전기요금누진세 인버터정속형 온풍기전기세 전기세폭탄 한전기본요금 여름철전기세 겨울전기요금 ㅇㅂ" },
    { title: "💰 목표 자금 달성 저축 스케줄러", url: "/target-savings/", keywords: "목표금액계산기 종잣돈모으기 목돈만들기 적금계산기 재테크스케줄러 미래자산 복리계산기 월저축액계산 목돈스케줄러 적금단리 복리역산 ㅇㅂ" },
    { title: "🏠 청년 주택드림 청약 통장 시뮬레이터", url: "/youth-housing/", keywords: "청년주택드림청약통장 청약통장계산기 주택드림대출한도 청약우대금리 청년적금 내집마련 청약통장이자 청년정책금융 주담대한도 ㅇㅂ" },
    { title: "📦 쿠팡이츠·배민커넥트 배달 부업 세후 순수익 계산기", url: "/delivery-side/", keywords: "배달부업계산기 쿠팡이츠정산 배민커넥트수익 배달세후순수익 N잡러시급 자전거배달수익 도보배달 배달수수료 원천징수3.3 부업시급 ㅇㅂ" },
    { title: "📐 CSS 세밀화 가변 라인 클램프 계산기", url: "/line-clamp/", keywords: "라인클램프 CSS말줄임 여러줄말줄임 line-clamp max-height계산 웹퍼블리싱 크로스브라우징 생략기호 퍼블리셔유틸 타이포그래피 소스코드자동생성 ㅇㅂ" },
    { title: "🔲 CSS 가변 가로세로 비율 종횡비 계산기", url: "/aspect-ratio/", keywords: "종횡비계산기 aspect-ratio 가로세로비율 반응형이미지 유튜브임베드 웹퍼블리싱 비율유지 패딩우회 퍼블리셔유틸 피그마비율 박스크기 오차역산 순수CSS코드 ㅇㅂ" },
    { title: "🔠 서체 행간 가변 감쇄 보정 계산기 (Line-Height Crop)", url: "/line-height-crop/", keywords: "행간종횡비 line-height-crop 고스트공백 텍스트여백제거 피그마정렬오차 타이포그래피교정 웹퍼블리싱 가상요소믹스인 퍼블리셔유틸 프리텐다드 본고딕 순수CSS코드 ㅇㅂ" },
    { title: "📐 현대식 모던 CSS 그리드 트랙 오토배치 생성기", url: "/grid-template/", keywords: "그리드계산기 cssgrid 오토배치 auto-fit minmax계산 반응형레이아웃 웹퍼블리싱 거터정렬 퍼블리셔유틸 미디어쿼리 프리플렉스 순수CSS코드 ㅇㅂ" },
    { title: "📱 반응형 웹 마스터 단위 변환기 (PX / REM / VW / VH)", url: "/responsive-unit/", keywords: "단위변환기 pxrem변환 pxvw변환 rem계산기 반응형웹 vw계산기 vh변환 웹퍼블리싱 퍼블리셔유틸 피그마수치 가변단위 역산교차 순수CSS코드 ㅇㅂ" },
    { title: "🎬 CSS 키프레임 이징 마스터 생성기", url: "/css-animation/", keywords: "CSS애니메이션 키프레임 @keyframes 큐빅베지에 이징계산기 퍼블리셔 모션프리셋 인터랙션" },
    { title: "🖱️ SVG 마우스 드로잉 빌더", url: "/svg-drawing/", keywords: "SVG애니메이션 SVG드로잉 라인아트 dasharray 퍼블리셔 인터랙션 패스드로잉" },
    { title: "📝 다국어 폰트 자간 보정 및 줄바꿈 차단기", url: "/word-break/", keywords: "word-break keep-all 자간보정 letter-spacing 퍼블리셔 타이포그래피 줄바꿈방지" },
    { title: "🔤 웹폰트 깜빡임 방지 FOIT/FOUT 제어기", url: "/font-display/", keywords: "font-display swap font-face 웹폰트최적화 퍼블리셔 로딩속도 깜빡임제어" },
    { title: "🔍 복합 미디어쿼리 디바이스 표준 브레이크포인트 빌더", url: "/media-query/", keywords: "미디어쿼리 브레이크포인트 @media 반응형웹 퍼블리셔 해상도분기 스켈레톤코드 본고딕" },
    { title: "📺 유튜브 쇼츠·틱톡 조회수 수익 역산기", url: "/shorts-calc/", keywords: "쇼츠수익 유튜브수익계산기 틱톡수익 숏폼정산 RPM계산 조회수수익 크리에이터부업 세후순수익 부업계산기" },
    { title: "🎡 파이어족 조기 은퇴 자산 시뮬레이터", url: "/fire-movement/", description: "4% 법칙과 물가상승률 기반 조기 은퇴 가능 나이 및 필요 은퇴 자금 역산 시뮬레이션", keywords: "파이어족계산기 조기은퇴시뮬레이션 경제적자유 4%법칙 은퇴자금계산 파이어족 노후준비 재테크계산기" },
    { title: "💰 배당주 월세 전환 은퇴 소득 계산기", url: "/dividend-income/", description: "목표 월 배당금 기준 국내외 대표 고배당주 포트폴리오 총 필요 투자 원금 및 절세 계좌 역산 계산기", keywords: "배당금계산기 배당주투자 SCHD배당 리얼티인컴 맥쿼리인프라 월세배당 은퇴소득 재테크계산기" },
    { title: "☕ 하루 커피값 모아 목돈 만들기 계산기", url: "/coffee-calc/", description: "하루 한 잔의 커피값이나 소액 소비 지출을 아껴 장기 복리로 투자했을 때의 5년 및 10년 후 미래 자산 총액 역산 시뮬레이션", keywords: "커피값계산기 소액저축계산기 강제저축 푼돈목돈 복리계산기 주식투자시뮬레이션 절약자극" },
    { title: "🎡 GSAP 실무 필수 스켈레톤 생성기", url: "/gsap-helper/", description: "현업 웹퍼블리싱 실무에서 가장 자주 쓰이는 스크롤 트리거(ScrollTrigger), 타임라인, 스태거 시차 모션용 자바스크립트 스켈레톤 소스코드 자동 빌더", keywords: "GSAP계산기 스크롤트리거 ScrollTrigger gsap타임라인 stagger 퍼블리셔유틸 웹퍼블리싱" },
    { title: "⚡ 게임 초당 MP 소모량 및 MP 세팅 계산기", url: "/mp-calc/", keywords: "게임MP계산기 MP소모량초당계산 쿨감계산 MP감소율 스킬MP소모 엠피회복세팅 자원관리시뮬레이션" },
];


// ==========================================
// 🔍 독립 페이지 전용 초고속 실시간 검색 로직
// ==========================================
$(document).ready(function () {
    // [추가] 검색 인풋 포커스 시 화면 어둡게 제어 클래스 장착
    $(document).on('focus keyup', '#calc-search-input', function () {
        var query = $(this).val().trim();
        // 인풋에 포커스가 가거나 글자가 있을 때 body에 클래스 주입
        $('body').addClass('search-open');
    });

    // 공통 컴포넌트 비동기 fetch 완료 후 검색 인풋 감시를 위해 이벤트 위임 기법 적용
    $(document).on('input', '#calc-search-input', function () {
        // [⚠️무결점 개정] keywords가 배열 형태일 때 터지는 런타임 다운 방어 엔진 결합
        var query = $(this).val().toLowerCase().trim();
        var $resultBox = $('#calc-search-results');

        // 검색어가 비어있으면 결과창을 닫고 초기화
        if (query.length === 0) {
            $resultBox.hide().html('');
            return;
        }

        var filterResults = everyCalcDatabase.filter(function (item) {
            var itemKeywords = Array.isArray(item.keywords) ? item.keywords.join(' ') : (item.keywords || '');
            var itemTitle = item.title || '';
            return itemTitle.toLowerCase().includes(query) || itemKeywords.toLowerCase().includes(query);
        });

        // 실시간 결과 UI 생성 구역
        if (filterResults.length > 0) {
            var htmlList = '<ul class="list-group" style="position:absolute; width:100%; z-index:9999; max-height:300px; overflow-y:auto; box-shadow:0 4px 10px rgba(0,0,0,0.15);">';
            filterResults.forEach(function (calc) {
                htmlList += '<a href="' + calc.url + '" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center" style="padding:12px 15px; font-size:0.95rem;">';
                htmlList += '<span>' + calc.title + '</span>';
                htmlList += '<span class="badge">바로가기</span>';
                htmlList += '</a>';
            });
            htmlList += '</ul>';
            $resultBox.html(htmlList).show();
        } else {
            $resultBox.html('<div class="alert alert-light m-0 text-center text-muted" style="position:absolute; width:100%; z-index:9999; border:1px solid #ddd; font-size:0.9rem;">검색 결과가 없습니다.</div>').show();
        }
    });

    // 화면 다른 곳을 클릭하면 검색 결과창 닫히는 디펜스 코드
    $(document).click(function (e) {
        if (!$(e.target).closest('#search-wrapper').length) {
            $('#calc-search-results').hide();
            // [추가] 바깥 영역 클릭으로 닫힐 때 어두운 화면 클래스 전면 탈거 제거
            $('body').removeClass('search-open');
        }
    });
});

