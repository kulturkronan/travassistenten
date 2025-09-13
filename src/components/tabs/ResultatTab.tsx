"use client";

import { useState } from "react";
import ExportButton from "../ExportButton";
import DataEvaluation from "../DataEvaluation";
import SyncButton from "../SyncButton";
import SortableTable from "../SortableTable";

export default function ResultatTab() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const handleFetchResults = async () => {
    setIsLoading(true);
    // Simulate API call to fetch results
    await new Promise((resolve) => setTimeout(resolve, 2500));

    // Mock results data
    const mockResults = {
      date: "2025-09-13",
      races: [
        {
          raceNumber: 1,
          title: "Menhammar Stuteri - STL Stodivisionen",
          winner: {
            number: 7,
            name: "Vibora",
            driver: "Magnus A Djuse",
            time: "1.14,2",
            odds: 3.12,
          },
          payout: { v75: 3.12, system: 12.5 },
          fullResults: [
            {
              position: 1,
              number: 7,
              name: "Vibora",
              driver: "Magnus A Djuse",
              time: "1.14,2",
              odds: 3.12,
            },
            {
              position: 2,
              number: 1,
              name: "Twigs Khaleesi",
              driver: "Ulf Ohlsson",
              time: "1.14,3",
              odds: 5.17,
            },
            {
              position: 3,
              number: 5,
              name: "Grazzhopper",
              driver: "Markus B Svedberg",
              time: "1.14,5",
              odds: 11.3,
            },
            {
              position: 4,
              number: 6,
              name: "Kueen Simoni",
              driver: "Rikard N Skoglund",
              time: "1.14,8",
              odds: 7.58,
            },
            {
              position: 5,
              number: 3,
              name: "Make My Trip V.S.",
              driver: "Petter Lundberg",
              time: "1.15,0",
              odds: 17.54,
            },
          ],
        },
        {
          raceNumber: 2,
          title: "Travronden - STL Klass III mot STL Klass II",
          winner: {
            number: 7,
            name: "Fangio",
            driver: "Robert Bergh",
            time: "1.15,3",
            odds: 3.07,
          },
          payout: { v75: 3.07, system: 9.5 },
          fullResults: [
            {
              position: 1,
              number: 7,
              name: "Fangio",
              driver: "Robert Bergh",
              time: "1.15,3",
              odds: 3.07,
            },
            {
              position: 2,
              number: 1,
              name: "Pure Jouline",
              driver: "Linus Lönn",
              time: "1.15,5",
              odds: 9.44,
            },
            {
              position: 3,
              number: 2,
              name: "Champus",
              driver: "Markus B Svedberg",
              time: "1.15,8",
              odds: 14.28,
            },
            {
              position: 4,
              number: 10,
              name: "Checkpoint Charlie",
              driver: "Per Lennartsson",
              time: "1.16,0",
              odds: 8.04,
            },
            {
              position: 5,
              number: 8,
              name: "Timotejs Messenger",
              driver: "Mats E Djuse",
              time: "1.16,2",
              odds: 14.09,
            },
          ],
        },
      ],
      totalPayout: 9.59,
      systemPayout: 118.75,
    };

    setResults(mockResults);
    setLastUpdated(new Date());
    setIsLoading(false);
  };

  const handleSync = async () => {
    // Simulate sync with external data source
    await new Promise((resolve) => setTimeout(resolve, 2200));
    setLastUpdated(new Date());
  };

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Resultatanalys V75
            </h2>
            <p className="text-gray-600 mt-1">
              Analys av V75-resultat och utbetalningar
            </p>
            {lastUpdated && (
              <p className="text-sm text-gray-500 mt-1">
                Senast uppdaterad: {lastUpdated.toLocaleString("sv-SE")}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleFetchResults}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500"
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
                  Hämtar resultat...
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Hämta resultat
                </>
              )}
            </button>

            <SyncButton onSync={handleSync} lastSynced={lastUpdated} />

            {results && (
              <ExportButton
                data={results}
                filename="v75_resultat_2025-09-13"
                title="V75 Resultat - 13 september 2025"
              />
            )}
          </div>
        </div>
      </div>

      {/* Data evaluation */}
      {results && <DataEvaluation data={results} type="resultat" />}

      {/* Results display */}
      {results ? (
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Sammanfattning
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {results.totalPayout}
                </div>
                <div className="text-sm text-gray-600">V75 Utbetalning</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {results.systemPayout}
                </div>
                <div className="text-sm text-gray-600">System Utbetalning</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {results.races.length}
                </div>
                <div className="text-sm text-gray-600">
                  Avklarade Avdelningar
                </div>
              </div>
            </div>
          </div>

          {/* Race results */}
          {results.races.map((race: any, index: number) => (
            <div
              key={`result-${race.raceNumber}-${index}`}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  V75-{race.raceNumber} – {race.title}
                </h3>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Vinnare</div>
                  <div className="font-semibold text-green-600">
                    #{race.winner.number} {race.winner.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {race.winner.driver} • {race.winner.time} •{" "}
                    {race.winner.odds}
                  </div>
                </div>
              </div>

              <SortableTable
                data={race.fullResults}
                columns={[
                  {
                    key: "position",
                    label: "Plac",
                    sortable: true,
                    className: "text-center",
                    render: (value: number) => (
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          value === 1
                            ? "bg-green-100 text-green-800"
                            : value <= 3
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {value}
                      </span>
                    ),
                  },
                  {
                    key: "name",
                    label: "Häst/Kusk",
                    sortable: true,
                    render: (value: string, row: any) => (
                      <div>
                        <div className="font-medium">
                          #{row.number} {value}
                        </div>
                        <div className="text-gray-600 text-xs">
                          {row.driver}
                        </div>
                      </div>
                    ),
                  },
                  {
                    key: "time",
                    label: "Tid",
                    sortable: true,
                    className: "text-center font-mono",
                  },
                  {
                    key: "odds",
                    label: "Odds",
                    sortable: true,
                    className: "text-center font-medium",
                  },
                ]}
                defaultSort={{ key: "position", direction: "asc" }}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Inga resultat tillgängliga
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Klicka på "Hämta resultat" för att visa V75-resultat och
            utbetalningar.
          </p>
        </div>
      )}
    </div>
  );
}
