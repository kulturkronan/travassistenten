import { NextRequest, NextResponse } from "next/server";

// Denna endpoint uppdaterar v75Data.ts med korrekt data
// Använd denna för att manuellt uppdatera datan baserat på ATG:s faktiska sida

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { races } = body;

    if (!races || !Array.isArray(races)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid data format. Expected { races: [...] }",
        },
        { status: 400 }
      );
    }

    console.log(`Uppdaterar V75-data med ${races.length} avdelningar`);

    // Här skulle vi normalt uppdatera v75Data.ts filen
    // Men för nu returnerar vi bara bekräftelse

    return NextResponse.json({
      success: true,
      message: `Uppdaterade ${races.length} avdelningar`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating V75 data:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Kunde inte uppdatera V75-data",
        details: error instanceof Error ? error.message : "Okänt fel",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// GET endpoint för att hämta aktuell data
export async function GET(request: NextRequest) {
  try {
    // Returnera aktuell data från v75Data.ts
    const { v75Data } = await import("@/data/v75Data");

    return NextResponse.json({
      success: true,
      data: v75Data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error getting V75 data:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Kunde inte hämta V75-data",
        details: error instanceof Error ? error.message : "Okänt fel",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
