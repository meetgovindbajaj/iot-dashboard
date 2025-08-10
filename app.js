// Application State
const AppState = {
    currentUser: null,
    currentPage: 'dashboard',
    currentSensorId: null,
    charts: {},
    theme: 'auto',
    updateInterval: null,
    updateIntervalTime: 30000,
    isConnected: true
};

// Sample Data
const IoTData = {
    sensors: [
        {
            id: "TEMP_001",
            name: "Main Hall Temperature",
            type: "temperature",
            location: "Building A - Main Hall",
            unit: "°C",
            status: "active",
            value: 22.5,
            timestamp: new Date().toISOString(),
            thresholds: { min: 18, max: 26, critical_min: 15, critical_max: 35 },
            history: []
        },
        {
            id: "HUM_001",
            name: "Main Hall Humidity",
            type: "humidity",
            location: "Building A - Main Hall",
            unit: "%",
            status: "active",
            value: 55.2,
            timestamp: new Date().toISOString(),
            thresholds: { min: 30, max: 70, critical_min: 20, critical_max: 85 },
            history: []
        },
        {
            id: "PWR_001",
            name: "Server Room Power",
            type: "power",
            location: "Building A - Server Room",
            unit: "kW",
            status: "warning",
            value: 16.8,
            timestamp: new Date().toISOString(),
            thresholds: { min: 0.5, max: 15, critical_min: 0.1, critical_max: 20 },
            history: []
        },
        {
            id: "LIGHT_001",
            name: "Office Light Level",
            type: "light",
            location: "Building B - Office",
            unit: "lux",
            status: "active",
            value: 450,
            timestamp: new Date().toISOString(),
            thresholds: { min: 200, max: 1000, critical_min: 50, critical_max: 2000 },
            history: []
        },
        {
            id: "MOTION_001",
            name: "Conference Room Motion",
            type: "motion",
            location: "Building B - Conference Room",
            unit: "bool",
            status: "active",
            value: 0,
            timestamp: new Date().toISOString(),
            thresholds: { min: 0, max: 1 },
            history: []
        },
        {
            id: "PRESS_001",
            name: "Laboratory Pressure",
            type: "pressure",
            location: "Research Building - Lab 1",
            unit: "hPa",
            status: "active",
            value: 1013.2,
            timestamp: new Date().toISOString(),
            thresholds: { min: 1000, max: 1030, critical_min: 990, critical_max: 1040 },
            history: []
        }
    ],
    alerts: [
        {
            id: "ALERT_001",
            sensorId: "PWR_001",
            sensorName: "Server Room Power",
            type: "threshold",
            severity: "critical",
            title: "High Power Consumption",
            message: "Server Room Power exceeded maximum threshold of 15kW with current reading of 16.8kW",
            timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
            status: "active"
        },
        {
            id: "ALERT_002",
            sensorId: "TEMP_001",
            sensorName: "Main Hall Temperature",
            type: "threshold",
            severity: "warning",
            title: "Temperature Rising",
            message: "Main Hall temperature approaching upper limit of 26°C",
            timestamp: new Date(Date.now() - 90 * 60000).toISOString(),
            status: "active"
        }
    ],
    users: {
        "admin@iot.com": {
            password: "admin123",
            name: "System Administrator",
            role: "admin",
            lastLogin: new Date().toISOString()
        },
        "user@iot.com": {
            password: "user123",
            name: "Regular User",
            role: "user",
            lastLogin: new Date().toISOString()
        }
    }
};

