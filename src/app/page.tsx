"use client";

import { useState } from "react";
import TabNavigation from "@/components/TabNavigation";
import StartlistaTab from "@/components/tabs/StartlistaTab";
import UtokadTab from "@/components/tabs/UtokadTab";
import ResultatTab from "@/components/tabs/ResultatTab";
import LaromTab from "@/components/tabs/LaromTab";

export default function Home() {
  const [activeTab, setActiveTab] = useState("startlista");

  const renderTabContent = () => {
    switch (activeTab) {
      case "startlista":
        return <StartlistaTab />;
      case "utokad":
        return <UtokadTab />;
      case "resultat":
        return <ResultatTab />;
      case "larom":
        return <LaromTab />;
      default:
        return <StartlistaTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-800 to-blue-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">🏇 Travassistenten</h1>
            <p className="text-xl text-blue-200">
              Din personliga V75-analys och speltips-assistent
            </p>
            <p className="text-sm text-blue-300 mt-2">
              V75 den 13 september 2025
            </p>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">{renderTabContent()}</main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-gray-300 mb-2">
              Travassistenten - Din digitala hjälp för V75-analys
            </p>
            <p className="text-sm text-gray-400">
              Utvecklad för professionell travanalys och speltips
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
