$(document).ready(function () {
    // 계산 방식 라디오 버튼 체인지 이벤트
    $('input[name="calc-type"]').on('change', function () {
        if ($(this).val() === 'sales') {
            $('#field-sales').show();
            $('#field-revenue').hide();
        } else {
            $('#field-sales').hide();
            $('#field-revenue').show();
        }
        calculateCoupang();
    });

    // 수수료율 셀렉트 박스 직접입력 분기 처리
    $('#commission-rate').on('change', function () {
        if ($(this).val() === 'custom') {
            $('#custom-rate').show();
        } else {
            $('#custom-rate').hide();
        }
        calculateCoupang();
    });

    // 입력 폼 내의 모든 값 변동 감지하여 실시간 계산 수행
    $('#coupang-form').on('input change', calculateCoupang);

    function calculateCoupang() {
        const calcType = $('input[name="calc-type"]:checked').val();
        const taxType = parseFloat($('#tax-type').val()) || 0;

        let preTaxRevenue = 0;

        // 1. 세전 수익금 결정 단계
        if (calcType === 'sales') {
            const totalSales = parseFloat($('#total-sales').val()) || 0;
            let rate = $('#commission-rate').val();

            if (rate === 'custom') {
                rate = parseFloat($('#custom-rate').val()) || 0;
            } else {
                rate = parseFloat(rate) || 0;
            }

            preTaxRevenue = totalSales * (rate / 100);
        } else {
            preTaxRevenue = parseFloat($('#pre-tax-revenue').val()) || 0;
        }

        // 2. 세금 및 실수령액 계산 단계
        const taxAmount = preTaxRevenue * (taxType / 100);
        const netSalary = preTaxRevenue - taxAmount;

        // 3. UI 바인딩 및 원화 세자리 콤마 포맷팅
        $('#result-pre-tax').text(Math.floor(preTaxRevenue).toLocaleString());
        $('#result-tax').text(Math.floor(taxAmount).toLocaleString());
        $('#result-net-salary').text(Math.floor(netSalary).toLocaleString());
    }
});