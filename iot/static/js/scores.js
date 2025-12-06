// ==================== SCORES PAGE JAVASCRIPT ====================
document.addEventListener('DOMContentLoaded', function() {
    let chartLabels = JSON.parse('{{ chart_labels|escapejs }}' || '[]');
    let ecoData = JSON.parse('{{ eco_data|escapejs }}' || '[]');
    let obsolescenceData = JSON.parse('{{ obsolescence_data|escapejs }}' || '[]');
    let bigtechData = JSON.parse('{{ bigtech_data|escapejs }}' || '[]');
    let co2SavingsData = JSON.parse('{{ co2_savings_data|escapejs }}' || '[]');

    function updateAverages() {
        document.getElementById('avg-eco').textContent = calculateAverage(ecoData);
        document.getElementById('avg-obsolescence').textContent = calculateAverage(obsolescenceData);
        document.getElementById('avg-bigtech').textContent = calculateAverage(bigtechData);
        document.getElementById('avg-co2-savings').textContent = calculateAverage(co2SavingsData) + ' kg';
    }

    let charts = {};
    function initializeCharts() {
        Object.values(charts).forEach(c => c.destroy());
        charts = {};
        if (chartLabels.length) {
            charts.ecoChart = createChart('ecoChart', 'line', [{
                label: 'Score Écologique',
                data: ecoData,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16,185,129,0.2)',
                fill: true,
                tension: 0.4
            }]);
            charts.obsolescenceChart = createChart('obsolescenceChart', 'bar', [{
                label: "Score d'Obsolescence",
                data: obsolescenceData,
                backgroundColor: '#f59e0b'
            }]);
            charts.bigtechChart = createChart('bigtechChart', 'line', [{
                label: 'Dépendance BigTech',
                data: bigtechData,
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239,68,68,0.2)',
                fill: true,
                tension: 0.4
            }]);
            charts.co2SavingsChart = createChart('co2SavingsChart', 'line', [{
                label: 'Économies CO₂ (kg/an)',
                data: co2SavingsData,
                borderColor: '#22c55e',
                backgroundColor: 'rgba(34,197,94,0.2)',
                fill: true,
                tension: 0.4
            }]);
        }
    }

    updateAverages();
    initializeCharts();
    updateLastUpdateTime();
});
