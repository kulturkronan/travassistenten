// explore-tips-comments.js
// Undersök tips-comments endpointet för att hitta speltips

const BASE = "https://www.atg.se/services/racinginfo/v1/api";

async function exploreTipsComments() {
  try {
    console.log("🎯 Undersöker tips-comments endpointet...\n");
    
    const response = await fetch(`${BASE}/races/2025-09-06_7_5/tips-comments`, {
      headers: { "accept": "application/json,text/plain,*/*" }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log("📊 Tips-comments struktur:");
      console.log("Keys:", Object.keys(data));
      
      if (data.comments && Array.isArray(data.comments)) {
        console.log(`\n💬 Kommentarer (${data.comments.length} st):`);
        data.comments.forEach((comment, index) => {
          console.log(`\n${index + 1}. Häst ${comment.startNumber}:`);
          console.log(`   Text: ${comment.text}`);
        });
      }
      
      if (data.tips && Array.isArray(data.tips)) {
        console.log(`\n🎯 Speltips (${data.tips.length} st):`);
        data.tips.forEach((tip, index) => {
          console.log(`\n${index + 1}. ${JSON.stringify(tip, null, 2)}`);
        });
      }
      
      // Visa hela strukturen
      console.log("\n🔍 Hela data-strukturen:");
      console.log(JSON.stringify(data, null, 2));
      
    } else {
      console.log(`❌ Fel: ${response.status} - ${response.statusText}`);
    }
    
  } catch (error) {
    console.log(`💥 Fel: ${error.message}`);
  }
}

exploreTipsComments();
