// Water quality parameters and their safe ranges
const parameters = {
    // Physical
    color: { min: 0, max: 15, current: 5, unit: 'TCU', safe: (val) => val <= 15 },
    turbidity: { min: 0, max: 5, current: 0.4, unit: 'NTU', safe: (val) => val <= 5 },
    temperature: { min: 20, max: 35, current: 25.5, unit: '°C', safe: (val) => Math.abs(val - 25) <= 3 },
    
    // Chemical
    organic: { min: 0, max: 10, current: 1.2, unit: 'mg/L', safe: (val) => val <= 10 },
    hardness: { min: 0, max: 500, current: 5.3, unit: 'mg/L', safe: (val) => val <= 500 },
    sulfate: { min: 0, max: 250, current: 1.4, unit: 'mg/L', safe: (val) => val <= 250 },
    nitrite: { min: 0, max: 3, current: 0.05, unit: 'mg/L', safe: (val) => val <= 3 },
    chloride: { min: 0, max: 250, current: 2.8, unit: 'mg/L', safe: (val) => val <= 250 },
    nitrate: { min: 0, max: 50, current: 2.9, unit: 'mg/L', safe: (val) => val <= 50 },
    cyanide: { min: 0, max: 0.07, current: 0.01, unit: 'mg/L', safe: (val) => val <= 0.07 },
    fluoride: { min: 0, max: 1.5, current: 0.1, unit: 'mg/L', safe: (val) => val <= 1.5 },
    ammonia: { min: 0, max: 1.5, current: 0.11, unit: 'mg/L', safe: (val) => val <= 1.5 },
    aluminum: { min: 0, max: 0.2, current: 0.02, unit: 'mg/L', safe: (val) => val <= 0.2 },
    copper: { min: 0, max: 2, current: 0.004, unit: 'mg/L', safe: (val) => val <= 2 },
    iron: { min: 0, max: 0.3, current: 0.015, unit: 'mg/L', safe: (val) => val <= 0.3 },
    manganese: { min: 0, max: 0.4, current: 0.017, unit: 'mg/L', safe: (val) => val <= 0.4 },
    zinc: { min: 0, max: 3, current: 0.02, unit: 'mg/L', safe: (val) => val <= 3 },
    
    // Microbiological
    coliform: { min: 0, max: 100, current: 0, unit: '/100mL', safe: (val) => val === 0 },
    ecoli: { min: 0, max: 50, current: 0, unit: '/100mL', safe: (val) => val === 0 }
};

// Main sensor values
let phValue = 7.0;
let tdsValue = 50;
let uvEnabled = true;

// DOM elements (may be absent in some pages or during early execution)
const phDisplay = document.getElementById('phValue');
const tdsDisplay = document.getElementById('tdsValue');
const statusIndicator = document.getElementById('statusIndicator');
const uvToggle = document.getElementById('uvToggle');
const uvStatus = document.getElementById('uvStatus');
const hamburger = document.getElementById('hamburger');
const parametersPanel = document.getElementById('parametersPanel');
const closePanel = document.getElementById('closePanel');
const overlay = document.getElementById('overlay');

// Utility: safely set textContent and className when element exists
function safeSet(el, { text, className }) {
    if (!el) return;
    if (typeof text !== 'undefined') el.textContent = text;
    if (typeof className !== 'undefined') el.className = className;
}

