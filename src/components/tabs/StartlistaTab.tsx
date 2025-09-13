"use client";

import { useState, useEffect } from "react";
import V75Race from "../V75Race";
import ExportButton from "../ExportButton";
import DataEvaluation from "../DataEvaluation";
import SyncButton from "../SyncButton";
import SyncView from "../SyncView";
import ATGDataModal from "../ATGDataModal";
import { v75Data } from "@/data/v75Data";

interface RaceData {
  raceNumber: number;
  title: string;
  distance: string;
  trackType: string;
  horses: any[];
}

export default function StartlistaTab() {
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [raceData, setRaceData] = useState<RaceData[]>(v75Data);
  const [editingHorse, setEditingHorse] = useState<{
    raceNumber: number;
    horseNumber: number;
  } | null>(null);
  const [editValues, setEditValues] = useState<any>({});
  const [showSyncView, setShowSyncView] = useState(false);
  const [showATGModal, setShowATGModal] = useState(false);
  const [fetchStatus, setFetchStatus] = useState<string>("");
  const [v75Url, setV75Url] = useState<string>("");
  const [showUrlInput, setShowUrlInput] = useState<boolean>(false);

  const handleFetchNextV75 = async () => {
    setIsLoading(true);
    setFetchStatus("Hämtar alla V75-avdelningar från ATG...");
    try {
      // Använd live ATG API som hämtar riktig data
      const response = await fetch("/api/fetch-atg-live", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          baseUrl: v75Url || "https://www.atg.se/spel/2025-09-14/V75/bjerke",
        }),
      });
      const result = await response.json();

      if (result.success) {
        setRaceData(result.data);
        setLastUpdated(new Date());
        setFetchStatus(result.message);
        console.log("✅ Hämtade V75-data:", result.message);
      } else {
        setFetchStatus("❌ Fel vid hämtning");
        console.error("Fel vid hämtning av V75-data:", result.error);
      }
    } catch (error) {
      setFetchStatus("❌ Fel vid hämtning");
      console.error("Fel vid hämtning av V75-data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchTodaysRace = async () => {
    setIsLoading(true);
    try {
      // Hämta dagens omgång från hårdkodad data (fallback)
      setRaceData(v75Data);
      setLastUpdated(new Date());
      console.log("✅ Hämtade dagens V75-omgång");
    } catch (error) {
      console.error("Fel vid hämtning av dagens omgång:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearData = () => {
    setRaceData([]);
    setLastUpdated(null);
    setFetchStatus("");
    console.log("✅ Rensade all V75-data");
  };

  const handleATGDataExtracted = (races: RaceData[]) => {
    setRaceData(races);
    setLastUpdated(new Date());
    setFetchStatus(
      `✅ Extraherade ${races.length} avdelningar med riktig data från ATG`
    );
    console.log("✅ Använde extraherad data från ATG:", races);
  };

  const handleSync = async () => {
    setShowSyncView(true);
  };

  const handleConfirmSync = (newData: RaceData[]) => {
    setRaceData(newData);
    setLastUpdated(new Date());
    console.log(`✅ Synkroniserade ${newData.length} avdelningar från ATG`);
  };

  const handleEditHorse = (
    raceNumber: number,
    horseNumber: number,
    horse: any
  ) => {
    setEditingHorse({ raceNumber, horseNumber });
    setEditValues({ ...horse });
  };

  const handleSaveEdit = () => {
    if (!editingHorse) return;

    setRaceData((prevData) =>
      prevData.map((race) =>
        race.raceNumber === editingHorse.raceNumber
          ? {
              ...race,
              horses: race.horses.map((horse) =>
                horse.number === editingHorse.horseNumber
                  ? { ...horse, ...editValues }
                  : horse
              ),
            }
          : race
      )
    );

    setEditingHorse(null);
    setEditValues({});
  };

  const handleCancelEdit = () => {
    setEditingHorse(null);
    setEditValues({});
  };

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Startlista V75</h2>
            <p className="text-gray-600 mt-1">
              Aktuell startlista för V75 den 13 september 2025
            </p>
            {lastUpdated && (
              <p className="text-sm text-gray-500 mt-1">
                Senast uppdaterad: {lastUpdated.toLocaleString("sv-SE")}
              </p>
            )}
            {fetchStatus && (
              <p className="text-sm text-blue-600 mt-1 font-medium">
                {fetchStatus}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleFetchTodaysRace}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Hämtar...
                </>
              ) : (
                <>
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
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Hämta dagens omgång
                </>
              )}
            </button>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="inline-flex items-center px-3 py-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
              >
                {showUrlInput ? "Dölj URL-input" : "Ange V75-URL"}
              </button>

              {showUrlInput && (
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={v75Url}
                    onChange={(e) => setV75Url(e.target.value)}
                    placeholder="https://www.atg.se/spel/2025-09-14/V75/bjerke"
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              <button
                onClick={() => setShowATGModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
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
                Extrahera från ATG
              </button>
            </div>

            <SyncButton onSync={handleSync} lastSynced={lastUpdated} />

            <button
              onClick={handleClearData}
              className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Rensa
            </button>

            <ExportButton
              data={v75Data}
              filename="v75_startlista_2025-09-13"
              title="V75 Startlista - 13 september 2025"
            />
          </div>
        </div>
      </div>

      {/* Data evaluation */}
      <DataEvaluation data={raceData} type="startlista" />

      {/* Manual Edit Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">
          ✏️ Manuell redigering
        </h3>
        <div className="text-blue-700 text-sm space-y-2">
          <p>
            <strong>Redigering:</strong> Klicka på en häst i tabellerna nedan
            för att redigera värden manuellt.
          </p>
          <p>
            <strong>Tangentbordsgenvägar:</strong> ESC för att avbryta •
            Ctrl+Enter för att spara
          </p>
          <p>
            <strong>Data:</strong> Använd "Hämta dagens omgång" för originaldata
            • "Synkronisera" för sessiondata
          </p>
        </div>
      </div>

      {/* V75 Races */}
      <div className="space-y-6">
        {raceData.map((race, index) => (
          <V75Race
            key={`race-${race.raceNumber}-${index}`}
            raceNumber={race.raceNumber}
            title={race.title}
            distance={race.distance}
            trackType={race.trackType}
            horses={race.horses}
            onEditHorse={handleEditHorse}
            editingHorse={editingHorse}
            editValues={editValues}
            onSaveEdit={handleSaveEdit}
            onCancelEdit={handleCancelEdit}
            onUpdateEditValues={setEditValues}
          />
        ))}
      </div>

      {/* Sync View Modal */}
      <SyncView
        isOpen={showSyncView}
        onClose={() => setShowSyncView(false)}
        onConfirmSync={handleConfirmSync}
        currentData={raceData}
        v75Url={v75Url}
      />

      {/* ATG Data Modal */}
      <ATGDataModal
        isOpen={showATGModal}
        onClose={() => setShowATGModal(false)}
        onDataExtracted={handleATGDataExtracted}
        baseUrl={v75Url || "https://www.atg.se/spel/2025-09-14/V75/bjerke"}
      />
    </div>
  );
}
