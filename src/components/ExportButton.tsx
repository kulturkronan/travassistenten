"use client";

interface ExportButtonProps {
  data: any;
  filename: string;
  title: string;
  className?: string;
}

export default function ExportButton({
  data,
  filename,
  title,
  className = "",
}: ExportButtonProps) {
  const exportToMarkdown = () => {
    let markdown = `# ${title}\n\n`;
    markdown += `*Exporterad: ${new Date().toLocaleString("sv-SE")}*\n\n`;

    if (Array.isArray(data)) {
      // Handle array of races
      data.forEach((race, index) => {
        markdown += `## V75-${race.raceNumber} – ${race.title}\n`;
        markdown += `*${race.distance}, ${race.trackType}*\n\n`;

        markdown += `| Nr | Häst/Kusk | V75% | TREND% | V-ODDS | P-ODDS | Spår | Rekord | Summa | Skor | Vagn |\n`;
        markdown += `|---:|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|\n`;

        race.horses.forEach((horse: any) => {
          markdown += `| ${horse.number} | ${horse.name} / ${
            horse.driver
          } | ${horse.v75Percent.toFixed(1)}% | ${
            horse.trendPercent
              ? (horse.trendPercent > 0 ? "+" : "") +
                horse.trendPercent.toFixed(1) +
                "%"
              : "-"
          } | ${horse.vOdds === 99.99 ? "99.99" : horse.vOdds.toFixed(2)} | ${
            horse.pOdds === 99.99 ? "99.99" : horse.pOdds.toFixed(2)
          } | ${horse.track} | ${
            horse.record
          } | ${horse.prizeMoney.toLocaleString("sv-SE")} | ${horse.shoes} | ${
            horse.wagon
          } |\n`;
        });

        markdown += "\n";
      });
    } else {
      // Handle single object or other data
      markdown += JSON.stringify(data, null, 2);
    }

    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={exportToMarkdown}
      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 ${className}`}
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
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      Exportera MD
    </button>
  );
}
