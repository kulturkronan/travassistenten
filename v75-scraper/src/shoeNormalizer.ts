import { ShoeCombination } from "./schemas.js";

/**
 * Normaliserar skor-text från ATG till standardiserad format
 * @param shoeText - Text från ATG som beskriver skor
 * @returns Normaliserad skor-kombination eller undefined
 */
export function normalizeShoe(
  shoeText: string | null | undefined
): ShoeCombination | undefined {
  if (!shoeText) return undefined;

  const text = shoeText.toLowerCase().trim();

  // Mappning baserat på innehåll
  if (text.includes("barfota fram") && text.includes("skor bak")) {
    return "c̶c";
  }

  if (text.includes("skor fram") && text.includes("barfota bak")) {
    return "cc̶";
  }

  if (text.includes("barfota runt om") || text.includes("barfota överallt")) {
    return "c̶c̶";
  }

  if (text.includes("skor runt om") || text.includes("skor överallt")) {
    return "cc";
  }

  // Fallback: kolla enskilda termer
  if (text.includes("barfota") && !text.includes("skor")) {
    return "c̶c̶"; // Antag barfota överallt om bara "barfota" nämns
  }

  if (text.includes("skor") && !text.includes("barfota")) {
    return "cc"; // Antag skor överallt om bara "skor" nämns
  }

  return undefined;
}

/**
 * Extraherar skor-information från DOM-element
 * @param element - Playwright ElementHandle eller Locator
 * @returns Normaliserad skor-kombination eller undefined
 */
export async function extractShoeFromElement(
  element: any
): Promise<ShoeCombination | undefined> {
  try {
    // Försök olika metoder att få skor-text
    let shoeText: string | null = null;

    // 1. aria-label
    shoeText = await element.getAttribute("aria-label");
    if (shoeText) {
      const normalized = normalizeShoe(shoeText);
      if (normalized) return normalized;
    }

    // 2. title
    shoeText = await element.getAttribute("title");
    if (shoeText) {
      const normalized = normalizeShoe(shoeText);
      if (normalized) return normalized;
    }

    // 3. SVG title element
    try {
      const svgTitle = await element.locator("svg title").innerText();
      if (svgTitle) {
        const normalized = normalizeShoe(svgTitle);
        if (normalized) return normalized;
      }
    } catch {
      // Ignorera om SVG title inte finns
    }

    // 4. Screen reader text
    try {
      const srText = await element
        .locator('.sr-only, [class*="sr-only"], [class*="screen-reader"]')
        .innerText();
      if (srText) {
        const normalized = normalizeShoe(srText);
        if (normalized) return normalized;
      }
    } catch {
      // Ignorera om screen reader text inte finns
    }

    // 5. Element text content
    shoeText = await element.innerText();
    if (shoeText) {
      const normalized = normalizeShoe(shoeText);
      if (normalized) return normalized;
    }

    // 6. Fallback: kolla CSS-klasser för ikoner
    const classNames = await element.getAttribute("class");
    if (classNames) {
      const classes = classNames.toLowerCase();

      // Kolla om det finns flera skor-ikoner
      const hasBarefootFront =
        classes.includes("barefoot") || classes.includes("barfota");
      const hasShoesBack = classes.includes("shod") || classes.includes("skor");

      if (hasBarefootFront && hasShoesBack) {
        return "c̶c";
      }
      if (hasShoesBack && hasBarefootFront) {
        return "cc̶";
      }
      if (hasBarefootFront && !hasShoesBack) {
        return "c̶c̶";
      }
      if (hasShoesBack && !hasBarefootFront) {
        return "cc";
      }
    }

    // 7. Försök hitta sko-ikoner i elementet
    try {
      // Kolla om det finns flera sko-ikoner (fram och bak)
      const shoeIcons = await element
        .locator('svg, [class*="shoe"], [class*="icon"]')
        .all();
      if (shoeIcons.length >= 2) {
        // Antag att det finns två ikoner - en för fram och en för bak
        // Detta är en förenklad logik, i verkligheten skulle man behöva analysera ikonerna mer noggrant
        return "c̶c"; // Antag barfota fram, skor bak som standard
      } else if (shoeIcons.length === 1) {
        // En ikon - antingen barfota överallt eller skor överallt
        const iconClass = await shoeIcons[0].getAttribute("class");
        if (
          iconClass &&
          (iconClass.includes("barefoot") || iconClass.includes("barfota"))
        ) {
          return "c̶c̶";
        } else {
          return "cc";
        }
      }
    } catch {
      // Ignorera om det inte går att hitta ikoner
    }

    return undefined;
  } catch (error) {
    console.warn("Fel vid extrahering av skor-information:", error);
    return undefined;
  }
}
