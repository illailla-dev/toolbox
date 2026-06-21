$(document).ready(function () {
    $('#generate').on('click', function () {
        // 기존 결과 삭제
        $('#result').empty();

        // 입력된 갯수 가져오기
        const count = parseInt($('#count').val(), 10);
        if (isNaN(count) || count <= 0) {
            alert('올바른 갯수를 입력하세요.');
            return;
        }

        // 로또 번호 생성
        for (let i = 0; i < count; i++) {
            // 1부터 45까지 숫자 배열 생성
            const numbers = Array.from({
                length: 45
            }, (_, index) => index + 1);

            // Fisher-Yates Shuffle로 배열 섞기
            for (let j = numbers.length - 1; j > 0; j--) {
                const randomIndex = Math.floor(Math.random() * (j + 1));
                [numbers[j], numbers[randomIndex]] = [numbers[randomIndex], numbers[j]];
            }

            // 6개 선택 후 정렬
            const selected = numbers.slice(0, 6).sort((a, b) => a - b);

            // 번호를 HTML로 변환
            const styledNumbers = selected
                .map((num) => `<i class="${getNumberClass(num)}">${num}</i>`)
                .join('');

            // 결과 출력
            $('#result').append(
                `<p><span>조합 ${i + 1}</span><b>${styledNumbers}</b></p>`
            );
        }
    });

    // 번호에 따라 클래스 지정
    function getNumberClass(num) {
        if (num >= 1 && num <= 10) return 'range-1-10';
        else if (num >= 11 && num <= 20) return 'range-11-20';
        else if (num >= 21 && num <= 30) return 'range-21-30';
        else if (num >= 31 && num <= 40) return 'range-31-40';
        else if (num >= 41 && num <= 45) return 'range-41-45';
        return '';
    }

    $('#generate-exel').on('click', function () {
        const file = document.getElementById('upload-exel').files[0];
        const count = parseInt($('#count-exel').val(), 10); // 입력한 조합 수
        const reader = new FileReader();
        
        // 파일이 첨부되지 않았을 때 경고 메시지 표시
        if (!file) {
            alert("파일을 첨부해주세요.");
            return; // 파일이 없으면 더 이상 진행하지 않음
        }

        reader.onload = function (event) {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, {
                type: 'array'
            });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(sheet);

            // 번호 출현 빈도 분석
            const frequency = Array(45).fill(0);
            rows.forEach(row => {
                for (let i = 1; i <= 6; i++) {
                    const num = row[`번호${i}`];
                    if (num >= 1 && num <= 45) frequency[num - 1]++;
                }
            });

            // 번호 정렬
            const sortedFrequency = frequency
                .map((count, index) => ({
                    number: index + 1,
                    count
                }))
                .sort((a, b) => b.count - a.count);

            // 추천 번호 생성
            const recommendations = generateLottoNumbers(sortedFrequency, count);

            $('#result-exel').empty();
            recommendations.forEach((set, index) => {
                const styledSet = set.map(num => getStyledNumber(num)).join(' ');
                $('#result-exel').append(`<p><span>조합 ${index + 1}</span><b>${styledSet}</b></p>`);
            });
        };

        reader.readAsArrayBuffer(file);
    });

    function generateLottoNumbers(sortedFrequency, count) {
        const recommendations = [];
        const pool = sortedFrequency.map(item => item.number);

        for (let i = 0; i < count; i++) {
            const selected = [];
            while (selected.length < 6) {
                const randomIndex = Math.floor(Math.random() * pool.length);
                const num = pool[randomIndex];
                if (!selected.includes(num)) {
                    selected.push(num);
                }
            }
            selected.sort((a, b) => a - b);
            recommendations.push(selected);
        }
        return recommendations;
    }

    // 번호에 맞는 색상 클래스 반환
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
