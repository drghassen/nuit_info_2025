/**
 * ============================================================================
 * ECOTRACK IOT - DASHBOARD CORE
 * ============================================================================
 * Core dashboard functionality: charts, metrics, real-time updates
 * Handles Chart.js visualization and notification thresholds
 */

// ============================================================================
// GLOBAL STATE & CONFIGURATION
// ============================================================================

let chartLabels = [];
let cpuData = [];
let ramData = [];
let powerData = [];
let ecoData = [];
let co2Data = [];
let latestData = [];
const charts = {};

// Notification thresholds configuration (Based on Averages)
const thresholds = {
    cpu: {
        limit: 80,
        cmp: '>',
        title: 'Charge Moyenne Élevée',
        message: v => `CPU Moyen: ${v}% (Seuil: 80%). Attention à la surcharge.`,
        type: 'warning'
    },
    ram: {
        limit: 85,
        cmp: '>',
        title: 'Mémoire Saturée',
        message: v => `RAM Moyenne: ${v}% (Seuil: 85%). Optimisation requise.`,
        type: 'warning'
    },
    power_watts: {
        limit: 250,
        cmp: '>',
        title: 'Consommation Excessive',
        message: v => `Conso Moyenne: ${v}W (Seuil: 250W). Vérifiez les équipements.`,
        type: 'warning'
    },
    co2: {
        limit: 150,
        cmp: '>',
        title: 'Emissions CO₂ Élevées',
        message: v => `CO₂ Moyen: ${v}g (Seuil: 150g). Impact environnemental critique.`,
        type: 'danger'
    },
    eco_score: {
        limit: 50,
        cmp: '<',
        title: 'Score Éco Insuffisant',
        message: v => `Score Éco Moyen: ${v} (Seuil: 50). Performance écologique faible.`,
        type: 'danger'
    }
};

// Previous state for change detection (Tracking Averages)
let previousAverages = {
    cpu: null,
    ram: null,
    power_watts: null,
    co2: null,
    eco_score: null
};

// ============================================================================
// THRESHOLD & NOTIFICATION FUNCTIONS
// ============================================================================

/**
 * Check if AVERAGE metrics exceed defined thresholds
 * @param {Object} averages - Object containing calculated averages
 */
function checkAverageThresholds(averages) {
    if (!averages) return;

    try {
        const checks = [
            ['cpu', averages.cpu],
            ['ram', averages.ram],
            ['power_watts', averages.power],
            ['eco_score', averages.eco],
            ['co2', averages.co2]
        ];

        for (const [k, v] of checks) {
            const conf = thresholds[k];
            // Validate value is a number
            if (conf && v != null && !isNaN(v)) {

                // Check if threshold is crossed
                if (compare(v, conf)) {
                    const previousValue = previousAverages[k];
                    // Trigger notification if:
                    // 1. First time crossing (previous is null)
                    // 2. OR Value has changed significantly (> 2 units) AND it's been a while (handled by notification system de-dupe)
                    // We use significant change to avoid spamming on minor fluctuations around the average

                    const hasChangedSignificantly = previousValue === null || Math.abs(v - previousValue) > 2;

                    if (hasChangedSignificantly) {
                        previousAverages[k] = v; // Update state

                        if (window.notificationSystem) {
                            window.notificationSystem.addNotification(
                                conf.type,
                                conf.title,
                                conf.message(v),
                                v
                            );
                        }
                    }
                } else {
                    // Reset state if we are back to normal levels
                    // This allows the notification to fire again if we spike again later
                    previousAverages[k] = null;
                }
            }
        }
    } catch (e) {
        console.error('Error in checkAverageThresholds:', e);
    }
}

/**
 * Compare value against threshold configuration
 * @param {number} val - Value to compare
 * @param {Object} conf - Configuration object
 * @returns {boolean}
 */
function compare(val, conf) {
    if (val == null) return false;
    return conf.cmp === '>' ? (val > conf.limit) : (val < conf.limit);
}

// ============================================================================
// METRICS & AVERAGES
// ============================================================================

/**
 * Update average metrics display
 */
/**
 * Update average metrics display and return values
 * @returns {Object} Calculated averages
 */
