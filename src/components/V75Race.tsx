import React from "react";
import SortableTable from "./SortableTable";

interface Horse {
  number: number;
  name: string;
  driver: string;
  trainer?: string;
  track: number;
  record: string;
  prizeMoney: number;
  v75Percent: number;
  trendPercent?: number;
  vOdds: number;
  pOdds: number;
  shoes: string;
  wagon: string;
  tips?: string;
  tipComment?: string;
  scratched?: boolean;
}

interface V75RaceProps {
  raceNumber: number;
  title: string;
  distance: string;
  trackType: string;
  horses: Horse[];
  onEditHorse?: (raceNumber: number, horseNumber: number, horse: Horse) => void;
  editingHorse?: { raceNumber: number; horseNumber: number } | null;
  editValues?: any;
  onSaveEdit?: () => void;
  onCancelEdit?: () => void;
  onUpdateEditValues?: (values: any) => void;
}

export default function V75Race({
  raceNumber,
  title,
  distance,
  trackType,
  horses,
  onEditHorse,
  editingHorse,
  editValues,
  onSaveEdit,
  onCancelEdit,
  onUpdateEditValues,
}: V75RaceProps) {
  // Hitta favoriter (högsta V75%)
  const sortedHorses = [...horses].sort((a, b) => b.v75Percent - a.v75Percent);
  const topHorses = sortedHorses.slice(0, 3);

  const isEditing = (horse: Horse) =>
    editingHorse?.raceNumber === raceNumber &&
    editingHorse?.horseNumber === horse.number;

  const handleCellClick = (horse: Horse) => {
    if (onEditHorse) {
      onEditHorse(raceNumber, horse.number, horse);
    }
  };

  // Hantera tangentbordsgenvägar
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onCancelEdit?.();
    } else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      onSaveEdit?.();
    }
  };

  const columns = [
    {
      key: "number",
      label: "Nr",
      sortable: true,
      className: "text-center",
      render: (value: number, row: Horse) => (
        <span className="font-medium">{value}</span>
      ),
    },
    {
      key: "name",
      label: "Häst/Kusk",
      sortable: true,
      render: (value: string, row: Horse) => {
        if (isEditing(row)) {
          return (
            <div className="space-y-1">
              <input
                type="text"
                value={editValues?.name || ""}
                onChange={(e) =>
                  onUpdateEditValues?.({ ...editValues, name: e.target.value })
                }
                onKeyDown={handleKeyDown}
                className="w-full px-2 py-1 text-sm border rounded"
                placeholder="Hästnamn"
              />
              <input
                type="text"
                value={editValues?.driver || ""}
                onChange={(e) =>
                  onUpdateEditValues?.({
                    ...editValues,
                    driver: e.target.value,
                  })
                }
                onKeyDown={handleKeyDown}
                className="w-full px-2 py-1 text-xs border rounded"
                placeholder="Kusk"
              />
            </div>
          );
        }
        return (
          <div
            className={`cursor-pointer hover:bg-gray-50 p-1 rounded ${
              isEditing(row) ? "bg-blue-50" : ""
            }`}
            onClick={() => handleCellClick(row)}
          >
            <div
              className={`font-medium ${
                row.scratched ? "text-red-500 line-through" : ""
              }`}
            >
              {value}
            </div>
            <div
              className={`text-xs ${
                row.scratched ? "text-red-400 line-through" : "text-gray-600"
              }`}
            >
              {row.driver}
            </div>
          </div>
        );
      },
    },
    {
      key: "v75Percent",
      label: "V75%",
      sortable: true,
      className: "text-right",
      render: (value: number, row: Horse) => {
        if (isEditing(row)) {
          return (
            <input
              type="number"
              step="0.1"
              value={editValues?.v75Percent || ""}
              onChange={(e) =>
                onUpdateEditValues?.({
                  ...editValues,
                  v75Percent: parseFloat(e.target.value) || 0,
                })
              }
              onKeyDown={handleKeyDown}
              className="w-full px-2 py-1 text-sm border rounded text-right"
              placeholder="0.0"
            />
          );
        }
        return (
          <span
            className={`font-medium ${
              row.scratched
                ? "text-red-500 line-through"
                : value > 20
                ? "v75-percent-high"
                : "text-blue-600"
            }`}
          >
            {row.scratched ? "EJ" : `${value.toFixed(1)}%`}
          </span>
        );
      },
    },
    {
      key: "trendPercent",
      label: "TREND%",
      sortable: true,
      className: "text-right",
      render: (value: number | undefined, row: Horse) => {
        if (isEditing(row)) {
          return (
            <input
              type="number"
              step="0.1"
              value={editValues?.trendPercent || ""}
              onChange={(e) =>
                onUpdateEditValues?.({
                  ...editValues,
                  trendPercent: parseFloat(e.target.value) || 0,
                })
              }
              onKeyDown={handleKeyDown}
              className="w-full px-2 py-1 text-sm border rounded text-right"
              placeholder="0.0"
            />
          );
        }
        return row.scratched ? (
          <span className="text-red-500 line-through">EJ</span>
        ) : value ? (
          <span className={value > 0 ? "trend-positive" : "trend-negative"}>
            {value > 0 ? "+" : ""}
            {value.toFixed(1)}%
          </span>
        ) : (
          "-"
        );
      },
    },
    {
      key: "vOdds",
      label: "V-ODDS",
      sortable: true,
      className: "text-right",
      render: (value: number, row: Horse) => {
        if (isEditing(row)) {
          return (
            <input
              type="number"
              step="0.01"
              value={editValues?.vOdds || ""}
              onChange={(e) =>
                onUpdateEditValues?.({
                  ...editValues,
                  vOdds: parseFloat(e.target.value) || 0,
                })
              }
              onKeyDown={handleKeyDown}
              className="w-full px-2 py-1 text-sm border rounded text-right"
              placeholder="0.00"
            />
          );
        }
        return (
          <span
            className={
              row.scratched
                ? "text-red-500 line-through"
                : value > 20
                ? "odds-high"
                : "odds-low"
            }
          >
            {row.scratched
              ? "EJ"
              : value === 99.99
              ? "99.99"
              : value.toFixed(2)}
          </span>
        );
      },
    },
    {
      key: "pOdds",
      label: "P-ODDS",
      sortable: true,
      className: "text-right",
      render: (value: number, row: Horse) => {
        if (isEditing(row)) {
          return (
            <input
              type="number"
              step="0.01"
              value={editValues?.pOdds || ""}
              onChange={(e) =>
                onUpdateEditValues?.({
                  ...editValues,
                  pOdds: parseFloat(e.target.value) || 0,
                })
              }
              onKeyDown={handleKeyDown}
              className="w-full px-2 py-1 text-sm border rounded text-right"
              placeholder="0.00"
            />
          );
        }
        return (
          <span
            className={
              row.scratched
                ? "text-red-500 line-through"
                : value > 20
                ? "odds-high"
                : "odds-low"
            }
          >
            {row.scratched
              ? "EJ"
              : value === 99.99
              ? "99.99"
              : value.toFixed(2)}
          </span>
        );
      },
    },
    {
      key: "track",
      label: "Spår",
      sortable: true,
      className: "text-center",
      render: (value: number, row: Horse) => {
        if (isEditing(row)) {
          return (
            <input
              type="number"
              min="1"
              max="12"
              value={editValues?.track || ""}
              onChange={(e) =>
                onUpdateEditValues?.({
                  ...editValues,
                  track: parseInt(e.target.value) || 1,
                })
              }
              onKeyDown={handleKeyDown}
              className="w-full px-2 py-1 text-sm border rounded text-center"
              placeholder="1"
            />
          );
        }
        return <span className="font-medium">{value}</span>;
      },
    },
    {
      key: "record",
      label: "Rekord",
      sortable: true,
      className: "text-right font-mono text-sm",
      render: (value: string, row: Horse) => {
        if (isEditing(row)) {
          return (
            <input
              type="text"
              value={editValues?.record || ""}
              onChange={(e) =>
                onUpdateEditValues?.({ ...editValues, record: e.target.value })
              }
              onKeyDown={handleKeyDown}
              className="w-full px-2 py-1 text-sm border rounded text-right font-mono"
              placeholder="1.14,0"
            />
          );
        }
        return <span className="font-mono">{value}</span>;
      },
    },
    {
      key: "prizeMoney",
      label: "Summa",
      sortable: true,
      className: "text-right",
      render: (value: number, row: Horse) => {
        if (isEditing(row)) {
          return (
            <input
              type="number"
              min="0"
              step="1000"
              value={editValues?.prizeMoney || ""}
              onChange={(e) =>
                onUpdateEditValues?.({
                  ...editValues,
                  prizeMoney: parseInt(e.target.value) || 0,
                })
              }
              onKeyDown={handleKeyDown}
              className="w-full px-2 py-1 text-sm border rounded text-right"
              placeholder="100000"
            />
          );
        }
        return <span>{value.toLocaleString("sv-SE")}</span>;
      },
    },
    {
      key: "shoes",
      label: "Skor",
      sortable: true,
      className: "text-center font-mono text-xs",
      render: (value: string, row: Horse) => {
        if (isEditing(row)) {
          return (
            <input
              type="text"
              maxLength={2}
              value={editValues?.shoes || ""}
              onChange={(e) =>
                onUpdateEditValues?.({
                  ...editValues,
                  shoes: e.target.value.toUpperCase(),
                })
              }
              onKeyDown={handleKeyDown}
              className="w-full px-2 py-1 text-xs border rounded text-center font-mono"
              placeholder="CC"
            />
          );
        }
        return <span className="font-mono">{value}</span>;
      },
    },
    {
      key: "wagon",
      label: "Vagn",
      sortable: true,
      className: "text-center font-mono text-xs",
      render: (value: string, row: Horse) => {
        if (isEditing(row)) {
          return (
            <input
              type="text"
              maxLength={2}
              value={editValues?.wagon || ""}
              onChange={(e) =>
                onUpdateEditValues?.({
                  ...editValues,
                  wagon: e.target.value.toUpperCase(),
                })
              }
              onKeyDown={handleKeyDown}
              className="w-full px-2 py-1 text-xs border rounded text-center font-mono"
              placeholder="VA"
            />
          );
        }
        return <span className="font-mono">{value}</span>;
      },
    },
    {
      key: "scratched",
      label: "Struken",
      sortable: true,
      className: "text-center",
      render: (value: boolean | undefined, row: Horse) => {
        if (isEditing(row)) {
          return (
            <input
              type="checkbox"
              checked={editValues?.scratched || false}
              onChange={(e) =>
                onUpdateEditValues?.({
                  ...editValues,
                  scratched: e.target.checked,
                })
              }
              onKeyDown={handleKeyDown}
              className="w-4 h-4"
            />
          );
        }
        return (
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              value ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
            }`}
          >
            {value ? "JA" : "NEJ"}
          </span>
        );
      },
    },
  ];

  return (
    <div className="race-card">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-blue-800 mb-2">
          V75-{raceNumber} – {title}
        </h2>
        <p className="text-gray-600 text-sm">
          {distance} • {trackType}
        </p>

        {/* Favoriter */}
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="text-sm font-medium text-gray-700">Favoriter:</span>
          {topHorses.map((horse, index) => (
            <span
              key={horse.number}
              className={`px-2 py-1 rounded text-xs font-medium ${
                index === 0
                  ? "bg-yellow-100 text-yellow-800"
                  : index === 1
                  ? "bg-gray-100 text-gray-800"
                  : "bg-orange-100 text-orange-800"
              }`}
            >
              {horse.number}. {horse.name} ({horse.v75Percent.toFixed(1)}%)
            </span>
          ))}
        </div>
      </div>

      <SortableTable data={horses} columns={columns} />

      {/* Redigeringsknappar */}
      {editingHorse?.raceNumber === raceNumber && (
        <div
          className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg"
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <div className="flex items-center justify-between">
            <div className="text-sm text-blue-800">
              <div className="font-medium">
                Redigerar häst {editingHorse.horseNumber} -{" "}
                {editValues?.name || "Okänd"}
              </div>
              <div className="text-xs text-blue-600 mt-1">
                💡 Tips: ESC för att avbryta • Ctrl+Enter för att spara
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onSaveEdit}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Spara
              </button>
              <button
                onClick={onCancelEdit}
                className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                Avbryt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