// Utility Functions
const Utils = {
    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString();
    },

    formatTimeAgo(timestamp) {
        const now = new Date();
        const date = new Date(timestamp);
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    },

    formatSensorValue(value, type) {
        if (type === 'motion') {
            return value ? 'Motion' : 'No Motion';
        }
        return typeof value === 'number' ? value.toFixed(1) : value;
    },

    getSensorStatusClass(sensor) {
        if (sensor.status !== 'active') return sensor.status;
        
        const { value, thresholds } = sensor;
        if (value < thresholds.critical_min || value > thresholds.critical_max) {
            return 'error';
        } else if (value < thresholds.min || value > thresholds.max) {
            return 'warning';
        }
        return 'active';
    },

    generateSensorHistory() {
        const now = Date.now();
        IoTData.sensors.forEach(sensor => {
            sensor.history = [];
            for (let i = 0; i < 24; i++) {
                const timestamp = now - (23 - i) * 60 * 60 * 1000;
                let value = sensor.value;
                
                // Add realistic variations
                switch (sensor.type) {
                    case 'temperature':
                        value = 22.5 + Math.sin(i * 0.5) * 3 + (Math.random() - 0.5) * 2;
                        break;
                    case 'humidity':
                        value = 55.2 + Math.sin(i * 0.3) * 10 + (Math.random() - 0.5) * 5;
                        break;
                    case 'power':
                        value = 12 + Math.sin(i * 0.4) * 4 + (Math.random() - 0.5) * 2;
                        break;
                    case 'light':
                        value = 450 + Math.sin(i * 0.6) * 200 + (Math.random() - 0.5) * 50;
                        break;
                    case 'pressure':
                        value = 1013.2 + Math.sin(i * 0.2) * 5 + (Math.random() - 0.5) * 2;
                        break;
                    case 'motion':
                        value = Math.random() > 0.8 ? 1 : 0;
                        break;
                }
                
                sensor.history.push({
                    timestamp,
                    value: Math.round(value * 100) / 100
                });
            }
        });
    },

    showAlert(message, type = 'info') {
        alert(message);
    }
};

// Authentication Module
const Auth = {
    init() {
        console.log('Initializing Auth module...');
        
        const loginForm = document.getElementById('login-form');
        const demoButton = document.getElementById('demo-login');
        const logoutBtn = document.getElementById('logout-btn');

        // Login form submission
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('Login form submitted');
                this.performLogin();
            });
        }

        // Demo login button
        if (demoButton) {
            demoButton.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Demo login clicked');
                this.fillDemoCredentials();
            });
        }

        // Logout button
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }

        console.log('Auth module initialized');
    },

    fillDemoCredentials() {
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        
        if (emailInput && passwordInput) {
            emailInput.value = 'admin@iot.com';
            passwordInput.value = 'admin123';
            
            // Automatically perform login after filling credentials
            setTimeout(() => {
                this.performLogin();
            }, 100);
        }
    },

    performLogin() {
        console.log('Performing login...');
        
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');

        if (!emailInput || !passwordInput) {
            console.error('Login inputs not found');
            Utils.showAlert('Login form error. Please refresh the page.');
            return;
        }

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        console.log('Attempting login with:', email);

        if (!email || !password) {
            Utils.showAlert('Please enter both email and password.');
            return;
        }

        const user = IoTData.users[email];
        if (user && user.password === password) {
            console.log('Login successful');
            AppState.currentUser = { email, ...user };
            user.lastLogin = new Date().toISOString();
            this.showApp();
            RealTimeUpdates.start();
        } else {
            console.log('Login failed - invalid credentials');
            Utils.showAlert('Invalid credentials. Please use:\nAdmin: admin@iot.com / admin123\nUser: user@iot.com / user123');
        }
    },

    showApp() {
        console.log('Showing main application');
        
        const loginPage = document.getElementById('login-page');
        const appPage = document.getElementById('app');

        if (loginPage) {
            loginPage.classList.add('hidden');
        }
        if (appPage) {
            appPage.classList.remove('hidden');
        }

        // Update user info in UI
        this.updateUserInfo();
        
        // Navigate to dashboard
        setTimeout(() => {
            Navigation.goToPage('dashboard');
        }, 100);
    },

    updateUserInfo() {
        if (!AppState.currentUser) return;

        const userNameEl = document.getElementById('user-name');
        const profileNameEl = document.getElementById('profile-name');
        const profileEmailEl = document.getElementById('profile-email');
        const profileRoleEl = document.getElementById('profile-role');
        const profileLastLoginEl = document.getElementById('profile-last-login');

        if (userNameEl) userNameEl.textContent = AppState.currentUser.name;
        if (profileNameEl) profileNameEl.value = AppState.currentUser.name;
        if (profileEmailEl) profileEmailEl.value = AppState.currentUser.email;
        if (profileRoleEl) profileRoleEl.value = AppState.currentUser.role;
        if (profileLastLoginEl) profileLastLoginEl.value = Utils.formatTimestamp(AppState.currentUser.lastLogin);
    },

    handleLogout() {
        console.log('Logging out');
        
        AppState.currentUser = null;
        RealTimeUpdates.stop();

        const appPage = document.getElementById('app');
        const loginPage = document.getElementById('login-page');
        const loginForm = document.getElementById('login-form');

        if (appPage) appPage.classList.add('hidden');
        if (loginPage) loginPage.classList.remove('hidden');
        if (loginForm) loginForm.reset();

        // Clear all charts
        Object.values(AppState.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        AppState.charts = {};
    }
};

