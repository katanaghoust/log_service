import React, { useState } from "react";
import { useAuth } from "../AuthContext";

const ExportLogsPage: React.FC = () => {
  const { token } = useAuth();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");

  const handleExport = async () => {
    setError("");

    const res = await fetch("http://localhost:5000/api/logs/export-pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ start_date: startDate, end_date: endDate }),
    });

    if (res.status === 404) {
      setError("Нет логов в заданном диапазоне");
      return;
    }

    if (!res.ok) {
      setError("Ошибка при создании PDF");
      return;
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "logs_report.pdf";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center px-4">
      <h1 className="text-3xl font-bold mb-6">Экспорт логов в PDF</h1>

      <div className="flex flex-col gap-4 w-full max-w-md">
        <label className="flex flex-col">
          Начальная дата:
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="p-2 rounded bg-gray-800 text-white mt-1"
          />
        </label>

        <label className="flex flex-col">
          Конечная дата:
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="p-2 rounded bg-gray-800 text-white mt-1"
          />
        </label>

        <button
          onClick={handleExport}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded"
        >
          Скачать PDF
        </button>

        {error && <p className="text-red-400 text-sm">{error}</p>}
      </div>
    </div>
  );
};

export default ExportLogsPage;