function calculateAndUpdateAverages() {
    const avg = arr => {
        if (!arr || !arr.length) return 0;
        const sum = arr.reduce((a, b) => a + Number(b), 0);
        return parseFloat((sum / arr.length).toFixed(1));
    };

    const cpuAvg = avg(cpuData);
    const ramAvg = avg(ramData);
    const powerAvg = avg(powerData);
    const ecoAvg = avg(ecoData);
    // CO2 might need its own average if it's an array
    const co2Avg = avg(co2Data);

    const avgCpuEl = document.getElementById('avg-cpu');
    const avgRamEl = document.getElementById('avg-ram');
    const avgPowerEl = document.getElementById('avg-power');
    const avgEcoEl = document.getElementById('avg-eco');

    if (avgCpuEl) avgCpuEl.textContent = cpuAvg + '%';
    if (avgRamEl) avgRamEl.textContent = ramAvg + '%';
    if (avgPowerEl) avgPowerEl.textContent = powerAvg + ' W';
    if (avgEcoEl) avgEcoEl.textContent = ecoAvg;

    return {
        cpu: cpuAvg,
        ram: ramAvg,
        power: powerAvg,
        eco: ecoAvg,
        co2: co2Avg
    };
}

// ============================================================================
// CHART INITIALIZATION & MANAGEMENT
// ============================================================================

/**
 * Initialize all Chart.js charts
 */
