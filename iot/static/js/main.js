// ==================== DASHBOARD IoT PRINCIPAL ====================
// Instancier les systèmes
const notificationSystem = new NotificationSystem();
const chatbotSystem = new ChatbotSystem();

// Variables globales
let chartLabels = [], cpuData = [], ramData = [], powerData = [], ecoData = [], co2Data = [], latestData = [];
const charts = {};
let previousState = {
    cpu: null,
    ram: null,
    power_watts: null,
    co2: null,
    eco_score: null
};

// Configuration des seuils
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

// Fonctions utilitaires
function compare(val, conf) {
    if (val == null) return false;
    return conf.cmp === '>' ? (val > conf.limit) : (val < conf.limit);
}

function updateAverages() {
    const avg = arr => arr.length ? (arr.reduce((a,b) => a + b, 0) / arr.length).toFixed(1) : 0;
    
    const avgCpuElem = document.getElementById('avg-cpu');
    const avgRamElem = document.getElementById('avg-ram');
    const avgPowerElem = document.getElementById('avg-power');
    const avgEcoElem = document.getElementById('avg-eco');
    
    if (avgCpuElem) avgCpuElem.textContent = avg(cpuData) + '%';
    if (avgRamElem) avgRamElem.textContent = avg(ramData) + '%';
    if (avgPowerElem) avgPowerElem.textContent = avg(powerData) + ' W';
    if (avgEcoElem) avgEcoElem.textContent = avg(ecoData);
}

