// js/lotto.js
$(document).ready(function () {

    // ==========================================
    // 1. 일반 번호 생성기 (기본 Fisher-Yates 방식)
    // ==========================================
    $('#generate').on('click', function () {
        $('#result').empty();

        const count = parseInt($('#count').val(), 10);
        if (isNaN(count) || count <= 0) {
            alert('올바른 갯수를 입력하세요.');
            return;
        }

        for (let i = 0; i < count; i++) {
            const numbers = Array.from({ length: 45 }, (_, index) => index + 1);

            for (let j = numbers.length - 1; j > 0; j--) {
                const randomIndex = Math.floor(Math.random() * (j + 1));
                [numbers[j], numbers[randomIndex]] = [numbers[randomIndex], numbers[j]];
            }

            const selected = numbers.slice(0, 6).sort((a, b) => a - b);
            const styledNumbers = selected
                .map((num) => getStyledNumber(num))
                .join('');

            $('#result').append(
                `<p><span>조합 ${i + 1}</span><b>${styledNumbers}</b></p>`
            );
        }
    });

    // ==========================================
    // 2. 엑셀 데이터 분석 기반 추천 생성기 (고급 엔진)
    // ==========================================
    $('#generate-exel').on('click', function () {
        // [수정] 파일 인풋 객체에서 배열 첫 요소를 확실히 타겟팅
        const file = document.getElementById('upload-exel').files[0];
        const count = parseInt($('#count-exel').val(), 10);

        if (!file) {
            alert("엑셀 파일을 첨부해 주세요.");
            return;
        }
        if (isNaN(count) || count <= 0) {
            alert('생성할 조합 개수를 입력해 주세요.');
            return;
        }

        const reader = new FileReader();
        reader.onload = function (event) {
            try {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: 'array' });

                // 📌 [교정 완료] workbook.SheetNames 뒤에 빠졌던 [0] 배열 인덱스를 다시 채워 넣었습니다.
                const firstSheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[firstSheetName];
                const rows = XLSX.utils.sheet_to_json(sheet);

                if (rows.length === 0) {
                    alert("엑셀 파일 내에 데이터가 존재하지 않습니다.");
                    return;
                }

                const frequency = Array(45).fill(0);
                rows.forEach(row => {
                    for (let i = 1; i <= 6; i++) {
                        const num = parseInt(row[`번호${i}`] || row[`번호 ${i}`], 10);
                        if (num >= 1 && num <= 45) {
                            frequency[num - 1]++;
                        }
                    }
                });

                const frequencyData = frequency.map((count, index) => ({
                    number: index + 1,
                    weight: count
                }));

                const recommendations = generateWeightedLottoNumbers(frequencyData, count);

                $('#result-exel').empty();
                recommendations.forEach((set, index) => {
                    const styledSet = set.map(num => getStyledNumber(num)).join('');
                    $('#result-exel').append(`<p><span>조합 ${index + 1}</span><b>${styledSet}</b></p>`);
                });
            } catch (err) {
                console.error("엑셀 파싱 세부 에러 내용:", err);
                alert("엑셀 파일을 파싱하는 도중 에러가 발생했습니다. 올바른 포맷인지 확인해 주세요.");
            }
        };

        reader.readAsArrayBuffer(file);
    });

    /**
     * 누적 빈도 점수를 기반으로 높은 빈도의 번호가
     * 더 자주 뽑히도록 설계한 정밀 확률 가중치 추첨 알고리즘
     */
    function generateWeightedLottoNumbers(frequencyData, count) {
        const recommendations = [];

        frequencyData.forEach(item => {
            if (item.weight === 0) item.weight = 1;
        });

        for (let i = 0; i < count; i++) {
            const selected = [];

            while (selected.length < 6) {
                const availableNumbers = frequencyData.filter(item => !selected.includes(item.number));
                const totalWeight = availableNumbers.reduce((sum, item) => sum + item.weight, 0);

                let randomWeight = Math.random() * totalWeight;
                let chosenNumber = availableNumbers[availableNumbers.length - 1].number;

                // 📌 [교정 완료] 내부 루프 인덱스 가중치 차감 연산의 수식 제어문 오타(r++)를 k++로 수정했습니다.
                for (let k = 0; k < availableNumbers.length; k++) {
                    randomWeight -= availableNumbers[k].weight;
                    if (randomWeight <= 0) {
                        chosenNumber = availableNumbers[k].number;
                        break;
                    }
                }

                if (!selected.includes(chosenNumber)) {
                    selected.push(chosenNumber);
                }
            }

            selected.sort((a, b) => a - b);
            recommendations.push(selected);
        }
        return recommendations;
    }

    function getStyledNumber(num) {
        let className = '';
        if (num >= 1 && num <= 10) className = 'range-1-10';
        else if (num >= 11 && num <= 20) className = 'range-11-20';
        else if (num >= 21 && num <= 30) className = 'range-21-30';
        else if (num >= 31 && num <= 40) className = 'range-31-40';
        else if (num >= 41 && num <= 45) className = 'range-41-45';
        return `<i class="${className}">${num}</i>`;
    }
});
