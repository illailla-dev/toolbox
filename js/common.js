// js/common.js
document.addEventListener('DOMContentLoaded', () => {
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

    // 2. [사이드바 GNB 활성화 엔진] 모든 조립이 완전히 끝난 후 실행
    Promise.all(promises).then(() => {
        setActiveMenu();
    });

    /**
     * 현재 인터넷 주소창의 경로를 분석하여
     * #gnb 사이드바 안의 메뉴 링크에 'active' 클래스를 붙여주는 함수
     */
    function setActiveMenu() {
        const currentPath = window.location.pathname;

        // [수정] 헤더 대신 사이드바(#gnb) 내부의 a 태그들을 정확하게 타겟팅합니다.
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
});


// 모든 인클루드 조립이 끝난 후 버튼에 이벤트를 바인딩합니다

Promise.all(promises).then(() => {
    setActiveMenu();
    initShareButton();
    initBookmarkButton(); // 🚀 즐겨찾기 기능 초기화 함수 추가
});

function initBookmarkButton() {
    const btnBookmark = document.getElementById('btn-bookmark-site');
    if (!btnBookmark) return;

    btnBookmark.addEventListener('click', () => {
        // 현재 사용자가 머물고 있는 페이지의 타이틀과 주소를 동적으로 자동 수집
        const title = document.title;
        const url = window.location.href;

        // 1. 구형 브라우저 전용 자동 등록 시도
        if (window.sidebar && window.sidebar.addPanel) {
            window.sidebar.addPanel(title, url, '');
        } else if (window.external && ('AddFavorite' in window.external)) {
            window.external.AddFavorite(url, title);
        }
        // 2. 최신 모바일/PC 브라우저용 환경별 안내 팝업 (UX 최적화 방어 코드)
        else {
            const userAgent = navigator.userAgent.toLowerCase();

            // 모바일 아이폰 (사파리 등)
            if (userAgent.indexOf('iphone') > -1 || userAgent.indexOf('ipad') > -1) {
                alert('📱 [아이폰 유저 안내]\n브라우저 하단의 [공유] 버튼을 누른 뒤\n[홈 화면에 추가]를 선택하시면 앱처럼 편하게 쓰실 수 있습니다!');
            }
            // 모바일 갤럭시 (안드로이드)
            else if (userAgent.indexOf('android') > -1) {
                alert('📱 [갤럭시 유저 안내]\n브라우저 우측 상단 또는 하단의 [메뉴(점3개)]를 누른 뒤\n[현재 페이지 추가] 또는 [북마크 추가]를 선택해 주세요!');
            }
            // PC 브라우저 (크롬, 엣지, 웨일 등)
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
        // 현재 페이지의 Title과 실제 인터넷 주소창 URL을 실시간으로 수집
        const shareData = {
            title: document.title,
            text: document.querySelector('meta[name="description"]')?.getAttribute('content') || '만능 계산기 툴박스',
            url: window.location.href
        };

        // 1. 스마트폰 모바일 브라우저인 경우 (Native Share 기능 작동)
        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.log('공유가 취소되었거나 오류가 발생했습니다.', err);
            }
        }
        // 2. PC 브라우저라 공유창이 안 뜨는 경우 (클립보드 주소 자동 복사 방어 로직)
        else {
            try {
                await navigator.clipboard.writeText(shareData.url);
                alert('🔗 현재 계산기 주소가 클립보드에 복사되었습니다! 원하시는 곳에 붙여넣기(Ctrl+V) 하세요.');
            } catch (err) {
                // 구형 브라우저 대응 임시 텍스트 박스 복사 기법
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

