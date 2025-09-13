"use client";

import { useState } from "react";

interface SyncButtonProps {
  onSync: () => Promise<void>;
  lastSynced?: Date | null;
  className?: string;
}

export default function SyncButton({
  onSync,
  lastSynced,
  className = "",
}: SyncButtonProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncStatus("idle");

    try {
      await onSync();
      setSyncStatus("success");
      // Reset success status after 3 seconds
      setTimeout(() => setSyncStatus("idle"), 3000);
    } catch (error) {
      console.error("Sync error:", error);
      setSyncStatus("error");
      // Reset error status after 5 seconds
      setTimeout(() => setSyncStatus("idle"), 5000);
    } finally {
      setIsSyncing(false);
    }
  };

  const getButtonContent = () => {
    if (isSyncing) {
      return (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
          Synkroniserar...
        </>
      );
    }

    if (syncStatus === "success") {
      return (
        <>
          <svg
            className="w-4 h-4 mr-2 text-white"
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
          Synkroniserad
        </>
      );
    }

    if (syncStatus === "error") {
      return (
        <>
          <svg
            className="w-4 h-4 mr-2 text-white"
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
          Synkronisering misslyckades
        </>
      );
    }

    return (
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
        Synkronisera
      </>
    );
  };

  const getButtonClass = () => {
    const baseClass =
      "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200";

    if (syncStatus === "success") {
      return `${baseClass} bg-green-600 hover:bg-green-700`;
    }

    if (syncStatus === "error") {
      return `${baseClass} bg-red-600 hover:bg-red-700`;
    }

    return `${baseClass} bg-blue-600 hover:bg-blue-700 ${className}`;
  };

  return (
    <div className="flex flex-col items-end space-y-2">
      <button
        onClick={handleSync}
        disabled={isSyncing}
        className={getButtonClass()}
      >
        {getButtonContent()}
      </button>

      {isSyncing && (
        <div className="flex flex-col items-center space-y-2 text-sm text-blue-600">
          <div className="flex items-center space-x-2">
            <svg
              className="animate-spin h-4 w-4"
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
            <span>Uppdaterar V75-data...</span>
          </div>
          <div className="text-xs text-gray-500">
            Hämtar senaste startlistor och odds
          </div>
        </div>
      )}

      {lastSynced && !isSyncing && (
        <p className="text-xs text-gray-500">
          Senast synkroniserad: {lastSynced.toLocaleString("sv-SE")}
        </p>
      )}
    </div>
  );
}
