import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../AuthContext";

type LogEntry = {
  id: number;
  version: string;
  bandwidth: number;
  freq_start: number;
  freq_end: number;
  circle_num: number;
  detected_freq: number;
  timestamp: string;
};

const LogDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !token) return;

    fetch(`http://localhost:5000/api/logs/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка загрузки логов");
        return res.json();
      })
      .then((data) => setEntries(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, token]);

  if (loading) return <p className="text-center mt-10 text-white">Загрузка...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">Детали лог-файла #{id}</h2>
      <div className="overflow-x-auto">
        <table className="table-auto w-full text-sm border border-gray-700">
          <thead className="bg-gray-700 text-gray-200">
            <tr>
              <th className="p-2">ID</th>
              <th className="p-2">Версия</th>
              <th className="p-2">Bandwidth</th>
              <th className="p-2">Нач. частота</th>
              <th className="p-2">Кон. частота</th>
              <th className="p-2">Круг</th>
              <th className="p-2">Засечка</th>
              <th className="p-2">Время</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="text-center border-t border-gray-700">
                <td className="p-2">{entry.id}</td>
                <td className="p-2">{entry.version}</td>
                <td className="p-2">{entry.bandwidth}</td>
                <td className="p-2">{entry.freq_start}</td>
                <td className="p-2">{entry.freq_end}</td>
                <td className="p-2">{entry.circle_num}</td>
                <td className="p-2">{entry.detected_freq}</td>
                <td className="p-2">{new Date(entry.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LogDetailPage;
