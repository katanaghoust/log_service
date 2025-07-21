import React from "react";
import { useAuth } from "../AuthContext";
import { useLogs } from "../hooks/useLogs";

const LogsPage: React.FC = () => {
  const { token } = useAuth();
  const { logs, loading, error } = useLogs(token);

  if (!token) return <p>Нет доступа</p>;
  if (loading) return <p>Загрузка логов...</p>;
  if (error) return <p>Ошибка: {error}</p>;

  return (
    <div>
      <h2>Ваши лог-файлы</h2>
      <ul>
        {logs.map((log) => (
          <li key={log.id}>{log.filename}</li>
        ))}
      </ul>
    </div>
  );
};

export default LogsPage;
