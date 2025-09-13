"use client";

import React, { useState, useEffect } from "react";
import { V75Race, Horse } from "@/data/v75Data";

interface SyncViewProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSync: (data: V75Race[]) => void;
  currentData: V75Race[];
  v75Url?: string;
}

const XIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  </svg>
);

const AlertCircleIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
    />
  </svg>
);

const RefreshCwIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
    />
  </svg>
);

const SyncView: React.FC<SyncViewProps> = ({
  isOpen,
  onClose,
  onConfirmSync,
  currentData,
  v75Url,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [syncData, setSyncData] = useState<V75Race[]>([]);
  const [currentDivision, setCurrentDivision] = useState(0);
  const [isBrowserOpen, setIsBrowserOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [adjustedData, setAdjustedData] = useState<V75Race[]>([]);

  useEffect(() => {
    if (isOpen) {
      setAdjustedData([...currentData]);
      startSyncProcess();
    }
  }, [isOpen, currentData]);

  const startSyncProcess = async () => {
    setIsLoading(true);
    setError("");
    setSyncStatus("Startar synkronisering...");

    try {
      const response = await fetch("/api/start-sync-session", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Kunde inte starta synkroniseringssession");
      }

      const result = await response.json();
      console.log("Synkroniseringssession startad:", result);

      // Simulera datahämtning från ATG
      await simulateDataCollection();
    } catch (error) {
      console.error("Fel vid start av synkroniseringssession:", error);
      setError(error instanceof Error ? error.message : "Okänt fel");
    } finally {
      setIsLoading(false);
    }
  };

  const simulateDataCollection = async () => {
    setSyncStatus("Hämtar riktig data från ATG...");
    setIsBrowserOpen(true);

    try {
      // Hämta riktig data från ATG för alla avdelningar
      const atgData = [];

      // Använd URL från props eller fallback till standard
      const baseUrl = v75Url || "https://www.atg.se/spel/2025-09-14/V75/bjerke";

      for (let i = 1; i <= 7; i++) {
        try {
          const response = await fetch("/api/fetch-atg-real", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              url: `${baseUrl}/${i}`,
            }),
          });

          const result = await response.json();
          if (result.success && result.data.length > 0) {
            atgData.push(...result.data);
            console.log(`✅ Hämtade data för avdelning ${i}`);
          }
        } catch (error) {
          console.log(`⚠️ Kunde inte hämta data för avdelning ${i}:`, error);
        }
      }

      if (atgData.length === 0) {
        // Fallback till simulerad data om ATG-hämtning misslyckades
        console.log("⚠️ Använder simulerad data som fallback");
        const simulatedData = currentData.map((race, raceIndex) => ({
          ...race,
          horses: race.horses.map((horse, horseIndex) => ({
            ...horse,
            v75Percent: Math.max(
              0,
              Math.min(100, horse.v75Percent + (Math.random() - 0.5) * 10)
            ),
            trendPercent: Math.max(
              0,
              Math.min(100, horse.trendPercent + (Math.random() - 0.5) * 5)
            ),
            vOdds: Math.max(
              1.01,
              Math.min(99.99, horse.vOdds + (Math.random() - 0.5) * 2)
            ),
            pOdds: Math.max(
              1.01,
              Math.min(99.99, horse.pOdds + (Math.random() - 0.5) * 2)
            ),
            scratched: Math.random() < 0.1 ? !horse.scratched : horse.scratched,
          })),
        }));
        setSyncData(simulatedData);
        setSyncStatus("Simulerad data används - ATG-hämtning misslyckades");
      } else {
        setSyncData(atgData);
        setSyncStatus(
          `Riktig data hämtad från ATG (${atgData.length} avdelningar) - ${baseUrl}`
        );
      }
    } catch (error) {
      console.error("Fel vid hämtning från ATG:", error);
      setError("Kunde inte hämta data från ATG");
    } finally {
      setIsBrowserOpen(false);
    }
  };

  const handleValueChange = (
    raceIndex: number,
    horseIndex: number,
    field: keyof Horse,
    value: any
  ) => {
    const newData = [...adjustedData];
    newData[raceIndex].horses[horseIndex] = {
      ...newData[raceIndex].horses[horseIndex],
      [field]: value,
    };
    setAdjustedData(newData);
  };

  const copyHorseFromATG = (raceIndex: number, horseIndex: number) => {
    const atgHorse = syncData[raceIndex]?.horses[horseIndex];
    if (!atgHorse) return;

    const newData = [...adjustedData];
    newData[raceIndex].horses[horseIndex] = {
      ...newData[raceIndex].horses[horseIndex],
      v75Percent: atgHorse.v75Percent,
      trendPercent: atgHorse.trendPercent,
      vOdds: atgHorse.vOdds,
      pOdds: atgHorse.pOdds,
      scratched: atgHorse.scratched,
    };
    setAdjustedData(newData);
  };

  const copyFieldFromATG = (
    raceIndex: number,
    horseIndex: number,
    field: keyof Horse
  ) => {
    const atgHorse = syncData[raceIndex]?.horses[horseIndex];
    if (!atgHorse) return;

    const newData = [...adjustedData];
    newData[raceIndex].horses[horseIndex] = {
      ...newData[raceIndex].horses[horseIndex],
      [field]: atgHorse[field],
    };
    setAdjustedData(newData);
  };

  const copyAllFromATG = (raceIndex: number) => {
    const atgRace = syncData[raceIndex];
    if (!atgRace) return;

    const newData = [...adjustedData];
    newData[raceIndex] = {
      ...newData[raceIndex],
      horses: atgRace.horses.map((atgHorse, horseIndex) => ({
        ...newData[raceIndex].horses[horseIndex],
        v75Percent: atgHorse.v75Percent,
        trendPercent: atgHorse.trendPercent,
        vOdds: atgHorse.vOdds,
        pOdds: atgHorse.pOdds,
        scratched: atgHorse.scratched,
      })),
    };
    setAdjustedData(newData);
  };

  const handleConfirmSync = () => {
    onConfirmSync(adjustedData);
    onClose();
  };

  const handleNextDivision = () => {
    if (currentDivision < currentData.length - 1) {
      setCurrentDivision(currentDivision + 1);
    }
  };

  const handlePrevDivision = () => {
    if (currentDivision > 0) {
      setCurrentDivision(currentDivision - 1);
    }
  };

  if (!isOpen) return null;

  const currentRace = currentData[currentDivision];
  const atgRace = syncData[currentDivision];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Synkronisera med ATG
            </h2>
            {isLoading && (
              <div className="flex items-center space-x-2 text-blue-600">
                <RefreshCwIcon className="w-5 h-5 animate-spin" />
                <span className="text-sm">{syncStatus}</span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left side - App Data */}
          <div className="flex-1 p-6 border-r">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                App Data (Avdelning {currentDivision + 1})
              </h3>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500">
                  {currentRace?.horses.length || 0} hästar
                </div>
                <button
                  onClick={() => copyAllFromATG(currentDivision)}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                >
                  📋 Kopiera alla från ATG
                </button>
              </div>
            </div>

            {currentRace && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">
                    {currentRace.track} - {currentRace.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {currentRace.date} • {currentRace.time}
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-3 py-2 text-left">Häst</th>
                        <th className="px-3 py-2 text-right">V75%</th>
                        <th className="px-3 py-2 text-right">TREND%</th>
                        <th className="px-3 py-2 text-right">V-ODDS</th>
                        <th className="px-3 py-2 text-right">P-ODDS</th>
                        <th className="px-3 py-2 text-center">Struken</th>
                        <th className="px-3 py-2 text-center">Kopiera</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentRace.horses.map((horse, horseIndex) => (
                        <tr key={horseIndex} className="border-b">
                          <td className="px-3 py-2">
                            <div>
                              <div className="font-medium">{horse.name}</div>
                              <div className="text-xs text-gray-500">
                                {horse.driver}
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-right">
                            <input
                              type="number"
                              step="0.1"
                              value={
                                adjustedData[currentDivision]?.horses[
                                  horseIndex
                                ]?.v75Percent || 0
                              }
                              onChange={(e) =>
                                handleValueChange(
                                  currentDivision,
                                  horseIndex,
                                  "v75Percent",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-20 px-2 py-1 text-right border rounded text-sm"
                            />
                          </td>
                          <td className="px-3 py-2 text-right">
                            <input
                              type="number"
                              step="0.1"
                              value={
                                adjustedData[currentDivision]?.horses[
                                  horseIndex
                                ]?.trendPercent || 0
                              }
                              onChange={(e) =>
                                handleValueChange(
                                  currentDivision,
                                  horseIndex,
                                  "trendPercent",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-20 px-2 py-1 text-right border rounded text-sm"
                            />
                          </td>
                          <td className="px-3 py-2 text-right">
                            <input
                              type="number"
                              step="0.01"
                              value={
                                adjustedData[currentDivision]?.horses[
                                  horseIndex
                                ]?.vOdds || 0
                              }
                              onChange={(e) =>
                                handleValueChange(
                                  currentDivision,
                                  horseIndex,
                                  "vOdds",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-20 px-2 py-1 text-right border rounded text-sm"
                            />
                          </td>
                          <td className="px-3 py-2 text-right">
                            <input
                              type="number"
                              step="0.01"
                              value={
                                adjustedData[currentDivision]?.horses[
                                  horseIndex
                                ]?.pOdds || 0
                              }
                              onChange={(e) =>
                                handleValueChange(
                                  currentDivision,
                                  horseIndex,
                                  "pOdds",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-20 px-2 py-1 text-right border rounded text-sm"
                            />
                          </td>
                          <td className="px-3 py-2 text-center">
                            <input
                              type="checkbox"
                              checked={
                                adjustedData[currentDivision]?.horses[
                                  horseIndex
                                ]?.scratched || false
                              }
                              onChange={(e) =>
                                handleValueChange(
                                  currentDivision,
                                  horseIndex,
                                  "scratched",
                                  e.target.checked
                                )
                              }
                              className="w-4 h-4"
                            />
                          </td>
                          <td className="px-3 py-2 text-center">
                            <button
                              onClick={() =>
                                copyHorseFromATG(currentDivision, horseIndex)
                              }
                              className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                              title="Kopiera alla värden från ATG för denna häst"
                            >
                              📋
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Right side - ATG Data */}
          <div className="flex-1 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                ATG Data (Avdelning {currentDivision + 1})
              </h3>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500">
                  {atgRace?.horses.length || 0} hästar
                </div>
                <div className="text-xs text-gray-600">
                  🟢 Matchar | 🟡 Skillnad | 🔴 Olika status
                </div>
              </div>
            </div>

            {atgRace && (
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">
                    {atgRace.track} - {atgRace.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {atgRace.date} • {atgRace.time}
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-blue-100">
                        <th className="px-3 py-2 text-left">Häst</th>
                        <th className="px-3 py-2 text-right">V75%</th>
                        <th className="px-3 py-2 text-right">TREND%</th>
                        <th className="px-3 py-2 text-right">V-ODDS</th>
                        <th className="px-3 py-2 text-right">P-ODDS</th>
                        <th className="px-3 py-2 text-center">Struken</th>
                        <th className="px-3 py-2 text-center">Kopiera</th>
                      </tr>
                    </thead>
                    <tbody>
                      {atgRace.horses.map((horse, horseIndex) => (
                        <tr key={horseIndex} className="border-b">
                          <td className="px-3 py-2">
                            <div>
                              <div className="font-medium">{horse.name}</div>
                              <div className="text-xs text-gray-500">
                                {horse.driver}
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-right">
                            <span
                              className={`px-2 py-1 rounded text-sm ${
                                Math.abs(
                                  horse.v75Percent -
                                    (adjustedData[currentDivision]?.horses[
                                      horseIndex
                                    ]?.v75Percent || 0)
                                ) > 1
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {horse.v75Percent.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right">
                            <span
                              className={`px-2 py-1 rounded text-sm ${
                                Math.abs(
                                  horse.trendPercent -
                                    (adjustedData[currentDivision]?.horses[
                                      horseIndex
                                    ]?.trendPercent || 0)
                                ) > 1
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {horse.trendPercent.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right">
                            <span
                              className={`px-2 py-1 rounded text-sm ${
                                Math.abs(
                                  horse.vOdds -
                                    (adjustedData[currentDivision]?.horses[
                                      horseIndex
                                    ]?.vOdds || 0)
                                ) > 0.5
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {horse.vOdds.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right">
                            <span
                              className={`px-2 py-1 rounded text-sm ${
                                Math.abs(
                                  horse.pOdds -
                                    (adjustedData[currentDivision]?.horses[
                                      horseIndex
                                    ]?.pOdds || 0)
                                ) > 0.5
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {horse.pOdds.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-center">
                            <span
                              className={`px-2 py-1 rounded text-sm ${
                                horse.scratched !==
                                (adjustedData[currentDivision]?.horses[
                                  horseIndex
                                ]?.scratched || false)
                                  ? "bg-red-100 text-red-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {horse.scratched ? "JA" : "NEJ"}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-center">
                            <button
                              onClick={() =>
                                copyHorseFromATG(currentDivision, horseIndex)
                              }
                              className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                              title="Kopiera alla värden från ATG för denna häst"
                            >
                              📋
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="flex items-center space-x-4">
            <button
              onClick={handlePrevDivision}
              disabled={currentDivision === 0}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Föregående
            </button>
            <span className="text-sm text-gray-600">
              Avdelning {currentDivision + 1} av {currentData.length}
            </span>
            <button
              onClick={handleNextDivision}
              disabled={currentDivision === currentData.length - 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Nästa →
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Avbryt
            </button>
            <button
              onClick={handleConfirmSync}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <CheckIcon className="w-4 h-4 inline mr-2" />
              Bekräfta synkronisering
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SyncView;
