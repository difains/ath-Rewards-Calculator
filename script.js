document.addEventListener('DOMContentLoaded', function() {
    // 오늘 날짜를 기본값으로 설정
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;

    const form = document.getElementById('coinCalculator');
    const resultsSection = document.getElementById('results');
    const gridBody = document.getElementById('gridBody');
    const addBtn = document.getElementById('addBtn');
    const calculateAllBtn = document.getElementById('calculateAllBtn');
    const exportBtn = document.getElementById('exportBtn');

    let allCalculationData = [];

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        calculateAllData();
    });

    addBtn.addEventListener('click', function() {
        addDataToGrid();
    });

    calculateAllBtn.addEventListener('click', function() {
        calculateGridData();
    });

    exportBtn.addEventListener('click', function() {
        exportToExcel();
    });

    function addDataToGrid() {
        // 폼 유효성 검사
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const formData = new FormData(form);
        const data = {
            date: formData.get('date'),
            coinPrice: parseFloat(formData.get('coinPrice')),
            productName: formData.get('productName'),
            coinReward: parseFloat(formData.get('coinReward')),
            productPrice: parseFloat(formData.get('productPrice')),
            premiumMultiplier: parseFloat(formData.get('premiumMultiplier')),
            timestamp: new Date().toLocaleString('ko-KR'),
            id: Date.now() // 고유 ID 생성
        };

        // 데이터를 배열 맨 앞에 추가 (최신순)
        allCalculationData.unshift(data);
        
        displayGrid();
        updateButtonStates();
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth' });
        
        // 폼 초기화
        form.reset();
        document.getElementById('date').value = today;
    }

    function calculateAllData() {
        // 추가된 데이터가 있는지 먼저 확인
        if (allCalculationData.length === 0) {
            // 추가된 데이터가 없으면 현재 폼의 데이터를 먼저 추가 시도
            if (form.checkValidity()) {
                addDataToGrid();
            } else {
                alert('데이터를 먼저 추가해주세요.');
                return;
            }
        }

        // 폼에 새로운 데이터가 입력되어 있는지 확인
        const formData = new FormData(form);
        const hasNewData = formData.get('productName') && 
                          formData.get('coinReward') && 
                          formData.get('productPrice') && 
                          formData.get('coinPrice');

        // 새로운 데이터가 있고 폼이 유효하면 추가
        if (hasNewData && form.checkValidity()) {
            const newData = {
                date: formData.get('date'),
                coinPrice: parseFloat(formData.get('coinPrice')),
                productName: formData.get('productName'),
                coinReward: parseFloat(formData.get('coinReward')),
                productPrice: parseFloat(formData.get('productPrice')),
                premiumMultiplier: parseFloat(formData.get('premiumMultiplier')),
                timestamp: new Date().toLocaleString('ko-KR'),
                id: Date.now()
            };
            
            allCalculationData.unshift(newData);
            
            // 폼 초기화
            form.reset();
            document.getElementById('date').value = today;
        }

        // 모든 데이터에 대해 계산 수행
        allCalculationData = allCalculationData.map(data => calculateSingleData(data));
        
        displayGrid();
        updateButtonStates();
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    // 새로운 함수: 그리드 데이터만 계산
    function calculateGridData() {
        if (allCalculationData.length === 0) {
            alert('계산할 데이터가 없습니다.');
            return;
        }

        // 모든 그리드 데이터에 대해 계산 수행
        allCalculationData = allCalculationData.map(data => calculateSingleData(data));
        
        displayGrid();
        updateButtonStates();
        
        // 계산 완료 알림
        const calculatedCount = allCalculationData.length;
        alert(`${calculatedCount}개의 데이터가 계산되었습니다.`);
    }

    function calculateSingleData(data) {
        // 계산 수행
        const totalCoins = data.coinReward * data.premiumMultiplier;
        const currentValue = totalCoins * data.coinPrice;
        const profitMargin = ((currentValue / data.productPrice) * 100).toFixed(2);
        
        // 출금 일수 계산 (하루 3,000~4,000개)
        const withdrawalDays3000 = Math.ceil(totalCoins / 3000);
        const withdrawalDays4000 = Math.ceil(totalCoins / 4000);
        
        // 10% 상승/하락 시 수익
        const priceUp10 = data.coinPrice * 1.1;
        const priceDown10 = data.coinPrice * 0.9;
        const valueUp10 = totalCoins * priceUp10;
        const valueDown10 = totalCoins * priceDown10;
        const profitUp10 = ((valueUp10 / data.productPrice) * 100).toFixed(2);
        const profitDown10 = ((valueDown10 / data.productPrice) * 100).toFixed(2);

        return {
            ...data,
            totalCoins,
            currentValue,
            profitMargin,
            withdrawalDays3000,
            withdrawalDays4000,
            priceUp10,
            priceDown10,
            valueUp10,
            valueDown10,
            profitUp10,
            profitDown10
        };
    }

    function updateButtonStates() {
        const hasData = allCalculationData.length > 0;
        const hasCalculatedData = allCalculationData.some(data => data.hasOwnProperty('totalCoins'));
        
        // 한 번에 계산하기 버튼 상태
        calculateAllBtn.disabled = !hasData;
        
        // 엑셀 다운로드 버튼 상태
        exportBtn.disabled = !hasCalculatedData;
    }

    function displayGrid() {
        if (allCalculationData.length === 0) {
            gridBody.innerHTML = '<div class="empty-state">추가된 데이터가 없습니다.</div>';
            updateButtonStates();
            return;
        }

        gridBody.innerHTML = allCalculationData.map(data => {
            const isCalculated = data.hasOwnProperty('totalCoins');
            
            if (!isCalculated) {
                return `
                    <div class="grid-row" data-id="${data.id}">
                        <div class="grid-cell">${data.date}</div>
                        <div class="grid-cell">${data.productName}</div>
                        <div class="grid-cell">${data.coinReward.toFixed(5)}</div>
                        <div class="grid-cell">${data.productPrice.toLocaleString()}</div>
                        <div class="grid-cell">${data.coinPrice}</div>
                        <div class="grid-cell">${data.premiumMultiplier}</div>
                        <div class="grid-cell">-</div>
                        <div class="grid-cell">-</div>
                        <div class="grid-cell">-</div>
                        <div class="grid-cell">-</div>
                        <div class="grid-cell">-</div>
                        <div class="grid-cell">-</div>
                        <div class="grid-cell">-</div>
                        <div class="grid-cell">-</div>
                        <div class="grid-cell">-</div>
                        <div class="grid-cell">-</div>
                        <div class="grid-cell">
                            <button class="delete-btn" onclick="deleteRow(${data.id})">삭제</button>
                        </div>
                    </div>
                `;
            }

            return `
                <div class="grid-row" data-id="${data.id}">
                    <div class="grid-cell">${data.date}</div>
                    <div class="grid-cell">${data.productName}</div>
                    <div class="grid-cell">${data.coinReward.toFixed(5)}</div>
                    <div class="grid-cell">${data.productPrice.toLocaleString()}</div>
                    <div class="grid-cell">${data.coinPrice}</div>
                    <div class="grid-cell">${data.premiumMultiplier}</div>
                    <div class="grid-cell">${data.totalCoins.toFixed(5)}</div>
                    <div class="grid-cell">${data.currentValue.toLocaleString()}</div>
                    <div class="grid-cell ${data.profitMargin >= 0 ? 'profit-positive' : 'profit-negative'}">${data.profitMargin}%</div>
                    <div class="grid-cell ${(data.currentValue - data.productPrice) >= 0 ? 'profit-positive' : 'profit-negative'}">${(data.currentValue - data.productPrice).toLocaleString()}</div>
                    <div class="grid-cell">${data.withdrawalDays3000}</div>
                    <div class="grid-cell">${data.withdrawalDays4000}</div>
                    <div class="grid-cell">${data.valueUp10.toLocaleString()}</div>
                    <div class="grid-cell profit-positive">${data.profitUp10}%</div>
                    <div class="grid-cell">${data.valueDown10.toLocaleString()}</div>
                    <div class="grid-cell ${data.profitDown10 >= 0 ? 'profit-positive' : 'profit-negative'}">${data.profitDown10}%</div>
                    <div class="grid-cell">
                        <button class="delete-btn" onclick="deleteRow(${data.id})">삭제</button>
                    </div>
                </div>
            `;
        }).join('');
        
        updateButtonStates();
    }

    // 전역 함수로 삭제 기능 구현
    window.deleteRow = function(id) {
        allCalculationData = allCalculationData.filter(data => data.id !== id);
        displayGrid();
        
        if (allCalculationData.length === 0) {
            resultsSection.style.display = 'none';
        }
    };

    function exportToExcel() {
        if (allCalculationData.length === 0) {
            alert('먼저 데이터를 추가해주세요.');
            return;
        }

        // 계산된 데이터만 필터링
        const calculatedData = allCalculationData.filter(data => data.hasOwnProperty('totalCoins'));
        
        if (calculatedData.length === 0) {
            alert('계산된 데이터가 없습니다. 먼저 계산하기를 클릭해주세요.');
            return;
        }

        // 헤더 행
        const headers = [
            '계산시간', '날짜', '상품명', '코인리워드', '상품가격', '코인시세', '프리미엄배수',
            '총받는코인', '현재코인가치', '수익률(%)', '수익손실', '출금일수(3K)', '출금일수(4K)',
            '상승시세(+10%)', '상승시가치', '상승시수익률(%)', '상승시수익',
            '하락시세(-10%)', '하락시가치', '하락시수익률(%)', '하락시수익손실'
        ];

        // 데이터 행들
        const rows = calculatedData.map(data => [
            data.timestamp,
            data.date,
            data.productName,
            data.coinReward.toFixed(5),
            data.productPrice,
            data.coinPrice,
            data.premiumMultiplier,
            data.totalCoins.toFixed(5),
            Math.round(data.currentValue),
            data.profitMargin,
            Math.round(data.currentValue - data.productPrice),
            data.withdrawalDays3000,
            data.withdrawalDays4000,
            data.priceUp10.toFixed(2),
            Math.round(data.valueUp10),
            data.profitUp10,
            Math.round(data.valueUp10 - data.productPrice),
            data.priceDown10.toFixed(2),
            Math.round(data.valueDown10),
            data.profitDown10,
            Math.round(data.valueDown10 - data.productPrice)
        ]);

        // 엑셀 데이터 구성
        const excelData = [headers, ...rows];

        // 워크북 생성
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(excelData);
        
        // 컬럼 너비 설정
        const colWidths = [
            {wch: 20}, {wch: 12}, {wch: 20}, {wch: 15}, {wch: 12}, {wch: 10}, {wch: 12},
            {wch: 15}, {wch: 15}, {wch: 12}, {wch: 12}, {wch: 12}, {wch: 12},
            {wch: 15}, {wch: 15}, {wch: 15}, {wch: 12},
            {wch: 15}, {wch: 15}, {wch: 15}, {wch: 15}
        ];
        ws['!cols'] = colWidths;
        
        // 시트 추가
        XLSX.utils.book_append_sheet(wb, ws, "아하코인 계산결과");
        
        // 파일 다운로드
        const fileName = `아하코인_계산결과_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
    }

    // 초기 버튼 상태 설정
    updateButtonStates();
});
