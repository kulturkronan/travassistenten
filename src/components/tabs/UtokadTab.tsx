"use client";

import { useState } from "react";
import ExportButton from "../ExportButton";
import DataEvaluation from "../DataEvaluation";

export default function UtokadTab() {
  const [isLoading, setIsLoading] = useState(false);
  const [historicalData, setHistoricalData] = useState<any>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const handleFetchHistoricalData = async () => {
    setIsLoading(true);
    // Simulate API call to fetch historical data
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Mock historical data
    const mockData = {
      date: "2025-09-13",
      races: [
        {
          raceNumber: 1,
          title: "Menhammar Stuteri - STL Stodivisionen",
          horses: [
            {
              name: "Vibora",
              historicalRaces: [
                {
                  date: "2025-08-30",
                  track: "Solvalla",
                  position: 1,
                  time: "1.14,2",
                  driver: "Magnus A Djuse",
                },
                {
                  date: "2025-08-16",
                  track: "Solvalla",
                  position: 2,
                  time: "1.14,8",
                  driver: "Magnus A Djuse",
                },
                {
                  date: "2025-08-02",
                  track: "Solvalla",
                  position: 1,
                  time: "1.13,9",
                  driver: "Magnus A Djuse",
                },
                {
                  date: "2025-07-19",
                  track: "Solvalla",
                  position: 3,
                  time: "1.15,1",
                  driver: "Magnus A Djuse",
                },
                {
                  date: "2025-07-05",
                  track: "Solvalla",
                  position: 1,
                  time: "1.14,5",
                  driver: "Magnus A Djuse",
                },
              ],
            },
          ],
        },
      ],
    };

    setHistoricalData(mockData);
    setLastUpdated(new Date());
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Utökad Startlista
            </h2>
            <p className="text-gray-600 mt-1">
              Historisk data och djupare analys av hästarna som deltar idag
            </p>
            {lastUpdated && (
              <p className="text-sm text-gray-500 mt-1">
                Senast uppdaterad: {lastUpdated.toLocaleString("sv-SE")}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleFetchHistoricalData}
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
                  Hämtar historisk data...
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
                  Hämta historisk data
                </>
              )}
            </button>

            {historicalData && (
              <ExportButton
                data={historicalData}
                filename="v75_utokad_startlista_2025-09-13"
                title="V75 Utökad Startlista - 13 september 2025"
              />
            )}
          </div>
        </div>
      </div>

      {/* Data evaluation */}
      {historicalData && <DataEvaluation data={historicalData} type="utokad" />}

      {/* Historical data display */}
      {historicalData ? (
        <div className="space-y-6">
          {historicalData.races.map((race: any) => (
            <div
              key={race.raceNumber}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                V75-{race.raceNumber} – {race.title}
              </h3>

              <div className="space-y-4">
                {race.horses.map((horse: any, index: number) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <h4 className="font-medium text-gray-800 mb-3">
                      {horse.name}
                    </h4>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-3 py-2 text-left font-semibold">
                              Datum
                            </th>
                            <th className="px-3 py-2 text-left font-semibold">
                              Bana
                            </th>
                            <th className="px-3 py-2 text-center font-semibold">
                              Placering
                            </th>
                            <th className="px-3 py-2 text-center font-semibold">
                              Tid
                            </th>
                            <th className="px-3 py-2 text-left font-semibold">
                              Kusk
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {horse.historicalRaces.map(
                            (race: any, raceIndex: number) => (
                              <tr
                                key={raceIndex}
                                className="border-b hover:bg-gray-50"
                              >
                                <td className="px-3 py-2">{race.date}</td>
                                <td className="px-3 py-2">{race.track}</td>
                                <td className="px-3 py-2 text-center">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      race.position === 1
                                        ? "bg-yellow-100 text-yellow-800"
                                        : race.position <= 3
                                        ? "bg-green-100 text-green-800"
                                        : "bg-gray-100 text-gray-800"
                                    }`}
                                  >
                                    {race.position}
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-center font-mono">
                                  {race.time}
                                </td>
                                <td className="px-3 py-2">{race.driver}</td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
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
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Ingen historisk data
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Klicka på "Hämta historisk data" för att visa hästarnas tidigare
            resultat.
          </p>
        </div>
      )}
    </div>
  );
}
