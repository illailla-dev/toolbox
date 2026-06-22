$(document).ready(function () {
    let loadedImage = null;

    // 파일 인풋 등록 및 변동 처리
    $('#image-input').on('change', function (e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (event) {
            loadedImage = new Image();
            loadedImage.onload = function () {
                processImageSplitting();
            };
            loadedImage.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });

    // 옵션 변동 시 실시간 그리드 재가공
    $('#split-row').on('change', function () {
        if (loadedImage) processImageSplitting();
    });

    // [핵심] 이미지 크롭 및 조각화 프로세서
    function processImageSplitting() {
        if (!loadedImage) return;

        const cols = 3; // 인스타그램 가로 레이아웃 고정 상수
        const rows = parseInt($('#split-row').val()) || 3;
        const gridContainer = $('#preview-grid');

        gridContainer.empty(); // 기존 격자 초기화
        $('#result-area').show();

        // 원본 소스 이미지의 규격 계산
        const imgW = loadedImage.width;
        const imgH = loadedImage.height;

        // 조각 하나당 매칭될 가상 정사각형 단면 픽셀 길이 산출
        const pieceW = imgW / cols;
        const pieceH = imgH / rows;

        let index = 1;

        // 이중 루프 돌며 순차대로 영역을 잘라내어 캔버스 덤프 추출
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                // 메모리상에 독립 동적 캔버스 생성
                const canvas = document.createElement('canvas');
                canvas.width = pieceW;
                canvas.height = pieceH;
                const ctx = canvas.getContext('2d');

                // drawImage(소스이미지, 시작X, 시작Y, 자를폭, 자를높이, 대상X, 대상Y, 그릴폭, 그릴높이)
                ctx.drawImage(loadedImage, c * pieceW, r * pieceH, pieceW, pieceH, 0, 0, pieceW, pieceH);

                // 잘라낸 그래픽 데이터를 주소 이미지 포맷(DataURL)으로 최종 파싱
                const dataURL = canvas.toDataURL('image/jpeg', 0.9);

                // 화면 뷰포트에 붙일 마크업 블록 조립
                const gridBox = $(`
                            <div class="grid-box">
                                <img src="${dataURL}" alt="조각 ${index}">
                                <button type="button" class="btn-download-piece" data-index="${index}">💾 ${index}번</button>
                            </div>
                        `);

                // 개별 다운로드 액션 바인딩
                gridBox.find('.btn-download-piece').on('click', function () {
                    const idx = $(this).data('index');
                    const link = document.createElement('a');
                    link.download = `every_calc_insta_feed_${idx}.jpg`;
                    link.href = dataURL;
                    link.click();
                });

                gridContainer.append(gridBox);
                index++;
            }
        }
    }
});