// Client/src/pages/UserDashboard.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleAnalyzeClick = () => {
    navigate("/analyze");
  };

  return (
    <div>
      <h1>Личный кабинет пользователя</h1>
      <p>Здесь пользователь увидит свои логи и загрузки</p>
      <button onClick={handleAnalyzeClick}>Анализ</button>
    </div>
  );
};

export default UserDashboard;
