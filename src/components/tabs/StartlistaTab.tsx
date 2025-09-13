"use client";

import { useState } from "react";
import V75Race from "../V75Race";
import ExportButton from "../ExportButton";
import DataEvaluation from "../DataEvaluation";
import { v75Data } from "@/data/v75Data";

export default function StartlistaTab() {
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const handleFetchNextV75 = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setLastUpdated(new Date());
    setIsLoading(false);
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
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleFetchNextV75}
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
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Hämta nästa V75
                </>
              )}
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
      <DataEvaluation data={v75Data} type="startlista" />

      {/* V75 Races */}
      <div className="space-y-6">
        {v75Data.map((race) => (
          <V75Race
            key={race.raceNumber}
            raceNumber={race.raceNumber}
            title={race.title}
            distance={race.distance}
            trackType={race.trackType}
            horses={race.horses}
          />
        ))}
      </div>
    </div>
  );
}
