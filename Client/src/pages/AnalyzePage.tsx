import React, { useState } from "react";
import { useAuth } from "../AuthContext";
import { motion } from "framer-motion";

const AnalyzePage: React.FC = () => {
  const { token } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
    setMessage(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) return;

    if (!file.name.endsWith(".txt") && !file.name.endsWith(".log")) {
      setError("Можно загружать только .txt или .log файлы");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:5000/api/logs/analyze", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        setFile(null);
      } else {
        setError(data.error || "Ошибка при анализе");
      }
    } catch (err) {
      setError("Ошибка отправки файла");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-gray-800 p-8 rounded-2xl shadow-lg w-full max-w-xl text-center"
      >
        <h2 className="text-2xl font-bold mb-4">Загрузка и анализ лога</h2>

        <input
          type="file"
          accept=".txt,.log"
          onChange={handleFileChange}
          className="mb-4 w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
        />

        <button
          onClick={handleUpload}
          disabled={!file}
          className="bg-blue-600 hover:bg-blue-700 transition-all duration-300 px-6 py-2 rounded-lg font-semibold disabled:opacity-50"
        >
          Проанализировать
        </button>

        {message && <p className="mt-4 text-green-400">{message}</p>}
        {error && <p className="mt-4 text-red-500">{error}</p>}
      </motion.div>
    </div>
  );
};

export default AnalyzePage;
