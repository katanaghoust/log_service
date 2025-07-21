import { useEffect, useState } from "react";

type LogFile = {
  id: number;
  filename: string;
};

export const useLogs = (token: string | null) => {
  const [logs, setLogs] = useState<LogFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    setLoading(true);
    fetch("http://localhost:5000/api/logs", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка загрузки логов");
        return res.json();
      })
      .then((data) => setLogs(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  return { logs, loading, error };
};
