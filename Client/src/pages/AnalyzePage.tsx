import React, { useState } from "react";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";

const AnalyzePage: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(null);
    setError(null);
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !token) return;

    const formData = new FormData();
    formData.append("file", file);

    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/logs/analyze", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Ошибка анализа");
      } else {
        setMessage(data.message || "Файл успешно проанализирован");
        setTimeout(() => navigate("/dashboard"), 2000);
      }
    } catch (err) {
      setError("Ошибка отправки запроса");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>Анализ лог-файла</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" accept=".txt,.log" onChange={handleFileChange} required />
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Анализ..." : "Проанализировать"}
        </button>
      </form>
      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default AnalyzePage;
