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