// Theme Management
const Theme = {
    init() {
        AppState.theme = 'auto';
        this.apply();

        const themeToggle = document.getElementById('theme-toggle');
        const themeSelect = document.getElementById('theme-select');

        if (themeToggle) {
            themeToggle.addEventListener('click', this.toggle.bind(this));
        }

        if (themeSelect) {
            themeSelect.value = AppState.theme;
            themeSelect.addEventListener('change', (e) => {
                AppState.theme = e.target.value;
                this.apply();
            });
        }
    },

    toggle() {
        if (AppState.theme === 'light') {
            AppState.theme = 'dark';
        } else if (AppState.theme === 'dark') {
            AppState.theme = 'auto';
        } else {
            AppState.theme = 'light';
        }

        const themeSelect = document.getElementById('theme-select');
        if (themeSelect) themeSelect.value = AppState.theme;
        
        this.apply();
    },

    apply() {
        const root = document.documentElement;
        const themeToggle = document.getElementById('theme-toggle');

        if (AppState.theme === 'dark') {
            root.setAttribute('data-color-scheme', 'dark');
            if (themeToggle) themeToggle.textContent = '☀️';
        } else if (AppState.theme === 'light') {
            root.setAttribute('data-color-scheme', 'light');
            if (themeToggle) themeToggle.textContent = '🌙';
        } else {
            root.removeAttribute('data-color-scheme');
            if (themeToggle) {
                const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                themeToggle.textContent = prefersDark ? '☀️' : '🌙';
            }
        }
    }
};

// Navigation Module
const Navigation = {
    init() {
        console.log('Initializing Navigation module...');
        
        // Navigation items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const page = e.target.dataset.page;
                if (page) {
                    this.goToPage(page);
                }
            });
        });

        // User menu
        const userMenuBtn = document.getElementById('user-menu-btn');
        if (userMenuBtn) {
            userMenuBtn.addEventListener('click', this.toggleUserMenu);
        }

        // Back button
        const backBtn = document.getElementById('back-to-sensors');
        if (backBtn) {
            backBtn.addEventListener('click', () => this.goToPage('sensors'));
        }

        // User dropdown items
        document.querySelectorAll('.dropdown-item[data-page]').forEach(item => {
            item.addEventListener('click', (e) => {
                const page = e.target.dataset.page;
                if (page) {
                    this.goToPage(page);
                    this.hideUserMenu();
                }
            });
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.user-menu')) {
                this.hideUserMenu();
            }
        });

        console.log('Navigation module initialized');
    },

    goToPage(page) {
        console.log('Navigating to page:', page);
        AppState.currentPage = page;

        // Update navigation active state
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === page) {
                item.classList.add('active');
            }
        });

        // Hide all pages
        document.querySelectorAll('.page-content').forEach(p => p.classList.add('hidden'));

        // Show current page
        const currentPageElement = document.getElementById(`${page}-page`);
        if (currentPageElement) {
            currentPageElement.classList.remove('hidden');
        }

        // Load page content
        setTimeout(() => {
            switch (page) {
                case 'dashboard':
                    Dashboard.load();
                    break;
                case 'sensors':
                    Sensors.load();
                    break;
                case 'sensor-detail':
                    // Handled by Sensors.showDetail
                    break;
                case 'alerts':
                    Alerts.load();
                    break;
                case 'profile':
                case 'settings':
                    // These are already populated
                    break;
            }
        }, 50);
    },

    toggleUserMenu() {
        const dropdown = document.getElementById('user-dropdown');
        if (dropdown) {
            dropdown.classList.toggle('hidden');
        }
    },

    hideUserMenu() {
        const dropdown = document.getElementById('user-dropdown');
        if (dropdown) {
            dropdown.classList.add('hidden');
        }
    }
};