// Initialisation des graphiques
function initCharts() {
    Object.values(charts).forEach(c => c.destroy());
    
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
                ticks: { color: '#94a3b8' },
                grid: { color: 'rgba(255,255,255,0.1)' }
            }
        }
    };

    // CPU & RAM Chart
    const cpuRamCtx = document.getElementById('cpuRamChart');
    if (cpuRamCtx) {
        charts.cpuRam = new Chart(cpuRamCtx, {
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
    const energyCtx = document.getElementById('energyChart');
    if (energyCtx) {
        charts.energy = new Chart(energyCtx, {
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
    const ecoCtx = document.getElementById('ecoChart');
    if (ecoCtx) {
        charts.eco = new Chart(ecoCtx, {
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
    const co2Ctx = document.getElementById('co2Chart');
    if (co2Ctx) {
        charts.co2 = new Chart(co2Ctx, {
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

// Mise à jour du tableau
function updateTable() {
    const tbody = document.getElementById('data-table-body');
    if (!tbody) return;
   
    tbody.innerHTML = latestData.length ? latestData.map(d => `
        <tr>
            <td>${d.id}</td>
            <td>${d.hardware_sensor_id}</td>
            <td>${d.cpu_usage}%</td>
            <td>${d.ram_usage}%</td>
            <td>${d.power_watts}W</td>
            <td><span class="badge-eco ${d.eco_score >= 75 ? 'bg-success' : d.eco_score >= 50 ? 'bg-warning' : 'bg-danger'}">${d.eco_score}</span></td>
            <td>${new Date(d.created_at).toLocaleString('fr-FR')}</td>
        </tr>
    `).join('') : '<tr><td colspan="7" class="text-center py-5 opacity-50">Aucune donnée</td></tr>';
}

// Mise à jour de l'heure
function updateTime() {
    const updateElem = document.getElementById('last-update');
    if (updateElem) {
        updateElem.textContent = new Date().toLocaleTimeString('fr-FR');
    }
}

// Vérification des seuils
function checkThresholds(row) {
    if (!row) return;
   
    try {
        const cpu = Number(row.cpu_usage);
        const ram = Number(row.ram_usage);
        const pw = Number(row.power_watts);
        const eco = Number(row.eco_score);
        const co2 = Number(row.co2_equiv_g || (Array.isArray(co2Data) && co2Data.length ? co2Data[co2Data.length-1] : null));
       
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
                const hasChanged = previousValue === null ||
                                  Math.abs(v - previousValue) > 5;
               
                if (hasChanged) {
                    previousState[k] = v;
                    notificationSystem.addNotification(
                        conf.type,
                        conf.title,
                        conf.message(v),
                        v
                    );
                }
            } else {
                previousState[k] = null;
            }
        }
    } catch(e) {
        console.error('Erreur dans checkThresholds:', e);
    }
}

// Traitement des données reçues via WebSocket
function processWebSocketData(data) {
    if (data.type === 'initial_data') {
        // Données initiales
        chartLabels = data.chart_labels || [];
        cpuData = data.cpu_data || [];
        ramData = data.ram_data || [];
        powerData = data.power_data || [];
        ecoData = data.eco_data || [];
        co2Data = data.co2_data || [];
        latestData = data.latest_data || [];
        
        // Mettre à jour les moyennes depuis les données reçues
        const avgCpuElem = document.getElementById('avg-cpu');
        const avgRamElem = document.getElementById('avg-ram');
        const avgPowerElem = document.getElementById('avg-power');
        const avgEcoElem = document.getElementById('avg-eco');
        
        if (avgCpuElem && data.avg_cpu !== undefined) avgCpuElem.textContent = data.avg_cpu + '%';
        if (avgRamElem && data.avg_ram !== undefined) avgRamElem.textContent = data.avg_ram + '%';
        if (avgPowerElem && data.avg_power !== undefined) avgPowerElem.textContent = data.avg_power + ' W';
        if (avgEcoElem && data.avg_eco !== undefined) avgEcoElem.textContent = data.avg_eco;
    } else if (data.type === 'new_data') {
        // Nouvelle donnée reçue
        const newData = data.data;
        
        // Ajouter aux tableaux (garder seulement les 10 dernières)
        const timeLabel = new Date(newData.created_at).toLocaleTimeString('fr-FR');
        chartLabels.push(timeLabel);
        if (chartLabels.length > 10) chartLabels.shift();
        
        cpuData.push(newData.cpu_usage);
        if (cpuData.length > 10) cpuData.shift();
        
        ramData.push(newData.ram_usage);
        if (ramData.length > 10) ramData.shift();
        
        powerData.push(newData.power_watts);
        if (powerData.length > 10) powerData.shift();
        
        ecoData.push(newData.eco_score);
        if (ecoData.length > 10) ecoData.shift();
        
        co2Data.push(newData.co2_equiv_g);
        if (co2Data.length > 10) co2Data.shift();
        
        // Ajouter au début de latestData
        latestData.unshift({
            id: newData.id,
            hardware_sensor_id: newData.hardware_sensor_id,
            cpu_usage: newData.cpu_usage,
            ram_usage: newData.ram_usage,
            power_watts: newData.power_watts,
            eco_score: newData.eco_score,
            created_at: new Date(newData.created_at).toLocaleString('fr-FR')
        });
        if (latestData.length > 10) latestData.pop();
        
        // Vérifier les seuils
        checkThresholds(newData);
    }
    
    // Mettre à jour l'interface
    updateAverages();
    initCharts();
    updateTable();
    updateTime();
}

// Initialisation WebSocket
let wsClient = null;

function initWebSocket() {
    wsClient = new WebSocketClient('/ws/dashboard/', {
        onOpen: () => {
            console.log('WebSocket connecté pour le dashboard');
        },
        onMessage: (data) => {
            processWebSocketData(data);
        },
        onError: (error) => {
            console.error('Erreur WebSocket:', error);
        },
        onClose: () => {
            console.log('WebSocket fermé, tentative de reconnexion...');
        }
    });
    
    wsClient.connect();
}

// Fonction de nettoyage
function cleanup() {
    if (wsClient) {
        wsClient.disconnect();
    }
}

// Gestion de la sidebar
function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('sidebarToggle');
   
    if (!sidebar || !toggle) return;
   
    function setExpanded(exp){
        sidebar.classList.toggle('expanded', !!exp);
        document.body.classList.toggle('sidebar-open', !!exp);
    }
   
    let expanded = false;
    toggle.addEventListener('click', () => {
        expanded = !expanded;
        setExpanded(expanded);
    });
   
    if(window.innerWidth >= 992){
        sidebar.addEventListener('mouseenter', () => { setExpanded(true); });
        sidebar.addEventListener('mouseleave', () => { setExpanded(false); });
    }
   
    window.addEventListener('resize', () => {
        if(window.innerWidth < 992){
            sidebar.removeEventListener('mouseenter', () => {});
            sidebar.removeEventListener('mouseleave', () => {});
            setExpanded(true);
        } else {
            sidebar.addEventListener('mouseenter', () => { setExpanded(true); });
            sidebar.addEventListener('mouseleave', () => { setExpanded(false); });
        }
    });
   
    if(window.innerWidth < 992){
        setExpanded(true);
    }
}

// Navigation catégories
function initCategoryButtons() {
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const cat = btn.dataset.category;
            if (cat) window.location.href = `/api/${cat}/`;
        });
    });
}

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', () => {
    initSidebar();
    initCategoryButtons();
    
    // Nettoyage périodique du cache
    setInterval(() => {
        notificationSystem.cleanupNotificationCache();
    }, 60000);
    
    // Initialiser WebSocket pour les mises à jour en temps réel
    initWebSocket();
});

// Nettoyage à la fermeture de la page
window.addEventListener('beforeunload', cleanup);
