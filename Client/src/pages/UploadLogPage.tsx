import React, { useState } from "react";
import { useAuth } from "../AuthContext";

const UploadLogPage: React.FC = () => {
  const { token } = useAuth();

  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    if (selected && !selected.name.match(/\.(log|txt)$/i)) {
      setError("Можно загружать только .log или .txt файлы");
      setFile(null);
    } else {
      setError(null);
      setFile(selected);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !token) return;

    setMessage(null);
    setError(null);
    setLoading(true);

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
      if (!res.ok) {
        setError(data.error || "Ошибка загрузки");
      } else {
        setMessage(`Лог успешно загружен. ID: ${data.log_id}`);
        setFile(null);
      }
    } catch (err) {
      setError("Сервер недоступен");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Загрузка лог-файла</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" accept=".log,.txt" onChange={handleFileChange} />
        <br />
        <button type="submit" disabled={!file || loading}>
          {loading ? "Загрузка..." : "Проанализировать"}
        </button>
      </form>
      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default UploadLogPage;
