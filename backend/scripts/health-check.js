const BACKEND_URL = process.env.BACKEND_URL || 'https://sispnaist-1-0.onrender.com';
const INTERVAL_MS = parseInt(process.env.INTERVAL_MS || '240000', 10);

async function checkHealth() {
  const start = Date.now();
  try {
    const res = await fetch(`${BACKEND_URL}/health`, { signal: AbortSignal.timeout(15000) });
    const data = await res.json();
    const elapsed = Date.now() - start;
    console.log(`[${new Date().toISOString()}] Health: ${res.status} (${elapsed}ms)`, data.status === 'OK' ? '✓' : '✗');
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Health: ERRO -`, err.message);
  }
}

console.log(`Monitorando ${BACKEND_URL}/health a cada ${INTERVAL_MS}ms`);
checkHealth();
setInterval(checkHealth, INTERVAL_MS);
