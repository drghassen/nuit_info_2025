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

// Notification thresholds configuration
const thresholds = {
    cpu: {
        limit: 85,
        cmp: '>',
        title: 'CPU élevé',
        message: v => `CPU ${v}% > 85%`,
        type: 'warning'
    },
    ram: {
        limit: 85,
        cmp: '>',
        title: 'RAM élevée',
        message: v => `RAM ${v}% > 85%`,
        type: 'warning'
    },
    power_watts: {
        limit: 200,
        cmp: '>',
        title: 'Puissance élevée',
        message: v => `Puissance ${v}W > 200W`,
        type: 'warning'
    },
    co2: {
        limit: 500,
        cmp: '>',
        title: 'CO₂ élevé',
        message: v => `CO₂ ${v}g > 500g`,
        type: 'danger'
    },
    eco_score: {
        limit: 40,
        cmp: '<',
        title: 'Score Éco faible',
        message: v => `Score Éco ${v} < 40`,
        type: 'danger'
    }
};

// Previous state for change detection
let previousState = {
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
 * Check if metrics exceed defined thresholds
 * @param {Object} row - Data row to check
 */
function checkThresholds(row) {
    if (!row) return;

    try {
        const cpu = Number(row.cpu_usage);
        const ram = Number(row.ram_usage);
        const pw = Number(row.power_watts);
        const eco = Number(row.eco_score);
        const co2 = Number(row.co2_equiv_g || (Array.isArray(co2Data) && co2Data.length ? co2Data[co2Data.length - 1] : null));

        const checks = [
            ['cpu', cpu],
            ['ram', ram],
            ['power_watts', pw],
            ['eco_score', eco],
            ['co2', co2]
        ];

        for (const [k, v] of checks) {
            const conf = thresholds[k];
            if (conf && compare(v, conf)) {
                const previousValue = previousState[k];
                const hasChanged = previousValue === null || Math.abs(v - previousValue) > 5;

                if (hasChanged) {
                    previousState[k] = v;
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
                previousState[k] = null;
            }
        }
    } catch (e) {
        console.error('Error in checkThresholds:', e);
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
function updateAverages() {
    const avg = arr => arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : 0;

    const avgCpuEl = document.getElementById('avg-cpu');
    const avgRamEl = document.getElementById('avg-ram');
    const avgPowerEl = document.getElementById('avg-power');
    const avgEcoEl = document.getElementById('avg-eco');

    if (avgCpuEl) avgCpuEl.textContent = avg(cpuData) + '%';
    if (avgRamEl) avgRamEl.textContent = avg(ramData) + '%';
    if (avgPowerEl) avgPowerEl.textContent = avg(powerData) + ' W';
    if (avgEcoEl) avgEcoEl.textContent = avg(ecoData);
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
        updateAverages();

        // Check thresholds for latest data
        if (latestData.length > 0) {
            checkThresholds(latestData[0]);
        }

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
    updateAverages,
    checkThresholds,
    initCharts
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.DashboardCore;
}
