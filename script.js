document.addEventListener('DOMContentLoaded', function() {
    // 오늘 날짜를 기본값으로 설정
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;

    const form = document.getElementById('coinCalculator');
    const resultsSection = document.getElementById('results');
    const resultContent = document.getElementById('resultContent');
    const exportBtn = document.getElementById('exportBtn');

    let allCalculationData = [];

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        calculateRewards();
    });

    exportBtn.addEventListener('click', function() {
        exportToExcel();
    });

    function calculateRewards() {
        const formData = new FormData(form);
        const data = {
            date: formData.get('date'),
            coinPrice: parseFloat(formData.get('coinPrice')),
            productName: formData.get('productName'),
            coinReward: parseFloat(formData.get('coinReward')),
            productPrice: parseFloat(formData.get('productPrice')),
            premiumMultiplier: parseFloat(formData.get('premiumMultiplier'))
        };

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

        const calculationData = {
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
            profitDown10,
            timestamp: new Date().toLocaleString('ko-KR')
        };

        // 데이터 누적 저장
        allCalculationData.push(calculationData);

        displayResults(calculationData);
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    function displayResults(data) {
        resultContent.innerHTML = `
            <div class="result-row">
                <div class="result-card">
                    <h3>📅 계산 날짜</h3>
                    <div class="value">${data.date}</div>
                </div>
                <div class="result-card">
                    <h3>🛍️ 상품명</h3>
                    <div class="value">${data.productName}</div>
                </div>
                <div class="result-card">
                    <h3>🪙 코인 리워드</h3>
                    <div class="value">${data.coinReward.toFixed(5)}개</div>
                </div>
                <div class="result-card">
                    <h3>💰 상품 가격</h3>
                    <div class="value">${data.productPrice.toLocaleString()}원</div>
                </div>
                <div class="result-card">
                    <h3>📈 코인 시세</h3>
                    <div class="value">${data.coinPrice}원</div>
                </div>
                <div class="result-card">
                    <h3>⚡ 프리미엄 배수</h3>
                    <div class="value">${data.premiumMultiplier}배</div>
                </div>
            </div>

            <div class="result-row">
                <div class="result-card">
                    <h3>🎯 총 받는 코인</h3>
                    <div class="value">${data.totalCoins.toFixed(5)}개</div>
                </div>
                <div class="result-card">
                    <h3>💎 현재 코인 가치</h3>
                    <div class="value">${data.currentValue.toLocaleString()}원</div>
                </div>
                <div class="result-card ${data.profitMargin >= 0 ? 'profit-positive' : 'profit-negative'}">
                    <h3>📊 수익률</h3>
                    <div class="value">${data.profitMargin}%</div>
                </div>
                <div class="result-card ${(data.currentValue - data.productPrice) >= 0 ? 'profit-positive' : 'profit-negative'}">
                    <h3>💵 수익/손실</h3>
                    <div class="value">${(data.currentValue - data.productPrice).toLocaleString()}원</div>
                </div>
                <div class="result-card">
                    <h3>⏰ 출금일수(3K)</h3>
                    <div class="value">${data.withdrawalDays3000}일</div>
                </div>
                <div class="result-card">
                    <h3>⏰ 출금일수(4K)</h3>
                    <div class="value">${data.withdrawalDays4000}일</div>
                </div>
            </div>

            <div class="scenario-section">
                <h3>📈 시나리오별 수익성 분석</h3>
                <div class="scenario-row">
                    <div class="scenario-card">
                        <h4>🔥 10% 상승 시</h4>
                        <div class="scenario-detail">
                            <span class="scenario-label">코인 시세:</span>
                            <span class="scenario-value">${data.priceUp10.toFixed(2)}원</span>
                        </div>
                        <div class="scenario-detail">
                            <span class="scenario-label">총 가치:</span>
                            <span class="scenario-value">${data.valueUp10.toLocaleString()}원</span>
                        </div>
                        <div class="scenario-detail">
                            <span class="scenario-label">수익률:</span>
                            <span class="scenario-value profit-positive">${data.profitUp10}%</span>
                        </div>
                        <div class="scenario-detail">
                            <span class="scenario-label">수익:</span>
                            <span class="scenario-value profit-positive">${(data.valueUp10 - data.productPrice).toLocaleString()}원</span>
                        </div>
                    </div>

                    <div class="scenario-card">
                        <h4>📉 10% 하락 시</h4>
                        <div class="scenario-detail">
                            <span class="scenario-label">코인 시세:</span>
                            <span class="scenario-value">${data.priceDown10.toFixed(2)}원</span>
                        </div>
                        <div class="scenario-detail">
                            <span class="scenario-label">총 가치:</span>
                            <span class="scenario-value">${data.valueDown10.toLocaleString()}원</span>
                        </div>
                        <div class="scenario-detail">
                            <span class="scenario-label">수익률:</span>
                            <span class="scenario-value ${data.profitDown10 >= 0 ? 'profit-positive' : 'profit-negative'}">${data.profitDown10}%</span>
                        </div>
                        <div class="scenario-detail">
                            <span class="scenario-label">수익/손실:</span>
                            <span class="scenario-value ${(data.valueDown10 - data.productPrice) >= 0 ? 'profit-positive' : 'profit-negative'}">${(data.valueDown10 - data.productPrice).toLocaleString()}원</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function exportToExcel() {
        if (allCalculationData.length === 0) {
            alert('먼저 계산을 수행해주세요.');
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
        const rows = allCalculationData.map(data => [
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
});
