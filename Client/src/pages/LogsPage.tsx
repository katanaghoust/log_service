import React from "react";
import { useAuth } from "../AuthContext";
import { useLogs } from "../hooks/useLogs";
import { motion } from "framer-motion";

const LogsPage: React.FC = () => {
  const { token } = useAuth();
  const { logs, loading, error } = useLogs(token);

  if (!token) return <p className="text-red-500 text-center mt-8">Нет доступа</p>;
  if (loading) return <p className="text-white text-center mt-8">Загрузка логов...</p>;
  if (error) return <p className="text-red-500 text-center mt-8">Ошибка: {error}</p>;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-3xl w-full bg-gray-800 p-8 rounded-2xl shadow-xl"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Ваши лог-файлы</h2>

        {logs.length === 0 ? (
          <p className="text-center text-gray-400">Логи не найдены.</p>
        ) : (
          <ul className="space-y-3">
            {logs.map((log) => (
              <li
                key={log.id}
                className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition duration-200"
              >
                📄 {log.filename}
              </li>
            ))}
          </ul>
        )}
      </motion.div>
    </div>
  );
};

export default LogsPage;