// AI ML Water Quality Assessment
function assessWaterQuality() {
    const isPhSafe = phValue >= 6.7 && phValue <= 7.8;
    const isTdsSafe = tdsValue < 100;
    
    // Add specific check for microbiological parameters
    const isMicrobiologicalSafe = uvEnabled || 
        (parameters.coliform.safe(parameters.coliform.current) && 
         parameters.ecoli.safe(parameters.ecoli.current));
    
    // Critical chemical parameters
    const criticalParams = ['cyanide', 'fluoride'];
    let criticalSafe = true;
    
    criticalParams.forEach(param => {
        if (!parameters[param].safe(parameters[param].current)) {
            criticalSafe = false;
        }
    });
    
    // AI decision logic with weighted scoring
    let totalScore = 0;
    let maxScore = 0;
    
    // pH scoring (weight: 15%)
    const phWeight = 0.15;
    const phScore = isPhSafe ? 1 : Math.max(0, 1 - Math.abs(phValue - 7.25) / 2);
    totalScore += phScore * phWeight;
    maxScore += phWeight;
    
    // TDS scoring (weight: 15%)
    const tdsWeight = 0.15;
    const tdsScore = isTdsSafe ? 1 : Math.max(0, 1 - (tdsValue - 100) / 400);
    totalScore += tdsScore * tdsWeight;
    maxScore += tdsWeight;
    
    // Microbiological scoring (weight: 40%)
    const microWeight = 0.40;
    const microScore = isMicrobiologicalSafe ? 1 : 0;
    totalScore += microScore * microWeight;
    maxScore += microWeight;
    
    // Other parameters scoring (weight: 30%)
    const otherWeight = 0.30;
    let otherScore = 0;
    let paramCount = 0;
    
    Object.keys(parameters).forEach(param => {
        if (param !== 'ph' && param !== 'tds' && param !== 'coliform' && param !== 'ecoli') {
            const isSafe = parameters[param].safe(parameters[param].current);
            otherScore += isSafe ? 1 : 0.3;
            paramCount++;
        }
    });
    
    if (paramCount > 0) {
        otherScore = (otherScore / paramCount) * otherWeight;
        totalScore += otherScore;
        maxScore += otherWeight;
    }
    
    const overallScore = totalScore / maxScore;
    const overallSafe = overallScore > 0.75 && isPhSafe && isTdsSafe && criticalSafe && isMicrobiologicalSafe;
    
    if (overallSafe) {
        safeSet(statusIndicator, { text: 'Drinking Water Safe', className: 'status-indicator status-safe' });
    } else {
        let warningMessage = 'Drinking Water Poor (';
        if (!isMicrobiologicalSafe) {
            warningMessage += 'Enable UV, ';
        }
        warningMessage += 'Check Filter)';
        safeSet(statusIndicator, { text: warningMessage, className: 'status-indicator status-danger' });
    }
    
    // Update confidence score for display
    window.lastQualityScore = Math.round(overallScore * 100);
}

// Generate random sensor values with realistic patterns
function generateRandomValues() {
    // pH range: 6.3 to 8.2 with tendency toward normal range
    const phCenter = Math.random() > 0.7 ? 7.1 : 6.3 + Math.random() * (8.2 - 6.3);
    phValue = Math.max(6.3, Math.min(8.2, phCenter + (Math.random() - 0.5) * 0.3));
    
    // TDS range: 1 to 250 with occasional spikes
    const tdsSpike = Math.random() > 0.9;
    if (tdsSpike) {
        tdsValue = Math.floor(Math.random() * 200) + 100; // 100-300 for spikes
    } else {
        tdsValue = Math.floor(Math.random() * 80) + 1; // 1-80 for normal
    }
    
    // Update all 23 parameters with random values
    updateAllParameters();
    
    // Update displays
    updateDisplay();
}

// Update all 23 parameters with random values
function updateAllParameters() {
    // Physical parameters
    parameters.color.current = Math.floor(Math.random() * 25) + 1;
    parameters.turbidity.current = Math.random() * 8;
    parameters.temperature.current = Math.random() * (35 - 20) + 20;
    
    // Chemical parameters
    parameters.organic.current = Math.random() * 15;
    parameters.hardness.current = Math.random() * 600;
    parameters.sulfate.current = Math.random() * 300;
    parameters.nitrite.current = Math.random() * 5;
    parameters.chloride.current = Math.random() * 300;
    parameters.nitrate.current = Math.random() * 70;
    parameters.cyanide.current = Math.random() * 0.1;
    parameters.fluoride.current = Math.random() * 2;
    parameters.ammonia.current = Math.random() * 2;
    parameters.aluminum.current = Math.random() * 0.3;
    parameters.copper.current = Math.random() * 3;
    parameters.iron.current = Math.random() * 0.5;
    parameters.manganese.current = Math.random() * 0.6;
    parameters.zinc.current = Math.random() * 4;
    
    // Update parameter display
    updateParameterPanel();
    // Separately update microbiological parameters
    updateMicrobiologicalParameters();
}

