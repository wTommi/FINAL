let priceChart = null;
let cpiChart = null;

function calculateCPI(data) {
    const watermelonTypes = ['西瓜(大粒)', '西瓜(小粒)', '西瓜(無子)'];
    const years = [...new Set(data.map(item => item.date))].sort();
    const groupedData = {};

    watermelonTypes.forEach(type => {
        groupedData[type] = {};
        data.filter(item => item.name === type).forEach(item => {
            if (item.price !== null) groupedData[type][item.date] = item.price;
        });
    });

    const cpiData = [];
    const baseYear = '2004';
    let baseBasketCost = 0;

    if (groupedData['西瓜(大粒)'][baseYear] && groupedData['西瓜(小粒)'][baseYear] && groupedData['西瓜(無子)'][baseYear]) {
        baseBasketCost = (
            groupedData['西瓜(大粒)'][baseYear] * 0.333 +
            groupedData['西瓜(小粒)'][baseYear] * 0.333 +
            groupedData['西瓜(無子)'][baseYear] * 0.333
        );
        cpiData.push({ year: baseYear, cpi: 100.00 });
    }

    // Calculate CPI for other years
    years.filter(year => year !== baseYear).forEach(year => {
        let basketCost = 0;
        if (groupedData['西瓜(無子)'][year]) {
            // All three types available
            basketCost = (
                (groupedData['西瓜(大粒)'][year] || 0) * 0.333 +
                (groupedData['西瓜(小粒)'][year] || 0) * 0.333 +
                (groupedData['西瓜(無子)'][year] || 0) * 0.333
            );
        } else {
            // Only 大粒 and 小粒 available
            basketCost = (
                (groupedData['西瓜(大粒)'][year] || 0) * 0.5 +
                (groupedData['西瓜(小粒)'][year] || 0) * 0.5
            );
        }
        if (basketCost && baseBasketCost) {
            const cpi = (basketCost / baseBasketCost * 100).toFixed(2);
            cpiData.push({ year, cpi: parseFloat(cpi) });
        }
    });

    return cpiData;
}

// 視圖切換功能
function setupViewToggle() {
    const chartViewBtn = document.getElementById('chart-view-btn');
    const tableViewBtn = document.getElementById('table-view-btn');
    const cpiViewBtn = document.getElementById('CPI');
    const inputDataBtn = document.getElementById('input-data-btn');
    const chartContainer = document.getElementById('chart-container');
    const cpiChartContainer = document.getElementById('cpi-chart-container');
    const tableContainer = document.getElementById('table-container');
    const inputFormContainer = document.getElementById('input-form-container');

    chartViewBtn.addEventListener('click', () => {
        chartViewBtn.classList.add('active');
        tableViewBtn.classList.remove('active');
        cpiViewBtn.classList.remove('active');
        inputDataBtn.classList.remove('active');
        chartContainer.style.display = 'block';
        cpiChartContainer.style.display = 'none';
        tableContainer.style.display = 'none';
        inputFormContainer.style.display = 'none';
    });

    tableViewBtn.addEventListener('click', () => {
        tableViewBtn.classList.add('active');
        chartViewBtn.classList.remove('active');
        cpiViewBtn.classList.remove('active');
        inputDataBtn.classList.remove('active');
        tableContainer.style.display = 'block';
        chartContainer.style.display = 'none';
        cpiChartContainer.style.display = 'none';
        inputFormContainer.style.display = 'none';
    });

    cpiViewBtn.addEventListener('click', async () => {
        cpiViewBtn.classList.add('active');
        chartViewBtn.classList.remove('active');
        tableViewBtn.classList.remove('active');
        inputDataBtn.classList.remove('active');
        cpiChartContainer.style.display = 'block';
        chartContainer.style.display = 'none';
        tableContainer.style.display = 'none';
        inputFormContainer.style.display = 'none';

        try {
            const res = await fetch('/api', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await res.json();
            renderCPIChart(data);
        } catch (error) {
            console.error('Failed to fetch data for CPI:', error);
        }
    });

    inputDataBtn.addEventListener('click', () => {
        inputDataBtn.classList.add('active');
        chartViewBtn.classList.remove('active');
        tableViewBtn.classList.remove('active');
        cpiViewBtn.classList.remove('active');
        inputFormContainer.style.display = 'block';
        chartContainer.style.display = 'none';
        cpiChartContainer.style.display = 'none';
        tableContainer.style.display = 'none';
    });
}

// 生成價格圖表的函數
function renderChart(data) {
    const watermelonTypes = ['西瓜(大粒)', '西瓜(小粒)', '西瓜(無子)'];
    const groupedData = {};
    watermelonTypes.forEach(type => {
        groupedData[type] = {};
    });

    data.forEach(item => {
        if (!groupedData[item.name]) return;
        const year = item.date;
        if (year && item.price !== null) {
            groupedData[item.name][year] = item.price;
        }
    });

    const years = [...new Set(data.map(item => item.date))].sort();
    const datasets = [];
    const colors = {
        '西瓜(大粒)': 'rgb(255, 99, 132)',
        '西瓜(小粒)': 'rgb(54, 162, 235)',
        '西瓜(無子)': 'rgb(75, 192, 192)'
    };

    watermelonTypes.forEach(type => {
        const typeData = [];
        years.forEach(year => {
            typeData.push(groupedData[type][year] || null);
        });

        datasets.push({
            label: type,
            data: typeData,
            borderColor: colors[type],
            backgroundColor: colors[type],
            tension: 0.1,
            fill: false
        });
    });

    if (priceChart) {
        priceChart.destroy();
    }

    const ctx = document.getElementById('priceChart').getContext('2d');
    priceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: years,
            datasets: datasets
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '2004-2024年西瓜價格趨勢圖'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                },
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    title: {
                        display: true,
                        text: '價格 (元/公斤)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: '年份'
                    }
                }
            }
        }
    });
}

