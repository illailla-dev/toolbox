
$(document).ready(function () {
    $('#customs-form').on('input change', calculateCustoms);

    function calculateCustoms() {
        const country = $('#country-type').val();
        const exchangeRate = parseFloat($('#exchange-rate').val()) || 0;
        const dutyRate = parseFloat($('#item-type').val()) || 0;
        const productPrice = parseFloat($('#product-price').val()) || 0;
        const shippingFee = parseFloat($('#shipping-fee').val()) || 0;

        // 1. 총 달러 및 원화 환산액 계산 (과세가격 산정)
        const totalUSD = productPrice + shippingFee;
        const totalKRW = Math.round(totalUSD * exchangeRate);

        // 2. 국가별 면세 한도 체크 (미국 $200, 기타 $150)
        const limit = (country === 'USA') ? 200 : 150;
        let isTaxable = false;

        if (productPrice > limit) {
            isTaxable = true;
            $('#res-tax-status').text('⚠️ 면세 한도 초과 (과세 대상)').css('color', '#d9534f');
        } else {
            $('#res-tax-status').text('✅ 면세 한도 이내 (세금 안 냄)').css('color', '#28a745');
        }

        // 3. 세금 연산 (면세 한도 이내면 전부 0원 처리)
        let customsDuty = 0;
        let vat = 0;

        if (isTaxable) {
            // 관세 = 과세가격(원화) * 관세율
            customsDuty = Math.round(totalKRW * (dutyRate / 100));
            // 부가세 = (과세가격 + 관세) * 10%
            vat = Math.round((totalKRW + customsDuty) * 0.1);
        }

        const totalTax = customsDuty + vat;

        // 4. UI 결과 바인딩 및 콤마 포맷팅
        $('#res-total-usd').text(totalUSD.toFixed(2));
        $('#res-total-krw').text(totalKRW.toLocaleString());
        $('#res-customs-duty').text(customsDuty.toLocaleString());
        $('#res-value-added-tax').text(vat.toLocaleString());
        $('#res-total-tax').text(totalTax.toLocaleString());
    }
});