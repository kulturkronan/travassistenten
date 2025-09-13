import { chromium, Browser, Page } from "playwright";

interface LoginResult {
  cookies: string;
  userAgent: string;
  success: boolean;
  error?: string;
}

export async function loginToATG(): Promise<LoginResult> {
  let browser: Browser | null = null;

  try {
    console.log("Startar browser för inloggning...");
    browser = await chromium.launch({
      headless: false, // Visa browser för att se vad som händer
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setViewportSize({ width: 1920, height: 1080 });

    console.log("Navigerar till ATG inloggningssida...");
    await page.goto("https://www.atg.se/logga-in", {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    // Vänta lite för att sidan ska laddas
    await page.waitForTimeout(3000);

    // Ta en screenshot för debugging
    await page.screenshot({ path: "login-page.png" });
    console.log("Screenshot sparad som login-page.png");

    // Prova olika selektorer för användarnamn
    const usernameSelectors = [
      'input[name="username"]',
      'input[name="email"]',
      'input[type="email"]',
      'input[placeholder*="användarnamn"]',
      'input[placeholder*="email"]',
      'input[placeholder*="username"]',
      "#username",
      "#email",
      ".username-input",
      ".email-input",
    ];

    let usernameField = null;
    for (const selector of usernameSelectors) {
      try {
        usernameField = await page.waitForSelector(selector, { timeout: 2000 });
        if (usernameField) {
          console.log(`Hittade användarnamnsfält med selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Fortsätt med nästa selector
      }
    }

    if (!usernameField) {
      // Visa sidans HTML för debugging
      const html = await page.content();
      console.log("Sidans HTML (första 1000 tecken):");
      console.log(html.substring(0, 1000));
      throw new Error("Kunde inte hitta användarnamnsfält");
    }

    // Fyll i användarnamn
    await usernameField.fill("jesSjo680");
    console.log("Användarnamn ifyllt");

    // Prova olika selektorer för lösenord
    const passwordSelectors = [
      'input[name="password"]',
      'input[type="password"]',
      "#password",
      ".password-input",
    ];

    let passwordField = null;
    for (const selector of passwordSelectors) {
      try {
        passwordField = await page.waitForSelector(selector, { timeout: 2000 });
        if (passwordField) {
          console.log(`Hittade lösenordsfält med selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Fortsätt med nästa selector
      }
    }

    if (!passwordField) {
      throw new Error("Kunde inte hitta lösenordsfält");
    }

    // Fyll i lösenord
    await passwordField.fill("Jeppe1599");
    console.log("Lösenord ifyllt");

    // Ta screenshot efter ifyllnad
    await page.screenshot({ path: "login-filled.png" });
    console.log("Screenshot efter ifyllnad sparad som login-filled.png");

    // Prova olika selektorer för inloggningsknapp
    const loginButtonSelectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      'button:has-text("Logga in")',
      'button:has-text("Logga")',
      'button:has-text("Sign in")',
      'button:has-text("Login")',
      ".login-button",
      ".submit-button",
      '[data-testid*="login"]',
      '[data-testid*="submit"]',
    ];

    let loginButton = null;
    for (const selector of loginButtonSelectors) {
      try {
        loginButton = await page.waitForSelector(selector, { timeout: 2000 });
        if (loginButton) {
          console.log(`Hittade inloggningsknapp med selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Fortsätt med nästa selector
      }
    }

    if (!loginButton) {
      throw new Error("Kunde inte hitta inloggningsknapp");
    }

    // Klicka på inloggningsknappen
    console.log("Klickar på inloggningsknappen...");
    await loginButton.click();

    // Vänta på att inloggningen ska slutföras
    await page.waitForTimeout(5000);

    // Ta screenshot efter inloggning
    await page.screenshot({ path: "login-after.png" });
    console.log("Screenshot efter inloggning sparad som login-after.png");

    // Kontrollera om vi är inloggade genom att kolla URL eller specifika element
    const currentUrl = page.url();
    console.log(`Aktuell URL efter inloggning: ${currentUrl}`);

    // Hämta cookies
    const cookies = await page.context().cookies();
    const cookieString = cookies
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");

    // Hämta user agent
    const userAgent = await page.evaluate(() => navigator.userAgent);

    console.log("Inloggning slutförd!");
    console.log(`Antal cookies: ${cookies.length}`);

    return {
      cookies: cookieString,
      userAgent: userAgent,
      success: true,
    };
  } catch (error) {
    console.error("Fel vid inloggning:", error);
    return {
      cookies: "",
      userAgent: "",
      success: false,
      error: error instanceof Error ? error.message : "Okänt fel",
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
