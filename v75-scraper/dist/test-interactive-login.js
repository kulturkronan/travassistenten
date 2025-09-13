import { interactiveLoginSession } from "./interactive-login.js";
async function testInteractiveLogin() {
    try {
        console.log("🎯 Startar interaktiv inloggningssession...");
        console.log("📋 Instruktioner:");
        console.log("   1. En browser kommer att öppnas");
        console.log("   2. Logga in med jesSjo680 / Jeppe1599");
        console.log("   3. Jag kommer att spåra processen automatiskt");
        console.log("   4. Browser stängs efter 30 sekunder");
        console.log("");
        const result = await interactiveLoginSession();
        console.log("\n📊 RESULTAT:");
        console.log(`✅ Framgång: ${result.success ? "Ja" : "Nej"}`);
        console.log(`🍪 Cookies: ${result.cookies.length > 0 ? "Ja" : "Nej"}`);
        console.log(`📝 Antal steg: ${result.steps.length}`);
        if (result.error) {
            console.log(`❌ Fel: ${result.error}`);
        }
        console.log("\n📋 Alla steg som utfördes:");
        result.steps.forEach((step, index) => {
            console.log(`   ${index + 1}. ${step}`);
        });
    }
    catch (error) {
        console.error("💥 Fel vid interaktiv inloggning:", error);
    }
}
testInteractiveLogin();
//# sourceMappingURL=test-interactive-login.js.map