$(document).ready(function () {
    // 입력 폼 변동 실시간 감지
    $('#stock-form').on('input', calculateStock);

    // [+ 매수 조건 추가] 버튼 동적 행 생성 로직
    $('#btn-add-row').on('click', function () {
        const newRow = $('<div class="input-item stock-row mb-2"></div>');
        newRow.html(`
                    <hr class="dash">
                    <label class="pt-0">추가 매수가 (원)</label>
                    <input type="number" class="add-price form-control" placeholder="예: 40000" required min="1" step="1">
                    <label>추가 수량 (주)</label>
                    <input type="number" class="add-quantity form-control" placeholder="예: 30" required min="1" step="1">
                    <button type="button" class="btn-del-row btn lightgray mt-2 btn-block">X</button>
                `);
        $('#add-stock-list').append(newRow);

        // 삭제 버튼 이벤트 바인딩
        newRow.find('.btn-del-row').on('click', function () {
            newRow.remove();
            calculateStock();
        });
    });

    // 실시간 평단가 연산 함수
    function calculateStock() {
        const curPrice = parseFloat($('#current-price').val()) || 0;
        const curQty = parseFloat($('#current-quantity').val()) || 0;

        let totalMoney = curPrice * curQty;
        let totalQuantity = curQty;

        // 추가된 물타기 리스트 배열 순회 처리
        $('.stock-row').each(function () {
            const addPrice = parseFloat($(this).find('.add-price').val()) || 0;
            const addQty = parseFloat($(this).find('.add-quantity').val()) || 0;

            totalMoney += (addPrice * addQty);
            totalQuantity += addQty;
        });

        // 평단가 연산 (0 나누기 무한대 에러 방지)
        const finalAverage = totalQuantity > 0 ? Math.round(totalMoney / totalQuantity) : 0;

        // 세자리 콤마 포맷 바인딩 출력
        $('#result-average').text(finalAverage.toLocaleString());
        $('#result-total-quantity').text(totalQuantity.toLocaleString());
        $('#result-total-money').text(totalMoney.toLocaleString());
    }
});