function initCharts() {
    // Destroy existing charts
    Object.values(charts).forEach(c => c.destroy());

    // Base options for all charts
    const baseOpts = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: '#e2e8f0',
                    font: { size: 12 }
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: '#94a3b8',
                    maxRotation: 45
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

    // CPU & RAM Chart
    const cpuRamCanvas = document.getElementById('cpuRamChart');
    if (cpuRamCanvas) {
        charts.cpuRam = new Chart(cpuRamCanvas, {
            type: 'line',
            data: {
                labels: chartLabels,
                datasets: [
                    {
                        label: 'CPU %',
                        data: cpuData,
                        borderColor: '#4361ee',
                        backgroundColor: 'rgba(67, 97, 238, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'RAM %',
                        data: ramData,
                        borderColor: '#a78bfa',
                        backgroundColor: 'rgba(167, 139, 250, 0.1)',
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                ...baseOpts,
                scales: {
                    ...baseOpts.scales,
                    y: {
                        ...baseOpts.scales.y,
                        min: 0,
                        max: 100
                    }
                }
            }
        });
    }

    // Energy Chart
    const energyCanvas = document.getElementById('energyChart');
    if (energyCanvas) {
        charts.energy = new Chart(energyCanvas, {
            type: 'bar',
            data: {
                labels: chartLabels,
                datasets: [{
                    label: 'Watts',
                    data: powerData,
                    backgroundColor: 'rgba(245, 158, 11, 0.7)',
                    borderColor: '#f59e0b',
                    borderWidth: 1
                }]
            },
            options: {
                ...baseOpts,
                scales: {
                    ...baseOpts.scales,
                    y: {
                        ...baseOpts.scales.y,
                        min: 0
                    }
                }
            }
        });
    }

    // Eco Score Chart
    const ecoCanvas = document.getElementById('ecoChart');
    if (ecoCanvas) {
        charts.eco = new Chart(ecoCanvas, {
            type: 'line',
            data: {
                labels: chartLabels,
                datasets: [{
                    label: 'Score Éco',
                    data: ecoData,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                ...baseOpts,
                scales: {
                    ...baseOpts.scales,
                    y: {
                        ...baseOpts.scales.y,
                        min: 0,
                        max: 100
                    }
                }
            }
        });
    }

    // CO2 Chart
    const co2Canvas = document.getElementById('co2Chart');
    if (co2Canvas) {
        charts.co2 = new Chart(co2Canvas, {
            type: 'line',
            data: {
                labels: chartLabels,
                datasets: [{
                    label: 'CO₂ (g)',
                    data: co2Data,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                ...baseOpts,
                scales: {
                    ...baseOpts.scales,
                    y: {
                        ...baseOpts.scales.y,
                        min: 0
                    }
                }
            }
        });
    }
}

// ============================================================================
// DATA TABLE MANAGEMENT
// ============================================================================

/**
 * Update the data table with latest measurements
 */
function updateTable() {
    const tbody = document.getElementById('data-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';
    latestData.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.id}</td>
            <td><span class="badge bg-primary">${row.hardware_sensor_id}</span></td>
            <td><strong>${row.cpu_usage}%</strong></td>
            <td><strong>${row.ram_usage}%</strong></td>
            <td><span class="text-warning">${row.power_watts} W</span></td>
            <td><span class="badge bg-success">${row.eco_score}</span></td>
            <td><small class="text-muted">${new Date(row.created_at).toLocaleString('fr-FR')}</small></td>
        `;
        tbody.appendChild(tr);
    });
}

// ============================================================================
// DATA UPDATE & REFRESH
// ============================================================================

/**
 * Update all dashboard components with new data
 * @param {Object} data - New data object
 */
function updateData(data) {
    try {
        // Parse JSON data if needed
        chartLabels = typeof data.chart_labels === 'string' ? JSON.parse(data.chart_labels) : data.chart_labels;
        cpuData = typeof data.cpu_data === 'string' ? JSON.parse(data.cpu_data) : data.cpu_data;
        ramData = typeof data.ram_data === 'string' ? JSON.parse(data.ram_data) : data.ram_data;
        powerData = typeof data.power_data === 'string' ? JSON.parse(data.power_data) : data.power_data;
        ecoData = typeof data.eco_data === 'string' ? JSON.parse(data.eco_data) : data.eco_data;
        co2Data = typeof data.co2_data === 'string' ? JSON.parse(data.co2_data) : data.co2_data;
        latestData = data.latest_data || [];

        // Update all visualizations
        updateCharts();
        updateTable();
        // Calculate and update averages, get the values back
        const currentAverages = calculateAndUpdateAverages();

        // Check thresholds for calculated averages
        checkAverageThresholds(currentAverages);

        // Update last update time
        updateLastUpdateTime();
    } catch (error) {
        console.error('Error updating dashboard data:', error);
    }
}

/**
 * Update chart data without reinitializing
 */
function updateCharts() {
    if (charts.cpuRam) {
        charts.cpuRam.data.labels = chartLabels;
        charts.cpuRam.data.datasets[0].data = cpuData;
        charts.cpuRam.data.datasets[1].data = ramData;
        charts.cpuRam.update('none');
    }

    if (charts.energy) {
        charts.energy.data.labels = chartLabels;
        charts.energy.data.datasets[0].data = powerData;
        charts.energy.update('none');
    }

    if (charts.eco) {
        charts.eco.data.labels = chartLabels;
        charts.eco.data.datasets[0].data = ecoData;
        charts.eco.update('none');
    }

    if (charts.co2) {
        charts.co2.data.labels = chartLabels;
        charts.co2.data.datasets[0].data = co2Data;
        charts.co2.update('none');
    }
}

/**
 * Update the last update timestamp
 */
function updateLastUpdateTime() {
    const lastUpdateEl = document.getElementById('last-update');
    if (lastUpdateEl) {
        const now = new Date();
        lastUpdateEl.textContent = now.toLocaleTimeString('fr-FR');
    }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize dashboard on page load
 */
function initDashboard() {
    // Load initial data from embedded JSON
    const initialDataEl = document.getElementById('initial-dashboard-data');
    if (initialDataEl) {
        try {
            const initialData = JSON.parse(initialDataEl.textContent);
            updateData(initialData);
        } catch (error) {
            console.error('Error parsing initial data:', error);
        }
    }

    // Initialize charts
    initCharts();

    // Update last update time
    updateLastUpdateTime();

    console.log('✅ Dashboard initialized successfully');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDashboard);
} else {
    initDashboard();
}

// ============================================================================
// EXPORTS
// ============================================================================

// Make functions globally available
window.DashboardCore = {
    updateData,
    updateCharts,
    updateTable,
    calculateAndUpdateAverages,
    checkAverageThresholds,
    initCharts
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.DashboardCore;
}