// Dashboard Module
const Dashboard = {
    load() {
        console.log('Loading dashboard...');
        this.updateMetrics();
        setTimeout(() => {
            this.createSensorTrendsChart();
            this.createPowerChart();
        }, 200);
        this.updateRecentActivity();
    },

    updateMetrics() {
        const activeSensors = IoTData.sensors.filter(s => s.status === 'active').length;
        const activeAlerts = IoTData.alerts.filter(a => a.status === 'active').length;
        const totalSensors = IoTData.sensors.length;
        const systemHealth = Math.round((activeSensors / totalSensors) * 100);

        const updates = {
            'total-sensors': totalSensors,
            'active-sensors': activeSensors,
            'total-alerts': activeAlerts,
            'system-health': `${systemHealth}%`
        };

        Object.entries(updates).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    },

    createSensorTrendsChart() {
        const canvas = document.getElementById('sensor-trends-chart');
        if (!canvas || !window.Chart) {
            console.log('Chart.js not available or canvas not found');
            return;
        }

        const ctx = canvas.getContext('2d');

        if (AppState.charts.sensorTrends) {
            AppState.charts.sensorTrends.destroy();
        }

        try {
            const datasets = IoTData.sensors.slice(0, 3).map((sensor, index) => {
                const colors = ['#1FB8CD', '#FFC185', '#B4413C'];
                return {
                    label: sensor.name,
                    data: sensor.history.map(h => ({ x: h.timestamp, y: h.value })),
                    borderColor: colors[index],
                    backgroundColor: colors[index] + '20',
                    tension: 0.4,
                    fill: false,
                    pointRadius: 2
                };
            });

            AppState.charts.sensorTrends = new Chart(ctx, {
                type: 'line',
                data: { datasets },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    },
                    scales: {
                        x: {
                            type: 'time',
                            time: {
                                unit: 'hour',
                                displayFormats: { hour: 'HH:mm' }
                            },
                            title: { display: true, text: 'Time' }
                        },
                        y: {
                            beginAtZero: false,
                            title: { display: true, text: 'Values' }
                        }
                    },
                    plugins: {
                        legend: { position: 'bottom' }
                    }
                }
            });
            console.log('Sensor trends chart created successfully');
        } catch (error) {
            console.error('Error creating sensor trends chart:', error);
        }
    },

    createPowerChart() {
        const canvas = document.getElementById('power-chart');
        if (!canvas || !window.Chart) {
            console.log('Chart.js not available or canvas not found for power chart');
            return;
        }

        const ctx = canvas.getContext('2d');

        if (AppState.charts.power) {
            AppState.charts.power.destroy();
        }

        try {
            const powerSensor = IoTData.sensors.find(s => s.type === 'power');
            if (!powerSensor) {
                console.log('Power sensor not found');
                return;
            }

            AppState.charts.power = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: powerSensor.history.map(h => {
                        const date = new Date(h.timestamp);
                        return date.getHours().toString().padStart(2, '0') + ':00';
                    }),
                    datasets: [{
                        label: 'Power Consumption (kW)',
                        data: powerSensor.history.map(h => h.value),
                        backgroundColor: '#1FB8CD80',
                        borderColor: '#1FB8CD',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: { title: { display: true, text: 'Time (Hour)' } },
                        y: { beginAtZero: true, title: { display: true, text: 'Power (kW)' } }
                    },
                    plugins: {
                        legend: { position: 'bottom' }
                    }
                }
            });
            console.log('Power chart created successfully');
        } catch (error) {
            console.error('Error creating power chart:', error);
        }
    },

    updateRecentActivity() {
        const activities = [
            { icon: '📊', title: 'System status check completed', time: Utils.formatTimeAgo(new Date(Date.now() - 2 * 60000)) },
            { icon: '🔔', title: 'New alert: Power consumption high', time: Utils.formatTimeAgo(new Date(Date.now() - 45 * 60000)) },
            { icon: '📡', title: 'Sensor data updated', time: Utils.formatTimeAgo(new Date(Date.now() - 12 * 60000)) },
            { icon: '👤', title: `User login: ${AppState.currentUser?.name || 'Unknown'}`, time: 'Just now' }
        ];

        const container = document.getElementById('recent-activity');
        if (container) {
            container.innerHTML = activities.map(activity => `
                <div class="activity-item">
                    <div class="activity-icon">${activity.icon}</div>
                    <div class="activity-content">
                        <p class="activity-title">${activity.title}</p>
                        <p class="activity-time">${activity.time}</p>
                    </div>
                </div>
            `).join('');
        }
    }
};

