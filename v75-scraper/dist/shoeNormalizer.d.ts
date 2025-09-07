import { ShoeCombination } from "./schemas.js";
/**
 * Normaliserar skor-text från ATG till standardiserad format
 * @param shoeText - Text från ATG som beskriver skor
 * @returns Normaliserad skor-kombination eller undefined
 */
export declare function normalizeShoe(shoeText: string | null | undefined): ShoeCombination | undefined;
/**
 * Extraherar skor-information från DOM-element
 * @param element - Playwright ElementHandle eller Locator
 * @returns Normaliserad skor-kombination eller undefined
 */
export declare function extractShoeFromElement(element: any): Promise<ShoeCombination | undefined>;
//# sourceMappingURL=shoeNormalizer.d.ts.map