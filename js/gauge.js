// js/gauge.js
document.addEventListener('DOMContentLoaded', () => {
    // DOM 요소 캐싱
    const sampleStitchInput = document.getElementById('sample-stitch');
    const sampleRowInput = document.getElementById('sample-row');
    const targetWidthInput = document.getElementById('target-width');
    const targetHeightInput = document.getElementById('target-height');

    const resultStitch = document.getElementById('result-stitch');
    const resultRow = document.getElementById('result-row');
    const gaugeForm = document.getElementById('gauge-form');

    // 계산 실행 함수
    function calculateGauge() {
        // 입력값 가져오기 (숫자형 변환)
        const sampleStitch = parseFloat(sampleStitchInput.value);
        const sampleRow = parseFloat(sampleRowInput.value);
        const targetWidth = parseFloat(targetWidthInput.value);
        const targetHeight = parseFloat(targetHeightInput.value);

        // 유효성 검사: 모든 값이 정상적으로 입력되었는지 확인
        if (!sampleStitch || !sampleRow || !targetWidth || !targetHeight) {
            resultStitch.textContent = '0';
            resultRow.textContent = '0';
            return;
        }

        /**
         * [코바늘 게이지 계산 공식]
         * 10cm 기준이므로 1cm당 코/단수를 먼저 구한 뒤 목표 센티미터를 곱합니다.
         * 콧수 = (나의 콧수 / 10) * 목표 가로 길이
         * 단수 = (나의 단수 / 10) * 목표 세로 길이
         */
        const totalStitches = (sampleStitch / 10) * targetWidth;
        const totalRows = (sampleRow / 10) * targetHeight;

        // 뜨개질 코/단수는 정수로 떨어져야 하므로 반올림(Math.round) 처리
        resultStitch.textContent = Math.round(totalStitches).toLocaleString();
        resultRow.textContent = Math.round(totalRows).toLocaleString();
    }

    // 폼 내부의 input 값이 변경될 때마다 실시간으로 계산 함수 호출
    gaugeForm.addEventListener('input', calculateGauge);
});
