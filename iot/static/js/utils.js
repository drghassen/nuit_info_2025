/**
 * EcoTrack IoT - Shared Utilities
 * Common functions used across all pages
 */

// ==================== CHART UTILITIES ====================

const ChartUtils = {
    // Common chart options
    getBaseOptions() {
        return {
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
                    ticks: { color: '#94a3b8' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                }
            }
        };
    },

    // Create a chart with default options
    createChart(canvasId, type, datasets, customOptions = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;

        const ctx = canvas.getContext('2d');
        const baseOptions = this.getBaseOptions();

        return new Chart(ctx, {
            type,
            data: {
                labels: customOptions.labels || [],
                datasets
            },
            options: { ...baseOptions, ...customOptions }
        });
    },

    // Destroy all charts in an object
    destroyAll(charts) {
        Object.values(charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
    },

    // Get chart colors
    colors: {
        primary: '#4361ee',
        primaryBg: 'rgba(67, 97, 238, 0.1)',
        purple: '#a78bfa',
        purpleBg: 'rgba(167, 139, 250, 0.1)',
        success: '#10b981',
        successBg: 'rgba(16, 185, 129, 0.2)',
        warning: '#f59e0b',
        warningBg: 'rgba(245, 158, 11, 0.2)',
        danger: '#ef4444',
        dangerBg: 'rgba(239, 68, 68, 0.2)',
        info: '#38bdf8',
        infoBg: 'rgba(56, 189, 248, 0.2)',
        orange: '#f97316',
        orangeBg: 'rgba(249, 115, 22, 0.2)'
    }
};

// ==================== DATA UTILITIES ====================

const DataUtils = {
    // Calculate average of an array
    calculateAverage(arr) {
        if (!arr || !arr.length) return 0;
        return (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1);
    },

    // Format date to French locale
    formatDate(date) {
        return new Date(date).toLocaleString('fr-FR');
    },

    // Format time to French locale
    formatTime(date) {
        return new Date(date).toLocaleTimeString('fr-FR');
    },

    // Get badge class based on value and thresholds
    getBadgeClass(value, goodThreshold, warningThreshold, inverse = false) {
        if (inverse) {
            // Lower is better (e.g., overheating)
            if (value <= goodThreshold) return 'bg-success';
            if (value <= warningThreshold) return 'bg-warning';
            return 'bg-danger';
        } else {
            // Higher is better (e.g., battery health, eco score)
            if (value >= goodThreshold) return 'bg-success';
            if (value >= warningThreshold) return 'bg-warning';
            return 'bg-danger';
        }
    }
};

// ==================== DOM UTILITIES ====================

const DOMUtils = {
    // Update element text content safely
    updateText(elementId, text) {
        const el = document.getElementById(elementId);
        if (el) el.textContent = text;
    },

    // Update last update time
    updateLastUpdateTime() {
        this.updateText('last-update', DataUtils.formatTime(new Date()));
    },

    // Generate table row HTML
    generateTableRow(data, columns) {
        return `<tr>${columns.map(col => `<td>${col}</td>`).join('')}</tr>`;
    },

    // Show empty table message
    getEmptyTableRow(colspan) {
        return `<tr><td colspan="${colspan}" class="text-center py-5 opacity-50">Aucune donnée disponible</td></tr>`;
    }
};

// ==================== SIDEBAR MANAGEMENT ====================

const SidebarManager = {
    init() {
        const sidebar = document.getElementById('sidebar');
        const toggle = document.getElementById('sidebarToggle');

        if (!sidebar || !toggle) return;

        let expanded = false;

        const setExpanded = (exp) => {
            sidebar.classList.toggle('expanded', !!exp);
            document.body.classList.toggle('sidebar-open', !!exp);
        };

        toggle.addEventListener('click', () => {
            expanded = !expanded;
            setExpanded(expanded);
        });

        const handleDesktop = () => {
            sidebar.addEventListener('mouseenter', () => setExpanded(true));
            sidebar.addEventListener('mouseleave', () => setExpanded(false));
        };

        if (window.innerWidth >= 992) {
            handleDesktop();
        } else {
            setExpanded(true);
        }

        window.addEventListener('resize', () => {
            if (window.innerWidth < 992) {
                setExpanded(true);
            }
        });
    }
};

// ==================== API UTILITIES ====================

const APIUtils = {
    baseUrl: '/api',

    async fetchData(endpoint) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error fetching ${endpoint}:`, error);
            return null;
        }
    },

    // Generic data refresh function
    async refreshPageData(endpoint, updateCallback) {
        const data = await this.fetchData(endpoint);
        if (data) {
            updateCallback(data);
            DOMUtils.updateLastUpdateTime();
        }
    }
};

// ==================== PAGE DATA MANAGER ====================

class PageDataManager {
    constructor(config) {
        this.config = config;
        this.charts = {};
        this.data = {};
        this.refreshInterval = config.refreshInterval || 1500;
    }

    async init() {
        SidebarManager.init();
        await this.refreshData();
        this.startAutoRefresh();
    }

    async refreshData() {
        const data = await APIUtils.fetchData(this.config.endpoint);
        if (data) {
            this.data = data;
            this.updateAverages(data);
            this.updateCharts(data);
            this.updateTable(data);
            DOMUtils.updateLastUpdateTime();
        }
    }

    updateAverages(data) {
        if (this.config.averages) {
            this.config.averages.forEach(({ elementId, dataKey, suffix }) => {
                const value = data[dataKey] !== undefined ? data[dataKey] : DataUtils.calculateAverage(data[`${dataKey}_data`] || []);
                DOMUtils.updateText(elementId, value + (suffix || ''));
            });
        }
    }

    updateCharts(data) {
        ChartUtils.destroyAll(this.charts);
        this.charts = {};

        if (this.config.charts) {
            this.config.charts.forEach(chartConfig => {
                const labels = data.chart_labels || [];
                if (labels.length > 0) {
                    this.charts[chartConfig.id] = ChartUtils.createChart(
                        chartConfig.canvasId,
                        chartConfig.type,
                        chartConfig.getDatasets(data),
                        { labels, ...chartConfig.options }
                    );
                }
            });
        }
    }

    updateTable(data) {
        const tbody = document.getElementById('data-table-body');
        if (!tbody || !this.config.tableRenderer) return;

        const latestData = data.latest_data || [];
        tbody.innerHTML = latestData.length > 0
            ? latestData.map(row => this.config.tableRenderer(row)).join('')
            : DOMUtils.getEmptyTableRow(this.config.tableColumns || 7);
    }

    startAutoRefresh() {
        setInterval(() => this.refreshData(), this.refreshInterval);
    }
}

// ==================== INITIALIZE ON DOM READY ====================

document.addEventListener('DOMContentLoaded', () => {
    SidebarManager.init();
});

// Export for module usage (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ChartUtils,
        DataUtils,
        DOMUtils,
        SidebarManager,
        APIUtils,
        PageDataManager
    };
}
