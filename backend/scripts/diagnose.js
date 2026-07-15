const BACKEND_URL = process.env.BACKEND_URL || 'https://sispnaist-1-0.onrender.com';

async function testEndpoint(name, url) {
  const start = Date.now();
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    const text = await res.text();
    const elapsed = Date.now() - start;
    let data;
    try { data = JSON.parse(text); } catch { data = text; }
    console.log(`[${elapsed}ms] ${name}: ${res.status} ${JSON.stringify(data).slice(0, 200)}`);
    return { name, status: res.status, ok: res.status < 500, elapsed };
  } catch (err) {
    console.log(`[FAIL] ${name}: ${err.message.slice(0, 150)}`);
    return { name, status: 0, ok: false, error: err.message };
  }
}

async function main() {
  console.log(`\n=== Diagnóstico de Integrações SISPNAIST ===`);
  console.log(`Backend: ${BACKEND_URL}\n`);

  const results = await Promise.all([
    testEndpoint('Health', `${BACKEND_URL}/health`),
    testEndpoint('API Health', `${BACKEND_URL}/api/health`),
    testEndpoint('CADSUS', `${BACKEND_URL}/api/integracao/cadsus/12345678901`),
    testEndpoint('CNES', `${BACKEND_URL}/api/integracao/cnes/2001586`),
    testEndpoint('e-Social', `${BACKEND_URL}/api/integracao/esocial/12345678901`),
    testEndpoint('SIH', `${BACKEND_URL}/api/integracao/sih/701234567890123`),
  ]);

  console.log(`\n=== Resumo ===`);
  for (const r of results) {
    const icon = r.ok ? '✓' : '✗';
    console.log(`  ${icon} ${r.name}: ${r.status || 'ERRO'}`);
  }
}

main();
