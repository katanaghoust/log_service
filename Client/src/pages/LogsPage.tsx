import React from "react";
import { useAuth } from "../AuthContext";
import { useLogs } from "../hooks/useLogs";
import { Link } from "react-router-dom";

const LogsPage: React.FC = () => {
  const { token } = useAuth();
  const { logs, loading, error } = useLogs(token);

  if (!token) return <p className="text-center text-white mt-10">Нет доступа</p>;
  if (loading) return <p className="text-center text-white mt-10">Загрузка логов...</p>;
  if (error) return <p className="text-center text-red-500 mt-10">Ошибка: {error}</p>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">Ваши лог-файлы</h2>
      <ul className="max-w-md mx-auto space-y-3">
        {logs.map((log) => (
          <li key={log.id}>
            <Link
              to={`/logs/${log.id}`}
              className="block bg-gray-800 hover:bg-gray-700 transition-colors px-4 py-2 rounded shadow text-blue-400 hover:text-blue-300"
            >
              {log.filename}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LogsPage;