// Sensors Module
const Sensors = {
    load() {
        console.log('Loading sensors page...');
        const container = document.getElementById('sensors-list');
        if (!container) return;

        container.innerHTML = IoTData.sensors.map(sensor => {
            const statusClass = Utils.getSensorStatusClass(sensor);
            const formattedValue = Utils.formatSensorValue(sensor.value, sensor.type);

            return `
                <div class="sensor-card" data-sensor-id="${sensor.id}">
                    <div class="sensor-header">
                        <div>
                            <h3 class="sensor-name">${sensor.name}</h3>
                            <p class="sensor-type">${sensor.type} sensor</p>
                        </div>
                        <span class="sensor-status ${statusClass}">${sensor.status}</span>
                    </div>
                    
                    <div class="sensor-reading">
                        <span class="sensor-value">${formattedValue}</span>
                        <span class="sensor-unit">${sensor.unit}</span>
                    </div>
                    
                    <p class="sensor-location">${sensor.location}</p>
                    <p class="sensor-timestamp">Last updated: ${Utils.formatTimestamp(sensor.timestamp)}</p>
                </div>
            `;
        }).join('');

        // Add click listeners
        container.querySelectorAll('.sensor-card').forEach(card => {
            card.addEventListener('click', () => {
                const sensorId = card.dataset.sensorId;
                this.showDetail(sensorId);
            });
        });
    },

    showDetail(sensorId) {
        console.log('Showing sensor detail for:', sensorId);
        AppState.currentSensorId = sensorId;
        const sensor = IoTData.sensors.find(s => s.id === sensorId);
        if (!sensor) return;

        // Update UI elements
        const updates = {
            'sensor-detail-name': sensor.name,
            'sensor-detail-location': sensor.location,
            'current-reading': Utils.formatSensorValue(sensor.value, sensor.type),
            'current-unit': sensor.unit,
            'reading-timestamp': `Last updated: ${Utils.formatTimestamp(sensor.timestamp)}`
        };

        Object.entries(updates).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });

        // Update sensor status
        const statusEl = document.getElementById('sensor-status');
        if (statusEl) {
            const statusClass = Utils.getSensorStatusClass(sensor);
            statusEl.className = `sensor-status ${statusClass}`;
            statusEl.textContent = sensor.status;
        }

        setTimeout(() => this.createDetailChart(sensor), 200);
        Navigation.goToPage('sensor-detail');
    },

    createDetailChart(sensor) {
        const canvas = document.getElementById('sensor-detail-chart');
        if (!canvas || !window.Chart) {
            console.log('Chart.js not available or canvas not found for sensor detail');
            return;
        }

        const ctx = canvas.getContext('2d');

        if (AppState.charts.sensorDetail) {
            AppState.charts.sensorDetail.destroy();
        }

        try {
            AppState.charts.sensorDetail = new Chart(ctx, {
                type: 'line',
                data: {
                    datasets: [{
                        label: `${sensor.name} (${sensor.unit})`,
                        data: sensor.history.map(h => ({ x: h.timestamp, y: h.value })),
                        borderColor: '#1FB8CD',
                        backgroundColor: '#1FB8CD20',
                        tension: 0.4,
                        fill: true,
                        pointRadius: 3,
                        pointHoverRadius: 5
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            type: 'time',
                            time: {
                                unit: 'hour',
                                displayFormats: { hour: 'HH:mm' }
                            },
                            title: { display: true, text: 'Time' }
                        },
                        y: {
                            beginAtZero: sensor.type !== 'temperature' && sensor.type !== 'pressure',
                            title: { display: true, text: `${sensor.name} (${sensor.unit})` }
                        }
                    },
                    plugins: {
                        legend: { position: 'bottom' }
                    }
                }
            });
            console.log('Sensor detail chart created successfully');
        } catch (error) {
            console.error('Error creating sensor detail chart:', error);
        }
    }
};

