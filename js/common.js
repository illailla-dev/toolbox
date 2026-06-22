// js/common.js
document.addEventListener('DOMContentLoaded', () => {
    // 🚀 [애드센스 자동광고 스크립트 동적 주입 엔진]
    const adsenseScript = document.createElement('script');
    adsenseScript.async = true;
    // ⚠️ 아래 src 주소 부분에 방금 애드센스에서 복사해 오신 본인의 고유 주소(ca-pub-xxx)를 그대로 붙여넣으세요!
    adsenseScript.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4325928042936631";
    adsenseScript.crossOrigin = "anonymous";
    document.head.appendChild(adsenseScript);

    // 1. [인클루드 엔진] data-include 속성을 가진 요소를 찾아 HTML 조립
    const includeElements = document.querySelectorAll('[data-include]');

    const promises = Array.from(includeElements).map(el => {
        const file = el.getAttribute('data-include');
        if (!file) return Promise.resolve();

        // [참고] 절대경로 호출 싱크 유지를 위해 '/' 접두어 바인딩 유지
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
        initShareButton();
        initBookmarkButton(); // 🚀 안쪽으로 이동시켜 전역 에러를 완벽 방어합니다.

        const toggleBtn = document.querySelector('#toggle-open');
        const gnb = document.querySelector('#gnb'); // 🚀 nav 대신 #gnb 선택

        if (!toggleBtn || !gnb) return;

        const icon = toggleBtn.querySelector('.bi');
        if (!icon) return;

        // 1. 토글 버튼 클릭 이벤트
        toggleBtn.addEventListener('click', () => {
            const isOpen = document.body.classList.toggle('is-open');
            // if (isOpen) {
            //     icon.classList.replace('bi-list', 'bi-x');
            // } else {
            //     icon.classList.replace('bi-x', 'bi-list');
            // }
        });

        // 2. 🚀 #gnb::after 딤배경 클릭 시 메뉴 닫기
        gnb.addEventListener('click', (e) => {
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
});

// 전역 공간에 단독 배치하여 이벤트를 안정적으로 바인딩합니다.
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

            if (userAgent.indexOf('iphone') > -1 || userAgent.indexOf('ipad') > -1) {
                alert('📱 [아이폰 유저 안내]\n브라우저 하단의 [공유] 버튼을 누른 뒤\n[홈 화면에 추가]를 선택하시면 앱처럼 편하게 쓰실 수 있습니다!');
            } else if (userAgent.indexOf('android') > -1) {
                alert('📱 [갤럭시 유저 안내]\n브라우저 우측 상단 또는 하단의 [메뉴(점3개)]를 누른 뒤\n[현재 페이지 추가] 또는 [북마크 추가]를 선택해 주세요!');
            } else {
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