// Modify the updateMicrobiologicalParameters function
function updateMicrobiologicalParameters() {
    if (uvEnabled) {
        // When UV is ON - always safe values
        parameters.coliform.current = 0;
        parameters.ecoli.current = 0;
    } else {
        // When UV is OFF - random unsafe values
        parameters.coliform.current = Math.floor(Math.random() * 47) + 3; // Random between 3-50
        parameters.ecoli.current = Math.floor(Math.random() * 47) + 3; // Random between 3-50
    }
    
    // Update display for microbiological parameters (safe)
    safeSet(document.getElementById('param-coliform'), {
        text: String(parameters.coliform.current),
        className: 'parameter-value ' + (parameters.coliform.safe(parameters.coliform.current) ? 'value-safe' : 'value-danger')
    });

    safeSet(document.getElementById('param-ecoli'), {
        text: String(parameters.ecoli.current),
        className: 'parameter-value ' + (parameters.ecoli.safe(parameters.ecoli.current) ? 'value-safe' : 'value-danger')
    });
}

// Update parameter panel display
function updateParameterPanel() {
    // Physical parameters
    safeSet(document.getElementById('param-color'), {
        text: parameters.color.current.toFixed(0),
        className: 'parameter-value ' + (parameters.color.safe(parameters.color.current) ? 'value-safe' : 'value-danger')
    });
        
    // Static qualitative parameters
    safeSet(document.getElementById('param-odor'), { text: 'Odorless', className: 'parameter-value value-safe' });
    safeSet(document.getElementById('param-taste'), { text: 'Tasteless', className: 'parameter-value value-safe' });
        
    safeSet(document.getElementById('param-turbidity'), {
        text: parameters.turbidity.current.toFixed(1),
        className: 'parameter-value ' + (parameters.turbidity.safe(parameters.turbidity.current) ? 'value-safe' : 'value-danger')
    });
        
    safeSet(document.getElementById('param-temperature'), {
        text: parameters.temperature.current.toFixed(1),
        className: 'parameter-value ' + (parameters.temperature.safe(parameters.temperature.current) ? 'value-safe' : 'value-danger')
    });
        
    safeSet(document.getElementById('param-tds'), {
        text: String(tdsValue),
        className: 'parameter-value ' + (tdsValue < 100 ? 'value-safe' : 'value-danger')
    });
    
    // Chemical parameters
    safeSet(document.getElementById('param-organic'), {
        text: parameters.organic.current.toFixed(1),
        className: 'parameter-value ' + (parameters.organic.safe(parameters.organic.current) ? 'value-safe' : 'value-danger')
    });
        
    safeSet(document.getElementById('param-ph'), {
        text: phValue.toFixed(1),
        className: 'parameter-value ' + (phValue >= 6.5 && phValue <= 8.5 ? 'value-safe' : 'value-danger')
    });
        
    safeSet(document.getElementById('param-hardness'), {
        text: parameters.hardness.current.toFixed(1),
        className: 'parameter-value ' + (parameters.hardness.safe(parameters.hardness.current) ? 'value-safe' : 'value-danger')
    });
        
    safeSet(document.getElementById('param-sulfate'), {
        text: parameters.sulfate.current.toFixed(1),
        className: 'parameter-value ' + (parameters.sulfate.safe(parameters.sulfate.current) ? 'value-safe' : 'value-danger')
    });
        
    safeSet(document.getElementById('param-nitrite'), {
        text: parameters.nitrite.current.toFixed(2),
        className: 'parameter-value ' + (parameters.nitrite.safe(parameters.nitrite.current) ? 'value-safe' : 'value-danger')
    });
        
    safeSet(document.getElementById('param-chloride'), {
        text: parameters.chloride.current.toFixed(1),
        className: 'parameter-value ' + (parameters.chloride.safe(parameters.chloride.current) ? 'value-safe' : 'value-danger')
    });
        
    safeSet(document.getElementById('param-nitrate'), {
        text: parameters.nitrate.current.toFixed(1),
        className: 'parameter-value ' + (parameters.nitrate.safe(parameters.nitrate.current) ? 'value-safe' : 'value-danger')
    });
        
    safeSet(document.getElementById('param-cyanide'), {
        text: parameters.cyanide.current.toFixed(3),
        className: 'parameter-value ' + (parameters.cyanide.safe(parameters.cyanide.current) ? 'value-safe' : 'value-danger')
    });
        
    safeSet(document.getElementById('param-fluoride'), {
        text: parameters.fluoride.current.toFixed(2),
        className: 'parameter-value ' + (parameters.fluoride.safe(parameters.fluoride.current) ? 'value-safe' : 'value-danger')
    });
        
    safeSet(document.getElementById('param-ammonia'), {
        text: parameters.ammonia.current.toFixed(2),
        className: 'parameter-value ' + (parameters.ammonia.safe(parameters.ammonia.current) ? 'value-safe' : 'value-danger')
    });
        
    safeSet(document.getElementById('param-aluminum'), {
        text: parameters.aluminum.current.toFixed(3),
        className: 'parameter-value ' + (parameters.aluminum.safe(parameters.aluminum.current) ? 'value-safe' : 'value-danger')
    });
        
    safeSet(document.getElementById('param-copper'), {
        text: parameters.copper.current.toFixed(3),
        className: 'parameter-value ' + (parameters.copper.safe(parameters.copper.current) ? 'value-safe' : 'value-danger')
    });
        
    safeSet(document.getElementById('param-iron'), {
        text: parameters.iron.current.toFixed(3),
        className: 'parameter-value ' + (parameters.iron.safe(parameters.iron.current) ? 'value-safe' : 'value-danger')
    });
        
    safeSet(document.getElementById('param-manganese'), {
        text: parameters.manganese.current.toFixed(3),
        className: 'parameter-value ' + (parameters.manganese.safe(parameters.manganese.current) ? 'value-safe' : 'value-danger')
    });
        
    safeSet(document.getElementById('param-zinc'), {
        text: parameters.zinc.current.toFixed(2),
        className: 'parameter-value ' + (parameters.zinc.safe(parameters.zinc.current) ? 'value-safe' : 'value-danger')
    });
    
    // Microbiological parameters (already handled in updateMicrobiologicalParameters)
    safeSet(document.getElementById('param-coliform'), {
        text: String(parameters.coliform.current),
        className: 'parameter-value ' + (parameters.coliform.safe(parameters.coliform.current) ? 'value-safe' : 'value-danger')
    });
    safeSet(document.getElementById('param-ecoli'), {
        text: String(parameters.ecoli.current),
        className: 'parameter-value ' + (parameters.ecoli.safe(parameters.ecoli.current) ? 'value-safe' : 'value-danger')
    });
}