// Alerts Module
const Alerts = {
    load() {
        console.log('Loading alerts page...');
        const container = document.getElementById('alerts-list');
        if (!container) return;

        if (IoTData.alerts.length === 0) {
            container.innerHTML = `
                <div class="card">
                    <div class="card__body" style="text-align: center; color: var(--color-text-secondary);">
                        <p>No active alerts at this time.</p>
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = IoTData.alerts.map(alert => `
            <div class="alert-item ${alert.severity} ${alert.status}" data-alert-id="${alert.id}">
                <div class="alert-header">
                    <h3 class="alert-title">${alert.title}</h3>
                    <span class="alert-severity ${alert.severity}">${alert.severity}</span>
                </div>
                <p class="alert-message">${alert.message}</p>
                <div class="alert-meta">
                    <span class="alert-sensor">${alert.sensorName}</span>
                    <span class="alert-time">${Utils.formatTimeAgo(alert.timestamp)}</span>
                </div>
                ${alert.status === 'acknowledged' ? '<div style="margin-top: 12px; font-size: 12px; color: var(--color-text-secondary);">✓ Acknowledged</div>' : ''}
            </div>
        `).join('');

        // Add click listeners
        container.querySelectorAll('.alert-item').forEach(item => {
            item.addEventListener('click', () => {
                const alertId = item.dataset.alertId;
                this.showModal(alertId);
            });
        });
    },

    showModal(alertId) {
        const alert = IoTData.alerts.find(a => a.id === alertId);
        if (!alert) return;

        document.getElementById('modal-title').textContent = alert.title;
        document.getElementById('modal-message').textContent = alert.message;
        document.getElementById('modal-sensor').textContent = alert.sensorName;
        document.getElementById('modal-time').textContent = Utils.formatTimestamp(alert.timestamp);
        
        const severityEl = document.getElementById('modal-severity');
        severityEl.textContent = alert.severity;
        severityEl.className = `alert-severity ${alert.severity}`;

        const modal = document.getElementById('alert-modal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.dataset.alertId = alertId;
        }

        // Update acknowledge button
        const acknowledgeBtn = document.getElementById('acknowledge-alert');
        if (acknowledgeBtn) {
            if (alert.status === 'acknowledged') {
                acknowledgeBtn.textContent = 'Already Acknowledged';
                acknowledgeBtn.disabled = true;
            } else {
                acknowledgeBtn.textContent = 'Acknowledge Alert';
                acknowledgeBtn.disabled = false;
            }
        }
    },

    closeModal() {
        const modal = document.getElementById('alert-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    },

    acknowledgeAlert() {
        const modal = document.getElementById('alert-modal');
        if (!modal) return;

        const alertId = modal.dataset.alertId;
        const alert = IoTData.alerts.find(a => a.id === alertId);
        if (alert && alert.status !== 'acknowledged') {
            alert.status = 'acknowledged';
            this.closeModal();
            this.load(); // Refresh alerts list
            Dashboard.updateMetrics(); // Update dashboard metrics
            Utils.showAlert('Alert acknowledged successfully');
        }
    }
};

// Real-time Updates Module
const RealTimeUpdates = {
    start() {
        console.log('Starting real-time updates...');
        this.updateConnectionStatus();
        AppState.updateInterval = setInterval(() => {
            this.updateSensorData();
            this.updateConnectionStatus();
            this.refreshCurrentPage();
        }, AppState.updateIntervalTime);
    },

    stop() {
        console.log('Stopping real-time updates...');
        if (AppState.updateInterval) {
            clearInterval(AppState.updateInterval);
            AppState.updateInterval = null;
        }
    },

    updateSensorData() {
        const now = Date.now();
        
        IoTData.sensors.forEach(sensor => {
            let newValue = sensor.value;
            
            // Generate realistic variations
            switch (sensor.type) {
                case 'temperature':
                    newValue += (Math.random() - 0.5) * 2;
                    newValue = Math.max(15, Math.min(35, newValue));
                    break;
                case 'humidity':
                    newValue += (Math.random() - 0.5) * 5;
                    newValue = Math.max(20, Math.min(85, newValue));
                    break;
                case 'power':
                    newValue += (Math.random() - 0.5) * 1;
                    newValue = Math.max(0.1, Math.min(20, newValue));
                    break;
                case 'light':
                    newValue += (Math.random() - 0.5) * 50;
                    newValue = Math.max(50, Math.min(2000, newValue));
                    break;
                case 'pressure':
                    newValue += (Math.random() - 0.5) * 2;
                    newValue = Math.max(990, Math.min(1040, newValue));
                    break;
                case 'motion':
                    newValue = Math.random() > 0.9 ? (newValue === 1 ? 0 : 1) : newValue;
                    break;
            }
            
            sensor.value = Math.round(newValue * 100) / 100;
            sensor.timestamp = new Date(now).toISOString();
            
            // Add to history (keep only last 24 points)
            sensor.history.push({ timestamp: now, value: sensor.value });
            if (sensor.history.length > 24) {
                sensor.history.shift();
            }
        });
    },

    updateConnectionStatus() {
        const status = document.getElementById('connection-status');
        if (!status) return;

        // Simulate 95% uptime
        AppState.isConnected = Math.random() > 0.05;

        if (AppState.isConnected) {
            status.className = 'connection-status';
            status.innerHTML = '<span class="status-dot"></span><span>Connected</span>';
        } else {
            status.className = 'connection-status disconnected';
            status.innerHTML = '<span class="status-dot"></span><span>Disconnected</span>';
        }
    },

    refreshCurrentPage() {
        if (!AppState.currentUser) return;

        switch (AppState.currentPage) {
            case 'dashboard':
                Dashboard.updateMetrics();
                this.updateCharts();
                Dashboard.updateRecentActivity();
                break;
            case 'sensors':
                Sensors.load();
                break;
            case 'sensor-detail':
                if (AppState.currentSensorId) {
                    const sensor = IoTData.sensors.find(s => s.id === AppState.currentSensorId);
                    if (sensor) {
                        // Update current reading display
                        const elements = {
                            'current-reading': Utils.formatSensorValue(sensor.value, sensor.type),
                            'reading-timestamp': `Last updated: ${Utils.formatTimestamp(sensor.timestamp)}`
                        };
                        Object.entries(elements).forEach(([id, value]) => {
                            const element = document.getElementById(id);
                            if (element) element.textContent = value;
                        });
                        
                        // Update chart
                        if (AppState.charts.sensorDetail) {
                            AppState.charts.sensorDetail.data.datasets[0].data = 
                                sensor.history.map(h => ({ x: h.timestamp, y: h.value }));
                            AppState.charts.sensorDetail.update('none');
                        }
                    }
                }
                break;
        }
    },

    updateCharts() {
        try {
            // Update sensor trends chart
            if (AppState.charts.sensorTrends) {
                const datasets = IoTData.sensors.slice(0, 3).map((sensor, index) => {
                    const colors = ['#1FB8CD', '#FFC185', '#B4413C'];
                    return {
                        label: sensor.name,
                        data: sensor.history.map(h => ({ x: h.timestamp, y: h.value })),
                        borderColor: colors[index],
                        backgroundColor: colors[index] + '20',
                        tension: 0.4,
                        fill: false,
                        pointRadius: 2
                    };
                });
                
                AppState.charts.sensorTrends.data.datasets = datasets;
                AppState.charts.sensorTrends.update('none');
            }

            // Update power chart
            if (AppState.charts.power) {
                const powerSensor = IoTData.sensors.find(s => s.type === 'power');
                if (powerSensor) {
                    AppState.charts.power.data.labels = powerSensor.history.map(h => {
                        const date = new Date(h.timestamp);
                        return date.getHours().toString().padStart(2, '0') + ':00';
                    });
                    AppState.charts.power.data.datasets[0].data = powerSensor.history.map(h => h.value);
                    AppState.charts.power.update('none');
                }
            }
        } catch (error) {
            console.error('Error updating charts:', error);
        }
    }
};

// Modal Management
const Modal = {
    init() {
        const modalClose = document.getElementById('modal-close');
        const modalCancel = document.getElementById('modal-cancel');
        const acknowledgeAlert = document.getElementById('acknowledge-alert');

        if (modalClose) modalClose.addEventListener('click', Alerts.closeModal);
        if (modalCancel) modalCancel.addEventListener('click', Alerts.closeModal);
        if (acknowledgeAlert) acknowledgeAlert.addEventListener('click', Alerts.acknowledgeAlert);

        // Close modal when clicking overlay
        const modal = document.getElementById('alert-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target.classList.contains('modal-overlay')) {
                    Alerts.closeModal();
                }
            });
        }

        // ESC key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                Alerts.closeModal();
            }
        });
    }
};

// Application Initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('IoT Dashboard starting initialization...');
    
    try {
        // Initialize data
        Utils.generateSensorHistory();
        console.log('Sensor history generated');
        
        // Initialize modules
        Theme.init();
        Auth.init();
        Navigation.init();
        Modal.init();
        
        console.log('IoT Dashboard initialized successfully');
    } catch (error) {
        console.error('Error during initialization:', error);
    }
});