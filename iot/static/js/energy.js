// ==================== ENERGY PAGE JAVASCRIPT ====================
document.addEventListener('DOMContentLoaded', function() {
    let chartLabels = JSON.parse('{{ chart_labels|escapejs }}' || '[]');
    let energyData = JSON.parse('{{ energy_data|escapejs }}' || '[]');
    let co2Data = JSON.parse('{{ co2_data|escapejs }}' || '[]');

    function updateAverages() {
        document.getElementById('avg-energy').textContent = calculateAverage(energyData) + ' W';
        document.getElementById('avg-co2').textContent = calculateAverage(co2Data) + ' g';
    }

    let charts = {};
    function initializeCharts() {
        Object.values(charts).forEach(c => c.destroy());
        charts = {};
        if (chartLabels.length) {
            charts.energyChart = createChart('energyChart', 'bar', [{
                label: 'Énergie (Watts)',
                data: energyData,
                backgroundColor: '#f59e0b'
            }]);
            charts.co2Chart = createChart('co2Chart', 'line', [{
                label: 'CO₂ (g)',
                data: co2Data,
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239,68,68,0.2)',
                fill: true,
                tension: 0.4
            }]);
        }
    }

    updateAverages();
    initializeCharts();
    updateLastUpdateTime();
});
