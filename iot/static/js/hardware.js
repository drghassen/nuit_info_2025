// ==================== HARDWARE PAGE JAVASCRIPT ====================
document.addEventListener('DOMContentLoaded', function() {
    let chartLabels = JSON.parse('{{ chart_labels|escapejs }}' || '[]');
    let cpuData = JSON.parse('{{ cpu_data|escapejs }}' || '[]');
    let ramData = JSON.parse('{{ ram_data|escapejs }}' || '[]');
    let batteryData = JSON.parse('{{ battery_data|escapejs }}' || '[]');
    let ageData = JSON.parse('{{ age_data|escapejs }}' || '[]');

    function calculateAverage(d) {
        if (!d || !d.length) return 0;
        return (d.reduce((a, b) => a + b, 0) / d.length).toFixed(1);
    }

    function updateAverages() {
        document.getElementById('avg-cpu').textContent = calculateAverage(cpuData) + '%';
        document.getElementById('avg-ram').textContent = calculateAverage(ramData) + '%';
        document.getElementById('avg-battery').textContent = calculateAverage(batteryData) + '%';
        document.getElementById('avg-age').textContent = calculateAverage(ageData) + ' ans';
    }

    const commonOptions = {
        responsive: true,
        plugins: {
            legend: {
                labels: {
                    color: '#e2e8f0'
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: '#94a3b8'
                }
            },
            y: {
                ticks: {
                    color: '#94a3b8'
                },
                grid: {
                    color: 'rgba(255,255,255,0.1)'
                }
            }
        }
    };

    function createChart(id, type, datasets, options = commonOptions) {
        const ctx = document.getElementById(id).getContext('2d');
        return new Chart(ctx, {
            type,
            data: {
                labels: chartLabels,
                datasets
            },
            options
        });
    }

    let charts = {};
    function initializeCharts() {
        Object.values(charts).forEach(c => c.destroy());
        charts = {};
        if (chartLabels.length) {
            charts.cpuRamChart = createChart('cpuRamChart', 'line', [
                { label: 'CPU (%)', data: cpuData, borderColor: '#4361ee', backgroundColor: 'rgba(67,97,238,0.2)', fill: true, tension: 0.4 },
                { label: 'RAM (%)', data: ramData, borderColor: '#38bdf8', backgroundColor: 'rgba(56,189,248,0.2)', fill: true, tension: 0.4 }
            ]);
            charts.batteryChart = createChart('batteryChart', 'bar', [{ label: 'Santé Batterie (%)', data: batteryData, backgroundColor: '#10b981' }]);
            charts.ageChart = createChart('ageChart', 'line', [{ label: 'Âge (années)', data: ageData, borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.2)', fill: true, tension: 0.4 }]);
        }
    }

    function updateLastUpdateTime() {
        document.getElementById('last-update').textContent = new Date().toLocaleTimeString('fr-FR');
    }

    updateAverages();
    initializeCharts();
    updateLastUpdateTime();
});