// Update main display (safe)
function updateDisplay() {
    if (phDisplay) phDisplay.classList.add('updating');
    if (tdsDisplay) tdsDisplay.classList.add('updating');

    if (phDisplay) phDisplay.textContent = phValue.toFixed(1);
    if (tdsDisplay) tdsDisplay.textContent = tdsValue;

    setTimeout(() => {
        if (phDisplay) phDisplay.classList.remove('updating');
        if (tdsDisplay) tdsDisplay.classList.remove('updating');
    }, 500);

    // Check water quality with AI assessment
    assessWaterQuality();
}

// Hamburger menu functionality (safe attach)
if (hamburger) {
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        if (parametersPanel) parametersPanel.classList.toggle('active');
        if (overlay) overlay.classList.toggle('active');
    });
}

// Close panel functionality (safe attach)
if (closePanel) {
    closePanel.addEventListener('click', function() {
        if (hamburger) hamburger.classList.remove('active');
        if (parametersPanel) parametersPanel.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
    });
}

// Overlay click to close (safe attach)
if (overlay) {
    overlay.addEventListener('click', function() {
        if (hamburger) hamburger.classList.remove('active');
        if (parametersPanel) parametersPanel.classList.remove('active');
        overlay.classList.remove('active');
    });
}

// Toggle UV sterilizer (safe attach)
if (uvToggle) {
    uvToggle.addEventListener('click', function() {
        uvEnabled = !uvEnabled;

        if (uvEnabled) {
            uvToggle.classList.add('active');
            safeSet(uvStatus, { text: 'UV Sterilizer: ON', className: 'uv-status uv-on' });
        } else {
            uvToggle.classList.remove('active');
            safeSet(uvStatus, { text: 'UV Sterilizer: OFF', className: 'uv-status uv-off' });
        }

        // Update microbiological parameters immediately when UV state changes
        updateMicrobiologicalParameters();

        // Log UV status change
        console.log('UV Sterilizer:', uvEnabled ? 'ON' : 'OFF');
    });
}

