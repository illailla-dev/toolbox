
$(document).ready(function () {
    // 모든 인풋 데이터 실시간 트래킹 변동 감지
    $('#wage-form').on('input change', calculateWage);

    function calculateWage() {
        const hourlyWage = parseFloat($('#hourly-wage').val()) || 0;
        const dailyHours = parseFloat($('#daily-hours').val()) || 0;
        const weeklyDays = parseFloat($('#weekly-days').val()) || 0;
        const taxRate = parseFloat($('#tax-select').val()) || 0;
        const period = $('input[name="period-type"]:checked').val();

        // 총 주당 근로시간 계산
        const totalWeeklyHours = dailyHours * weeklyDays;

        // 1. 기본 주당 근로 수당
        let baseWeeklyWage = hourlyWage * totalWeeklyHours;

        // 2. 주휴수당 조건문 판별 (주 15시간 이상일 때만 양산)
        let holidayWeeklyPay = 0;
        if (totalWeeklyHours >= 15) {
            // 근로기준법상 상한선 주 40시간 제한 캡(Cap) 적용 안전망 구축
            const checkedHours = totalWeeklyHours > 40 ? 40 : totalWeeklyHours;
            holidayWeeklyPay = Math.round((checkedHours / 40) * 8 * hourlyWage);
            $('#holiday-status-text').text('✅ 주 15시간 이상 근무로 주휴수당 지급 대상입니다.').css('color', 'var(--green)');
        } else {
            holidayWeeklyPay = 0;
            if (totalWeeklyHours > 0) {
                $('#holiday-status-text').text('❌ 주 15시간 미만 근무로 주휴수당이 발생하지 않습니다.').css('color', 'var(--red)');
            } else {
                $('#holiday-status-text').text('');
            }
        }

        // 3. 기간별(주급/월급) 스케일링 가중치 반영 (한 달 평균 4.345주 적용 기준법 기준)
        const multiplier = (period === 'month') ? 4.345 : 1.0;

        const finalBaseWage = Math.floor(baseWeeklyWage * multiplier);
        const finalHolidayPay = Math.floor(holidayWeeklyPay * multiplier);
        const totalPreTax = finalBaseWage + finalHolidayPay;

        // 4. 세금 원천징수 차감 계산
        const totalTax = Math.floor(totalPreTax * (taxRate / 100));
        const netPay = totalPreTax - totalTax;

        // 5. UI 가시화 세자리 콤마 바인딩 출력
        $('#res-base-wage').text(finalBaseWage.toLocaleString());
        $('#res-holiday-pay').text(finalHolidayPay.toLocaleString());
        $('#res-total-pretax').text(totalPreTax.toLocaleString());
        $('#res-total-tax').text(totalTax.toLocaleString());
        $('#res-net-pay').text(netPay.toLocaleString());
    }
});