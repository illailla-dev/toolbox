$(document).ready(function () {
    // 모든 폼 입력단 이벤트 바인딩
    $('#diet-form').on('input change', calculateMacros);

    function calculateMacros() {
        const gender = $('input[name="gender"]:checked').val();
        const age = parseFloat($('#age').val()) || 0;
        const height = parseFloat($('#height').val()) || 0;
        const weight = parseFloat($('#weight').val()) || 0;
        const activity = parseFloat($('#activity-level').val()) || 1.2;
        const goalKcal = parseFloat($('#diet-goal').val()) || 0;
        const ratioStr = $('#macro-ratio').val();

        // 신체 정보가 온전히 채워지지 않은 경우 연산 중단
        if (age === 0 || height === 0 || weight === 0) return;

        // 1. 기초대사량(BMR) 계산: 미플린-조어(Mifflin-St Jeor) 공식 적용
        let bmr = (10 * weight) + (6.25 * height) - (5 * age);
        if (gender === 'male') {
            bmr += 5;
        } else {
            bmr -= 161;
        }

        // 2. 일일 총 에너지 소비량(TDEE) = BMR * 활동 계수
        const tdee = bmr * activity;

        // 3. 목적에 따른 최종 하루 타겟 칼로리
        let targetKcal = tdee + goalKcal;
        if (targetKcal < 1200) targetKcal = 1200; // 극단적인 초절식 방지 방어 코드

        // 4. 탄단지 그람수(g) 쪼개기 엔진 가동
        // 칼로리 환산 상식: 탄수화물=4kcal, 단백질=4kcal, 지방=9kcal
        const ratioArr = ratioStr.split(':').map(Number); // 예: [5, 3, 2]
        const totalRatio = ratioArr[0] + ratioArr[1] + ratioArr[2];

        const carbsKcal = targetKcal * (ratioArr[0] / totalRatio);
        const proteinKcal = targetKcal * (ratioArr[1] / totalRatio);
        const fatKcal = targetKcal * (ratioArr[2] / totalRatio);

        const carbsG = carbsKcal / 4;
        const proteinG = proteinKcal / 4;
        const fatG = fatKcal / 9;

        // 5. UI 가시화 세팅 및 포맷팅 바인딩
        $('#res-bmr').text(Math.round(bmr).toLocaleString());
        $('#res-tdee').text(Math.round(tdee).toLocaleString());
        $('#res-target-kcal').text(Math.round(targetKcal).toLocaleString());

        $('#res-carbs').text(Math.round(carbsG));
        $('#res-protein').text(Math.round(proteinG));
        $('#res-fat').text(Math.round(fatG));
    }
});