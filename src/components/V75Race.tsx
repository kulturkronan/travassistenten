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
}

interface V75RaceProps {
  raceNumber: number;
  title: string;
  distance: string;
  trackType: string;
  horses: Horse[];
}

export default function V75Race({
  raceNumber,
  title,
  distance,
  trackType,
  horses,
}: V75RaceProps) {
  // Hitta favoriter (högsta V75%)
  const sortedHorses = [...horses].sort((a, b) => b.v75Percent - a.v75Percent);
  const topHorses = sortedHorses.slice(0, 3);

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

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-3 py-2 text-left font-semibold">Nr</th>
              <th className="px-3 py-2 text-left font-semibold">Häst/Kusk</th>
              <th className="px-3 py-2 text-right font-semibold">V75%</th>
              <th className="px-3 py-2 text-right font-semibold">TREND%</th>
              <th className="px-3 py-2 text-right font-semibold">V-ODDS</th>
              <th className="px-3 py-2 text-right font-semibold">P-ODDS</th>
              <th className="px-3 py-2 text-left font-semibold">Spår</th>
              <th className="px-3 py-2 text-right font-semibold">Rekord</th>
              <th className="px-3 py-2 text-right font-semibold">Summa</th>
              <th className="px-3 py-2 text-center font-semibold">Skor</th>
              <th className="px-3 py-2 text-center font-semibold">Vagn</th>
            </tr>
          </thead>
          <tbody>
            {horses.map((horse) => {
              const isFavorite = topHorses.some(
                (h) => h.number === horse.number
              );
              return (
                <tr
                  key={horse.number}
                  className={`horse-row ${isFavorite ? "favorite-horse" : ""}`}
                >
                  <td className="px-3 py-2 font-medium">{horse.number}</td>
                  <td className="px-3 py-2">
                    <div>
                      <div className="font-medium">{horse.name}</div>
                      <div className="text-gray-600 text-xs">
                        {horse.driver}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <span
                      className={`font-medium ${
                        horse.v75Percent > 20
                          ? "v75-percent-high"
                          : "text-blue-600"
                      }`}
                    >
                      {horse.v75Percent.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    {horse.trendPercent ? (
                      <span
                        className={
                          horse.trendPercent > 0
                            ? "trend-positive"
                            : "trend-negative"
                        }
                      >
                        {horse.trendPercent > 0 ? "+" : ""}
                        {horse.trendPercent.toFixed(1)}%
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-3 py-2 text-right font-medium">
                    <span
                      className={horse.vOdds > 20 ? "odds-high" : "odds-low"}
                    >
                      {horse.vOdds === 99.99 ? "99.99" : horse.vOdds.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <span
                      className={horse.pOdds > 20 ? "odds-high" : "odds-low"}
                    >
                      {horse.pOdds === 99.99 ? "99.99" : horse.pOdds.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center">{horse.track}</td>
                  <td className="px-3 py-2 text-right font-mono text-sm">
                    {horse.record}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {horse.prizeMoney.toLocaleString("sv-SE")}
                  </td>
                  <td className="px-3 py-2 text-center font-mono text-xs">
                    {horse.shoes}
                  </td>
                  <td className="px-3 py-2 text-center font-mono text-xs">
                    {horse.wagon}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