// 生成 CPI 通膨率圖表的函數
function renderCPIChart(data) {
    const cpiData = calculateCPI(data);
    const inflationRates = [];
    const years = [];

    for (let i = 1; i < cpiData.length; i++) {
        const currentCPI = cpiData[i].cpi;
        const previousCPI = cpiData[i - 1].cpi;
        if (previousCPI && currentCPI) {
            const inflationRate = ((currentCPI - previousCPI) / previousCPI * 100).toFixed(2);
            inflationRates.push(parseFloat(inflationRate));
            years.push(cpiData[i].year);
        }
    }

    if (cpiChart) {
        cpiChart.destroy();
    }

    const ctx = document.getElementById('cpiChart').getContext('2d');
    cpiChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: years,
            datasets: [{
                label: '通膨率 (%)',
                data: inflationRates,
                borderColor: '#FF9F40',
                backgroundColor: '#FF9F40',
                borderWidth: 2,
                pointRadius: 4,
                pointBackgroundColor: '#FF9F40',
                tension: 0.1,
                fill: false
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '2005-2024年西瓜價格通膨率趨勢圖 (以2004年為基準)',
                    font: { size: 18 }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                },
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    title: {
                        display: true,
                        text: '通膨率 (%)'
                    },
                    beginAtZero: false
                },
                x: {
                    title: {
                        display: true,
                        text: '年份'
                    }
                }
            }
        }
    });
}

// 新增資料表單功能
function setupInputForm() {
    const inputYearSelect = document.getElementById('input-year');
    inputYearSelect.innerHTML = '';
    for (let y = 2004; y <= 2024; y++) {
        const opt = document.createElement('option');
        opt.value = y;
        opt.textContent = y;
        inputYearSelect.appendChild(opt);
    }

    const inputForm = document.getElementById('input-form');
    inputForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const year = inputYearSelect.value;
        const price = parseFloat(document.getElementById('input-price').value);
        const type = document.getElementById('input-type').value;
        if (!year || !type || isNaN(price)) return;

        let oldPrice = null;
        try {
            const res = await fetch(`/api/watermelon?year=${year}&type=${type}`);
            const data = await res.json();
            if (data && data.price !== undefined && data.price !== null) {
                oldPrice = parseFloat(data.price);
            }
        } catch (err) { oldPrice = null; }

        let newAvg = price;
        if (oldPrice !== null && !isNaN(oldPrice)) {
            newAvg = ((oldPrice + price) / 2).toFixed(2);
        }

        try {
            await fetch('/api/watermelons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ year, type, price: Number(newAvg) })
            });
            alert('資料已更新！');
        } catch (err) {
            console.error(err);
            return;
        }
        inputForm.reset();
        document.getElementById('table-view-btn').click();
    });
}

window.addEventListener('DOMContentLoaded', async () => {
    setupViewToggle();
    setupInputForm();

    try {
        const res = await fetch('/api', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();
        const tbody = document.getElementById('data-table-body');
        tbody.innerHTML = '';
        data.forEach(element => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${element.date || element.year}</td>
                             <td>${element.price}</td>
                             <td>${element.name}</td>`;
            tbody.appendChild(row);
        });

        renderChart(data);
    } catch (error) {
        console.error('Failed to fetch data:', error);
    }
});

document.getElementById('search-btn').addEventListener('click', async () => {
    const startYear = document.getElementById('start-year').value;
    const endYear = document.getElementById('end-year').value;
    const price = document.getElementById('price').value;
    const type = document.getElementById('type-selector').value;

    const params = new URLSearchParams();
    if (startYear) params.append('startYear', startYear);
    if (endYear) params.append('endYear', endYear);
    if (price) params.append('price', price);
    if (type) params.append('type', type);

    try {
        const res = await fetch(`/api/search?${params.toString()}`);
        const data = await res.json();
        const tbody = document.getElementById('data-table-body');
        tbody.innerHTML = '';
        data.forEach(element => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${element.date || element.year}</td>
                             <td>${element.price}</td>
                             <td>${element.name}</td>`;
            tbody.appendChild(row);
        });

        renderChart(data);
    } catch (error) {
        console.error('Failed to fetch search data:', error);
    }
});