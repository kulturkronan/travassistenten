"use client";

import React, { useState, useEffect } from "react";

interface Horse {
  number: number;
  name: string;
  driver: string;
  trainer?: string;
  track: number;
  record: string;
  prizeMoney: number;
  v75Percent: number;
  trendPercent: number;
  vOdds: number;
  pOdds: number;
  shoes: string;
  wagon: string;
  scratched: boolean;
  tipComment?: string;
}

interface V75Race {
  raceNumber: number;
  title: string;
  distance: string;
  trackType: string;
  horses: Horse[];
}

interface ATGDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataExtracted: (races: V75Race[]) => void;
  baseUrl: string;
}

export default function ATGDataModal({
  isOpen,
  onClose,
  onDataExtracted,
  baseUrl,
}: ATGDataModalProps) {
  const [currentDivision, setCurrentDivision] = useState(1);
  const [extractedData, setExtractedData] = useState<V75Race[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionStatus, setExtractionStatus] = useState("");

  useEffect(() => {
    if (isOpen) {
      setCurrentDivision(1);
      setExtractedData([]);
      setExtractionStatus("");
    }
  }, [isOpen]);

  const handleExtractData = async () => {
    setIsExtracting(true);
    setExtractionStatus("Extraherar data från ATG:s webbplats...");

    try {
      // Anropa API:et som använder Playwright för att extrahera data
      const response = await fetch("/api/extract-atg-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          baseUrl: baseUrl,
          divisions: [1, 2, 3, 4, 5, 6, 7],
        }),
      });

      if (!response.ok) {
        throw new Error("Kunde inte extrahera data från ATG");
      }

      const result = await response.json();

      if (result.success && result.data) {
        setExtractedData(result.data);
        setExtractionStatus(
          `✅ Extraherade ${
            result.data.length
          } avdelningar med ${result.data.reduce(
            (total: number, race: V75Race) => total + race.horses.length,
            0
          )} hästar`
        );
      } else {
        throw new Error(result.error || "Okänt fel vid dataextraktion");
      }
    } catch (error) {
      console.error("Fel vid dataextraktion:", error);
      setExtractionStatus(
        `❌ Fel: ${error instanceof Error ? error.message : "Okänt fel"}`
      );
    } finally {
      setIsExtracting(false);
    }
  };

  const handleUseData = () => {
    if (extractedData.length > 0) {
      onDataExtracted(extractedData);
      onClose();
    }
  };

  const handleNextDivision = () => {
    if (currentDivision < 7) {
      setCurrentDivision(currentDivision + 1);
    }
  };

  const handlePrevDivision = () => {
    if (currentDivision > 1) {
      setCurrentDivision(currentDivision - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">
            ATG Data Extraktion - V75 Bjerke
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* URL Display */}
          <div className="mb-4 p-3 bg-gray-100 rounded">
            <p className="text-sm text-gray-600">
              <strong>Base URL:</strong> {baseUrl}
            </p>
          </div>

          {/* Division Navigation */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Avdelningar (1-7)</h3>
              <div className="flex space-x-2">
                <button
                  onClick={handlePrevDivision}
                  disabled={currentDivision <= 1}
                  className="px-3 py-1 bg-gray-300 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Föregående
                </button>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded">
                  Avd {currentDivision}
                </span>
                <button
                  onClick={handleNextDivision}
                  disabled={currentDivision >= 7}
                  className="px-3 py-1 bg-gray-300 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Nästa →
                </button>
              </div>
            </div>

            {/* ATG Website Preview */}
            <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
              <div className="bg-gray-100 p-2 text-sm text-gray-600">
                ATG Webbplats: {baseUrl}/avd/{currentDivision}
              </div>
              <div className="h-96 bg-white flex items-center justify-center">
                <div className="text-center">
                  <svg
                    className="w-16 h-16 text-gray-400 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-gray-600 mb-2">
                    ATG-webbplatsen kan inte visas direkt i iframe
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Använd "Extrahera All Data" för att hämta riktig data från
                    ATG
                  </p>
                  <a
                    href={`${baseUrl}/avd/${currentDivision}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                    Öppna ATG i ny flik
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Data Extraction */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Data Extraktion</h3>
              <button
                onClick={handleExtractData}
                disabled={isExtracting}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExtracting ? "Extraherar..." : "Extrahera All Data"}
              </button>
            </div>

            {extractionStatus && (
              <div
                className={`p-3 rounded ${
                  extractionStatus.includes("✅")
                    ? "bg-green-100 text-green-800"
                    : extractionStatus.includes("❌")
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {extractionStatus}
              </div>
            )}
          </div>

          {/* Extracted Data Preview */}
          {extractedData.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Extraherad Data</h3>
              <div className="space-y-4 max-h-60 overflow-y-auto">
                {extractedData.map((race, index) => (
                  <div key={index} className="border rounded p-3">
                    <h4 className="font-semibold text-blue-600">
                      {race.title} ({race.horses.length} hästar)
                    </h4>
                    <div className="text-sm text-gray-600 mt-1">
                      <p>Första hästen: {race.horses[0]?.name || "Ingen"}</p>
                      <p>
                        Senaste hästen:{" "}
                        {race.horses[race.horses.length - 1]?.name || "Ingen"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Avbryt
            </button>
            <button
              onClick={handleUseData}
              disabled={extractedData.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Använd Data ({extractedData.length} avdelningar)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
