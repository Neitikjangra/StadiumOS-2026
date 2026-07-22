// Test routing API endpoints
async function test() {
  const base = 'http://localhost:3000';
  
  // Test graph
  console.log('=== Testing /api/routing/graph ===');
  try {
    const r1 = await fetch(base + '/api/routing/graph');
    console.log('Status:', r1.status);
    const d1 = await r1.json();
    console.log('Nodes:', d1.nodes?.length, 'Edges:', d1.edges?.length);
  } catch(e) { console.log('Error:', e.message); }

  // Test recommend
  console.log('\n=== Testing /api/routing/recommend ===');
  try {
    const r2 = await fetch(base + '/api/routing/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: 'sec-101', destinationType: 'gate', count: 3 }),
    });
    console.log('Status:', r2.status);
    const d2 = await r2.json();
    console.log('Recommendations:', d2.recommendations?.length);
    if (d2.error) console.log('Error:', d2.error);
  } catch(e) { console.log('Error:', e.message); }

  // Test alternate gates
  console.log('\n=== Testing /api/routing/alternate-gates ===');
  try {
    const r3 = await fetch(base + '/api/routing/alternate-gates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentGate: 'gate-D', zone: 'west', reason: 'congestion', count: 3 }),
    });
    console.log('Status:', r3.status);
    const d3 = await r3.json();
    console.log('Alternates:', d3.alternates?.length);
    if (d3.error) console.log('Error:', d3.error);
  } catch(e) { console.log('Error:', e.message); }

  // Test staged exit
  console.log('\n=== Testing /api/routing/staged-exit ===');
  try {
    const r4 = await fetch(base + '/api/routing/staged-exit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section: 'sec-101', exitStrategy: 'full_time', count: 4 }),
    });
    console.log('Status:', r4.status);
    const d4 = await r4.json();
    console.log('Stages:', d4.recommendations?.length);
    if (d4.error) console.log('Error:', d4.error);
  } catch(e) { console.log('Error:', e.message); }

  // Test zone pressure
  console.log('\n=== Testing /api/routing/zone-pressure ===');
  try {
    const r5 = await fetch(base + '/api/routing/zone-pressure', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    });
    console.log('Status:', r5.status);
    const d5 = await r5.json();
    console.log('Zones:', d5.zones?.length);
    if (d5.error) console.log('Error:', d5.error);
  } catch(e) { console.log('Error:', e.message); }

  // Test simulate
  console.log('\n=== Testing /api/routing/simulate ===');
  try {
    const r6 = await fetch(base + '/api/routing/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ closures: ['gate-D'] }),
    });
    console.log('Status:', r6.status);
    const d6 = await r6.json();
    console.log('Result:', d6.result?.riskLevel);
    if (d6.error) console.log('Error:', d6.error);
  } catch(e) { console.log('Error:', e.message); }
}

test();
