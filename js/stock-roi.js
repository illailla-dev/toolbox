$(document).ready(function () {
    // 모든 폼 데이터 변동 트래킹 실시간 반영
    $('#roi-form').on('input change', calculateStockRoi);

    function calculateStockRoi() {
        const buyPrice = parseFloat($('#buy-price').val()) || 0;
        const qty = parseFloat($('#stock-qty').val()) || 0;
        const sellPrice = parseFloat($('#sell-price').val()) || 0;
        const feeRate = parseFloat($('#broker-fee').val()) || 0;
        const taxRate = parseFloat($('#exchange-tax').val()) || 0;

        if (buyPrice === 0 || qty === 0 || sellPrice === 0) return;

        // 1. 단순 원금 계산
        const baseBuyTotal = buyPrice * qty;
        const baseSellTotal = sellPrice * qty;

        // 2. 거래 비용 발생액 디테일 연산 (수수료는 %단위이므로 100 분할)
        const buyFee = baseBuyTotal * (feeRate / 100);
        const sellFee = baseSellTotal * (feeRate / 100);
        const sellTax = baseSellTotal * (taxRate / 100);

        const totalCosts = Math.ceil(buyFee + sellFee + sellTax); // 비용은 올림 처리 방어

        // 3. 실질 마진 및 최종 세후 수익률 산출
        const pureProfit = Math.floor((baseSellTotal - baseBuyTotal) - totalCosts);

        // 실질 수익률 = (세후 순수익 / 매수 시 들어간 총비용[원금 + 매수수료]) * 100
        const realInvestment = baseBuyTotal + buyFee;
        const pureRoi = realInvestment > 0 ? ((pureProfit / realInvestment) * 100) : 0;

        // 4. UI 콤마 포맷 바인딩 출력
        $('#res-buy-total').text(Math.floor(baseBuyTotal).toLocaleString());
        $('#res-sell-total').text(Math.floor(baseSellTotal).toLocaleString());
        $('#res-total-costs').text(totalCosts.toLocaleString());
        $('#res-pure-profit').text(pureProfit.toLocaleString());

        // 수익률 분기 컬러 핸들링
        if (pureProfit >= 0) {
            $('#res-pure-profit').css('color', 'var(--green)');
            $('#res-pure-roi').text('+' + pureRoi.toFixed(2)).css('color', 'var(--green)');
        } else {
            $('#res-pure-profit').css('color', 'var(--red)');
            $('#res-pure-roi').text(pureRoi.toFixed(2)).css('color', 'var(--red)');
        }
    }
});