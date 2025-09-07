// explore-authenticated-api.js
// Undersök ATG API med autentisering för att hitta all tillgänglig data

const BASE = "https://www.atg.se/services/racinginfo/v1/api";

async function exploreAuthenticatedAPI() {
  try {
    console.log("🔐 Loggar in på ATG och undersöker autentiserad data...\n");

    // Först, låt oss testa att logga in
    const loginResponse = await fetch("https://www.atg.se/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json,text/plain,*/*",
      },
      body: JSON.stringify({
        username: "jesSjo680",
        password: "Jeppe1599",
      }),
    });

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log("✅ Inloggning lyckades!");
      console.log("Login data keys:", Object.keys(loginData));

      // Spara token om tillgänglig
      const token =
        loginData.token || loginData.accessToken || loginData.authToken;
      const headers = {
        accept: "application/json,text/plain,*/*",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
        console.log("🔑 Token hittades, använder för autentisering");
      }

      // Testa olika endpoints med autentisering
      const endpoints = [
        "/games/V75_2025-09-06_7_5",
        "/calendar/day/2025-09-06",
        "/tips",
        "/tips/2025-09-06",
        "/tips/V75_2025-09-06_7_5",
        "/betting/tips",
        "/analysis",
        "/experts",
        "/comments",
        "/horse/784953", // Anna K.J.
        "/horse/784953/starts",
        "/horse/784953/history",
        "/horse/784953/form",
        "/starts/horse/784953",
        "/results/horse/784953",
        "/races/horse/784953",
        "/tracks",
        "/tracks/7", // Jägersro
        "/drivers",
        "/drivers/566962", // Dwight Pieters
        "/trainers",
        "/trainers/566962",
      ];

      for (const endpoint of endpoints) {
        try {
          console.log(`\n🔍 Testar autentiserad: ${endpoint}`);

          const response = await fetch(`${BASE}${endpoint}`, { headers });

          if (response.ok) {
            const data = await response.json();
            console.log(`✅ Status: ${response.status}`);
            console.log(`📊 Data keys:`, Object.keys(data).slice(0, 10));

            // Visa första objektet om det finns
            if (Array.isArray(data) && data.length > 0) {
              console.log(
                `📋 Första objekt keys:`,
                Object.keys(data[0]).slice(0, 10)
              );
              console.log(
                `📋 Första objekt preview:`,
                JSON.stringify(data[0], null, 2).slice(0, 400) + "..."
              );
            } else if (typeof data === "object" && data !== null) {
              console.log(
                `📋 Data preview:`,
                JSON.stringify(data, null, 2).slice(0, 400) + "..."
              );
            }
          } else {
            console.log(
              `❌ Status: ${response.status} - ${response.statusText}`
            );
          }
        } catch (error) {
          console.log(`💥 Fel: ${error.message}`);
        }
      }
    } else {
      console.log(
        `❌ Inloggning misslyckades: ${loginResponse.status} - ${loginResponse.statusText}`
      );

      // Testa alternativa inloggningsendpoints
      const alternativeEndpoints = [
        "https://www.atg.se/api/login",
        "https://www.atg.se/auth/login",
        "https://www.atg.se/api/user/login",
        "https://www.atg.se/api/account/login",
      ];

      for (const loginUrl of alternativeEndpoints) {
        try {
          console.log(`\n🔍 Testar alternativ inloggning: ${loginUrl}`);

          const altResponse = await fetch(loginUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              accept: "application/json,text/plain,*/*",
            },
            body: JSON.stringify({
              username: "jesSjo680",
              password: "Jeppe1599",
            }),
          });

          if (altResponse.ok) {
            console.log(`✅ Alternativ inloggning lyckades: ${loginUrl}`);
            const altData = await altResponse.json();
            console.log("Alt login data keys:", Object.keys(altData));
            break;
          } else {
            console.log(
              `❌ Alt login: ${altResponse.status} - ${altResponse.statusText}`
            );
          }
        } catch (error) {
          console.log(`💥 Alt login fel: ${error.message}`);
        }
      }
    }

    console.log("\n🏁 Autentiserad utforskning klar!");
  } catch (error) {
    console.log(`💥 Fel: ${error.message}`);
  }
}

exploreAuthenticatedAPI();
