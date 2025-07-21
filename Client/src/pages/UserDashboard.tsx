import React from "react";
import { useNavigate } from "react-router-dom";

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center gap-6 px-4">
      <h1 className="text-3xl font-bold">Личный кабинет пользователя</h1>

      <div className="flex flex-col gap-4 w-full max-w-sm">
        <button
          onClick={() => navigate("/analyze")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded"
        >
          Загрузить и проанализировать лог
        </button>

        <button
          onClick={() => navigate("/logs")}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded"
        >
          Мои лог-файлы
        </button>

        <button
          onClick={() => navigate("/export")}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded"
        >
          Сформировать PDF
        </button>
      </div>
    </div>
  );
};

export default UserDashboard;
