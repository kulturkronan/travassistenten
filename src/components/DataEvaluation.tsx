"use client";

interface DataEvaluationProps {
  data: any;
  sourceData?: any;
  type: "startlista" | "utokad" | "resultat";
}

export default function DataEvaluation({
  data,
  sourceData,
  type,
}: DataEvaluationProps) {
  const evaluateData = () => {
    const issues: string[] = [];
    const warnings: string[] = [];
    const success: string[] = [];

    if (Array.isArray(data)) {
      // Evaluate V75 data
      const totalHorses = data.reduce(
        (sum, race) => sum + race.horses.length,
        0
      );
      success.push(`✅ ${data.length} avdelningar hittade`);
      success.push(`✅ ${totalHorses} hästar totalt`);

      // Check for missing data
      data.forEach((race, raceIndex) => {
        race.horses.forEach((horse: any, horseIndex: number) => {
          if (!horse.name || horse.name.trim() === "") {
            issues.push(
              `❌ V75-${race.raceNumber}: Häst #${horse.number} saknar namn`
            );
          }
          if (!horse.driver || horse.driver.trim() === "") {
            issues.push(
              `❌ V75-${race.raceNumber}: Häst #${horse.number} saknar kusk`
            );
          }
          if (horse.v75Percent < 0 || horse.v75Percent > 100) {
            warnings.push(
              `⚠️ V75-${race.raceNumber}: Häst #${horse.number} har ogiltig V75-procent (${horse.v75Percent}%)`
            );
          }
          if (horse.vOdds < 1 || horse.vOdds > 999) {
            warnings.push(
              `⚠️ V75-${race.raceNumber}: Häst #${horse.number} har ogiltiga odds (${horse.vOdds})`
            );
          }
        });
      });

      // Check V75 percentages sum
      data.forEach((race) => {
        const totalPercent = race.horses.reduce(
          (sum: number, horse: any) => sum + horse.v75Percent,
          0
        );
        if (Math.abs(totalPercent - 100) > 5) {
          warnings.push(
            `⚠️ V75-${
              race.raceNumber
            }: V75-procent summerar till ${totalPercent.toFixed(
              1
            )}% (bör vara ~100%)`
          );
        }
      });
    }

    if (issues.length === 0 && warnings.length === 0) {
      success.push("✅ All data verifierad utan problem");
    }

    return { issues, warnings, success };
  };

  const { issues, warnings, success } = evaluateData();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <svg
          className="w-5 h-5 mr-2 text-blue-600"
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
        Dataevaluering
      </h3>

      <div className="space-y-3">
        {success.map((item, index) => (
          <div key={index} className="text-sm text-green-700">
            {item}
          </div>
        ))}

        {warnings.map((item, index) => (
          <div key={index} className="text-sm text-yellow-700">
            {item}
          </div>
        ))}

        {issues.map((item, index) => (
          <div key={index} className="text-sm text-red-700">
            {item}
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Status:</span>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              issues.length > 0
                ? "bg-red-100 text-red-800"
                : warnings.length > 0
                ? "bg-yellow-100 text-yellow-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {issues.length > 0
              ? "Problem"
              : warnings.length > 0
              ? "Varningar"
              : "OK"}
          </span>
        </div>
      </div>
    </div>
  );
}
