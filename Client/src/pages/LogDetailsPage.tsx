import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../AuthContext";

interface LogEntry {
  id: number;
  version: string;
  bandwidth: number;
  freq_start: number;
  freq_end: number;
  circle_num: number;
  detected_freq: number;
  timestamp: string;
  logfile_id: number;
  created_at: string;
}

const LogDetailsPage: React.FC = () => {
  const { token } = useAuth();
  const { logfileId } = useParams();
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !logfileId) return;

    const fetchEntries = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/logs/${logfileId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(`Ошибка: ${res.status}`);
        }

        const data = await res.json();
        setEntries(data);
      } catch (err: any) {
        setError(err.message || "Ошибка загрузки");
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, [token, logfileId]);

  if (!token) return <p className="text-white text-center mt-10">Нет доступа</p>;
  if (loading) return <p className="text-white text-center mt-10">Загрузка логов...</p>;
  if (error) return <p className="text-red-500 text-center mt-10">Ошибка: {error}</p>;

  if (entries.length === 0) {
    return <p className="text-center text-white mt-10">Нет записей в этом лог-файле</p>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">Детали лог-файла #{logfileId}</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-800 rounded shadow">
          <thead>
            <tr className="bg-gray-700 text-left text-sm uppercase text-gray-300">
              <th className="px-4 py-2">Время</th>
              <th className="px-4 py-2">Версия</th>
              <th className="px-4 py-2">Ширина</th>
              <th className="px-4 py-2">Частота от</th>
              <th className="px-4 py-2">Частота до</th>
              <th className="px-4 py-2">Окруж.</th>
              <th className="px-4 py-2">Обнаружено</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="border-b border-gray-700 hover:bg-gray-700">
                <td className="px-4 py-2">{new Date(entry.timestamp).toLocaleString()}</td>
                <td className="px-4 py-2">{entry.version}</td>
                <td className="px-4 py-2">{entry.bandwidth}</td>
                <td className="px-4 py-2">{entry.freq_start}</td>
                <td className="px-4 py-2">{entry.freq_end}</td>
                <td className="px-4 py-2">{entry.circle_num}</td>
                <td className="px-4 py-2">{entry.detected_freq}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LogDetailsPage;
