"use client";

import { useState, useRef } from "react";
import ExportButton from "../ExportButton";

export default function LaromTab() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".md")) {
      alert("Vänligen välj en Markdown-fil (.md)");
      return;
    }

    setIsLoading(true);
    setUploadedFile(file);

    try {
      const content = await file.text();
      setFileContent(content);
    } catch (error) {
      console.error("Error reading file:", error);
      alert("Fel vid läsning av fil");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.name.endsWith(".md")) {
      const fakeEvent = {
        target: { files: [file] },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileUpload(fakeEvent);
    }
  };

  const parseMarkdownContent = (content: string) => {
    // Simple markdown parser for display
    const lines = content.split("\n");
    const parsedContent = lines.map((line, index) => {
      if (line.startsWith("# ")) {
        return (
          <h1
            key={index}
            className="text-2xl font-bold text-gray-800 mt-6 mb-4"
          >
            {line.substring(2)}
          </h1>
        );
      } else if (line.startsWith("## ")) {
        return (
          <h2
            key={index}
            className="text-xl font-semibold text-gray-700 mt-5 mb-3"
          >
            {line.substring(3)}
          </h2>
        );
      } else if (line.startsWith("### ")) {
        return (
          <h3
            key={index}
            className="text-lg font-medium text-gray-600 mt-4 mb-2"
          >
            {line.substring(4)}
          </h3>
        );
      } else if (line.startsWith("- ")) {
        return (
          <li key={index} className="ml-4 text-gray-600">
            {line.substring(2)}
          </li>
        );
      } else if (line.startsWith("|")) {
        return (
          <div
            key={index}
            className="font-mono text-sm text-gray-500 bg-gray-50 p-2 rounded"
          >
            {line}
          </div>
        );
      } else if (line.trim() === "") {
        return <br key={index} />;
      } else {
        return (
          <p key={index} className="text-gray-600 mb-2">
            {line}
          </p>
        );
      }
    });
    return parsedContent;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-800">Lärdomar</h2>
        <p className="text-gray-600 mt-1">
          Ladda upp och hantera lärdomar från Markdown-filer
        </p>
      </div>

      {/* File Upload */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Ladda upp MD-fil
        </h3>

        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors duration-200"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
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
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <div className="mt-4">
            <label htmlFor="file-upload" className="cursor-pointer">
              <span className="mt-2 block text-sm font-medium text-gray-900">
                {isLoading
                  ? "Laddar upp..."
                  : "Klicka för att välja fil eller dra och släpp här"}
              </span>
              <span className="mt-1 block text-sm text-gray-500">
                Endast .md-filer accepteras
              </span>
            </label>
            <input
              ref={fileInputRef}
              id="file-upload"
              name="file-upload"
              type="file"
              accept=".md"
              className="sr-only"
              onChange={handleFileUpload}
              disabled={isLoading}
            />
          </div>
        </div>

        {uploadedFile && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-green-400 mr-2"
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
              <span className="text-sm font-medium text-green-800">
                Fil uppladdad: {uploadedFile.name}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* File Content Display */}
      {fileContent && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Filinnehåll
              </h3>
              <ExportButton
                data={fileContent}
                filename="larom_export"
                title="Lärdomar Export"
                className="text-sm"
              />
            </div>

            <div className="prose max-w-none">
              {parseMarkdownContent(fileContent)}
            </div>
          </div>

          {/* Analysis */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Filanlys
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {fileContent.split("\n").length}
                </div>
                <div className="text-sm text-gray-600">Rader</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {fileContent.split(" ").length}
                </div>
                <div className="text-sm text-gray-600">Ord</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {fileContent.length}
                </div>
                <div className="text-sm text-gray-600">Tecken</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!fileContent && (
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Ingen fil uppladdad
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Ladda upp en Markdown-fil för att visa innehållet och analysera den.
          </p>
        </div>
      )}
    </div>
  );
}
