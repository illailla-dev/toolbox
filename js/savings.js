// js/savings.js
document.addEventListener('DOMContentLoaded', () => {
    // DOM 요소 캐싱
    const form = document.getElementById('savings-form');
    const productTypes = document.getElementsByName('product-type');
    const amountLabel = document.getElementById('amount-label');

    const inputAmount = document.getElementById('input-amount');
    const amountKorean = document.getElementById('amount-korean');
    const inputRate = document.getElementById('input-rate');
    const inputMonths = document.getElementById('input-months');
    const selectMethod = document.getElementById('select-method');
    const selectTax = document.getElementById('select-tax');

    const resPrincipal = document.getElementById('res-principal');
    const resInterestBefore = document.getElementById('res-interest-before');
    const resTax = document.getElementById('res-tax');
    const resTotal = document.getElementById('res-total');

    // 1. 라디오 버튼 선택 변환 이벤트 (예금 vs 적금 라벨 교체)
    productTypes.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'deposit') {
                amountLabel.textContent = '예치 금액 (원)';
                inputAmount.placeholder = '예: 10000000 (목돈)';
            } else {
                amountLabel.textContent = '월 적립 금액 (원)';
                inputAmount.placeholder = '예: 500000 (매달)';
            }
            calculateSavings();
        });
    });

    // 2. 숫자를 한글 금액 단위로 쪼개주는 단위 변환 로직
    function convertToKoreanWon(number) {
        if (!number || isNaN(number)) return '';
        if (number === 0) return '0원';

        const units = ['', '만', '억', '조', '경'];
        let result = [];
        let numStr = Math.floor(number).toString();

        let len = numStr.length;
        let unitIndex = 0;

        while (len > 0) {
            let start = Math.max(0, len - 4);
            let chunk = parseInt(numStr.substring(start, len), 10);

            if (chunk > 0) {
                result.unshift(chunk.toLocaleString() + units[unitIndex]);
            }
            unitIndex++;
            len -= 4;
        }
        return result.join(' ') + ' 원';
    }

    // 3. 메인 금융 계산 엔진 함수
    function calculateSavings() {
        const type = document.querySelector('input[name="product-type"]:checked').value;
        const amount = parseFloat(inputAmount.value) || 0;
        const rate = (parseFloat(inputRate.value) || 0) / 100; // 백분율 변환
        const months = parseInt(inputMonths.value) || 0;
        const method = selectMethod.value;
        const taxType = selectTax.value;

        // 한글 실시간 단위 가이드 텍스트 출력 트리거
        if (amount > 0) {
            amountKorean.textContent = '👉 ' + convertToKoreanWon(amount);
        } else {
            amountKorean.textContent = '';
        }

        // 필수 값 누락 시 결과 영역 초기화
        if (amount <= 0 || rate <= 0 || months <= 0) {
            clearResults();
            return;
        }

        let principal = 0;
        let interestBefore = 0;

        // 예금 vs 적금 및 단리 vs 복리 연산 공식 분기
        if (type === 'deposit') {
            principal = amount;
            if (method === 'simple') {
                interestBefore = principal * rate * (months / 12);
            } else {
                interestBefore = principal * Math.pow(1 + rate, months / 12) - principal;
            }
        } else {
            principal = amount * months;
            if (method === 'simple') {
                interestBefore = amount * (months * (months + 1) / 2) * (rate / 12);
            } else {
                const monthlyRate = rate / 12;
                let totalWithInterest = 0;
                for (let i = 1; i <= months; i++) {
                    totalWithInterest += amount * Math.pow(1 + monthlyRate, i);
                }
                interestBefore = totalWithInterest - principal;
            }
        }

        // 세율 정의 (일반과세 15.4% / 세금우대 1.4% / 비과세 0%)
        let taxRate = 0.154;
        if (taxType === 'preferential') taxRate = 0.014;
        else if (taxType === 'free') taxRate = 0;

        const tax = interestBefore * taxRate;
        const totalAfter = principal + (interestBefore - tax);

        // 정수 절사 후 세 자릿수 콤마(toLocaleString) 찍어 화면단 렌더링
        resPrincipal.textContent = Math.floor(principal).toLocaleString();
        resInterestBefore.textContent = Math.floor(interestBefore).toLocaleString();
        resTax.textContent = Math.floor(tax).toLocaleString();
        resTotal.textContent = Math.floor(totalAfter).toLocaleString();
    }

    function clearResults() {
        resPrincipal.textContent = '0';
        resInterestBefore.textContent = '0';
        resTax.textContent = '0';
        resTotal.textContent = '0';
    }

    // 4. 입력 변화 감지 실시간 이벤트 리스너 바인딩
    form.addEventListener('input', calculateSavings);
    selectMethod.addEventListener('change', calculateSavings);
    selectTax.addEventListener('change', calculateSavings);
});
