// test-new-endpoints.js
// Testa de nya API endpoints vi hittade

const BASE = "https://www.atg.se/services/racinginfo/v1/api";

async function testNewEndpoints() {
  try {
    console.log("🔍 Testar nya API endpoints...\n");
    
    const endpoints = [
      "/races/2025-09-06_7_5/comments",
      "/races/2025-09-06_7_5/tips-comments", 
      "/silks/2025-09-06_7_5",
      "/calendar/day/2025-09-06",
      "/games/V75_2025-09-06_7_5"
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`\n🔍 Testar: ${endpoint}`);
        
        const response = await fetch(`${BASE}${endpoint}`, {
          headers: { "accept": "application/json,text/plain,*/*" }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ Status: ${response.status}`);
          console.log(`📊 Data keys:`, Object.keys(data).slice(0, 10));
          
          // Visa första objektet om det finns
          if (Array.isArray(data) && data.length > 0) {
            console.log(`📋 Första objekt keys:`, Object.keys(data[0]).slice(0, 10));
            console.log(`📋 Första objekt preview:`, JSON.stringify(data[0], null, 2).slice(0, 500) + "...");
          } else if (typeof data === 'object' && data !== null) {
            console.log(`📋 Data preview:`, JSON.stringify(data, null, 2).slice(0, 500) + "...");
          }
        } else {
          console.log(`❌ Status: ${response.status} - ${response.statusText}`);
        }
      } catch (error) {
        console.log(`💥 Fel: ${error.message}`);
      }
    }
    
    console.log("\n🏁 Testning klar!");
    
  } catch (error) {
    console.log(`💥 Fel: ${error.message}`);
  }
}

testNewEndpoints();
