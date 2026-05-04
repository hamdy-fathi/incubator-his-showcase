/**
 * Smart Neonatal Incubator - Device Simulator
 * 
 * Sends simulated temperature and humidity readings to the backend API
 * every 2 seconds. Supports manual triggering of abnormal values.
 * 
 * Controls:
 *   h - Trigger HIGH temperature (38.5°C)
 *   l - Trigger LOW temperature (35.2°C)  
 *   n - Return to NORMAL range
 *   q - Quit simulator
 */

const { readFileSync } = require('fs');
const { resolve } = require('path');
const readline = require('readline');

// Load .env manually (no dotenv dependency needed)
try {
  const envPath = resolve(__dirname, '.env');
  const envContent = readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  });
} catch (e) {
  // Use defaults if .env not found
}

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';
const API_KEY = process.env.API_KEY || 'incubator-secure-key-2024';
const INTERVAL_MS = parseInt(process.env.INTERVAL_MS || '2000', 10);

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
};

// Simulator state
let mode = 'normal'; // 'normal' | 'high' | 'low'
let running = true;

/**
 * Generate a reading based on current mode
 */
function generateReading() {
  let temperature, humidity;

  switch (mode) {
    case 'high':
      temperature = 38.2 + Math.random() * 1.2; // 38.2 - 39.4
      humidity = 60 + Math.random() * 15;        // 60 - 75
      break;
    case 'low':
      temperature = 35.0 + Math.random() * 0.8;  // 35.0 - 35.8
      humidity = 42 + Math.random() * 10;         // 42 - 52
      break;
    default: // normal
      temperature = 36.5 + Math.random() * 1.0;  // 36.5 - 37.5
      humidity = 55 + Math.random() * 10;         // 55 - 65
  }

  return {
    temperature: parseFloat(temperature.toFixed(1)),
    humidity: Math.round(humidity),
  };
}

/**
 * Get status color based on temperature
 */
function getStatusInfo(temp) {
  if (temp > 38.5 || temp < 35.5) {
    return { color: colors.red, bg: colors.bgRed, label: 'CRITICAL', emoji: '🔴' };
  }
  if (temp > 38 || temp < 36) {
    return { color: colors.yellow, bg: colors.bgYellow, label: 'WARNING', emoji: '🟡' };
  }
  return { color: colors.green, bg: colors.bgGreen, label: 'NORMAL', emoji: '🟢' };
}

/**
 * Send reading to backend API
 */
async function sendReading() {
  const reading = generateReading();
  const status = getStatusInfo(reading.temperature);
  const timestamp = new Date().toLocaleTimeString();

  try {
    const response = await fetch(`${BACKEND_URL}/api/incubator`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify(reading),
    });

    if (response.ok) {
      console.log(
        `${colors.dim}[${timestamp}]${colors.reset} ` +
        `${status.emoji} ${status.color}${status.label}${colors.reset} ` +
        `| Temp: ${status.color}${colors.bold}${reading.temperature}°C${colors.reset} ` +
        `| Humidity: ${colors.cyan}${reading.humidity}%${colors.reset} ` +
        `| Mode: ${colors.blue}${mode.toUpperCase()}${colors.reset}`
      );
    } else {
      const errorBody = await response.text();
      console.log(
        `${colors.red}✗ [${timestamp}] Failed (${response.status}): ${errorBody}${colors.reset}`
      );
    }
  } catch (error) {
    console.log(
      `${colors.red}✗ [${timestamp}] Connection error: ${error.message}${colors.reset}`
    );
  }
}

/**
 * Display startup banner
 */
function showBanner() {
  console.clear();
  console.log(`
${colors.cyan}╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   ${colors.bold}🏥  Smart Neonatal Incubator Simulator${colors.reset}${colors.cyan}                    ║
║                                                              ║
║   Sending data to: ${colors.green}${BACKEND_URL}${colors.cyan}               ║
║   Interval: ${colors.green}${INTERVAL_MS}ms${colors.cyan}                                         ║
║                                                              ║
║   ${colors.yellow}Controls:${colors.cyan}                                                ║
║     ${colors.bold}h${colors.reset}${colors.cyan} → High temperature (alarm)                          ║
║     ${colors.bold}l${colors.reset}${colors.cyan} → Low temperature (alarm)                           ║
║     ${colors.bold}n${colors.reset}${colors.cyan} → Normal temperature                                ║
║     ${colors.bold}q${colors.reset}${colors.cyan} → Quit simulator                                    ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝${colors.reset}
`);
}

/**
 * Setup keyboard input
 */
function setupKeyboard() {
  readline.emitKeypressEvents(process.stdin);
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
  }

  process.stdin.on('keypress', (str, key) => {
    if (key.ctrl && key.name === 'c') {
      running = false;
      console.log(`\n${colors.yellow}Shutting down simulator...${colors.reset}`);
      process.exit(0);
    }

    switch (str) {
      case 'h':
        mode = 'high';
        console.log(`\n${colors.bgRed}${colors.bold} ⚠ MODE: HIGH TEMPERATURE ${colors.reset}\n`);
        break;
      case 'l':
        mode = 'low';
        console.log(`\n${colors.bgYellow}${colors.bold} ⚠ MODE: LOW TEMPERATURE ${colors.reset}\n`);
        break;
      case 'n':
        mode = 'normal';
        console.log(`\n${colors.bgGreen}${colors.bold} ✓ MODE: NORMAL ${colors.reset}\n`);
        break;
      case 'q':
        running = false;
        console.log(`\n${colors.yellow}Shutting down simulator...${colors.reset}`);
        process.exit(0);
    }
  });
}

/**
 * Main loop
 */
async function main() {
  showBanner();
  setupKeyboard();

  console.log(`${colors.green}▶ Simulator started. Sending readings...${colors.reset}\n`);

  while (running) {
    await sendReading();
    await new Promise(resolve => setTimeout(resolve, INTERVAL_MS));
  }
}

main().catch(console.error);