// Start automatic sensor reading simulation
function startSensorSimulation() {
    generateRandomValues();
    setInterval(generateRandomValues, 1000);
}

// API Integration Functions (for future backend connection)
async function sendDataToBackend(sensorData) {
    try {
        const response = await fetch('/api/sensor/data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...sensorData,
                uvStatus: uvEnabled,
                timestamp: new Date().toISOString(),
                deviceId: 'watercoin-device-001',
                location: 'Jakarta Pusat'
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('Data sent to backend:', result);
            return result;
        } else {
            console.error('Backend error:', response.statusText);
        }
    } catch (error) {
        console.error('Network error:', error);
    }
}

async function getMLPrediction(sensorData) {
    try {
        const response = await fetch('/api/ml/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(sensorData)
        });
        
        if (response.ok) {
            const prediction = await response.json();
            console.log('ML Prediction:', prediction);
            return prediction;
        } else {
            console.error('ML prediction error:', response.statusText);
        }
    } catch (error) {
        console.error('ML prediction network error:', error);
    }
}

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Watercoin AI Monitor Initialized');
    console.log('📊 Starting real-time sensor simulation...');
    
    updateDisplay();
    updateParameterPanel();
    startSensorSimulation();
    
    // Set up periodic backend sync (uncomment when backend is ready)
    /*
    setInterval(async () => {
        const currentData = {
            ph: phValue,
            tds: tdsValue,
            color: parameters.color.current,
            turbidity: parameters.turbidity.current,
            temperature: parameters.temperature.current,
            organic: parameters.organic.current,
            hardness: parameters.hardness.current,
            sulfate: parameters.sulfate.current,
            nitrite: parameters.nitrite.current,
            chloride: parameters.chloride.current,
            nitrate: parameters.nitrate.current,
            cyanide: parameters.cyanide.current,
            fluoride: parameters.fluoride.current,
            ammonia: parameters.ammonia.current,
            aluminum: parameters.aluminum.current,
            copper: parameters.copper.current,
            iron: parameters.iron.current,
            manganese: parameters.manganese.current,
            zinc: parameters.zinc.current,
            coliform: parameters.coliform.current,
            ecoli: parameters.ecoli.current
        };
        
        await sendDataToBackend(currentData);
    }, 1000); // Send data every 1 second
    */
    
    console.log('✅ Initialization complete');
});

// Error handling
window.addEventListener('error', function(event) {
    console.error('Application error:', event.error);
});

// Service worker registration for PWA capabilities (future enhancement)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // Uncomment when service worker is implemented
        /*
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('SW registered: ', registration);
            })
            .catch(function(registrationError) {
                console.log('SW registration failed: ', registrationError);
            });
        */
    });
}