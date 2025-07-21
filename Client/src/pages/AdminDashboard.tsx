// Client/src/pages/AdminDashboard.tsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  is_trusted: boolean;
}

const AdminDashboard: React.FC = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchId, setSearchId] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Ошибка загрузки пользователей");
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleTrust = async (userId: number, is_trusted: boolean) => {
    try {
      await fetch(`http://localhost:5000/api/admin/users/${userId}/trust`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_trusted: !is_trusted }),
      });
      fetchUsers();
    } catch (err) {
      alert("Ошибка при обновлении статуса пользователя");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) =>
    searchId ? u.id.toString() === searchId : true
  );

  return (
    <div>
      <h1>Панель администратора</h1>
      <p>Список пользователей и управление доступом</p>

      <input
        type="text"
        placeholder="Поиск по ID"
        value={searchId}
        onChange={(e) => setSearchId(e.target.value)}
      />

      {loading ? (
        <p>Загрузка пользователей...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <ul>
          {filteredUsers.map((user) => (
            <li key={user.id}>
              <strong>{user.username}</strong> (ID: {user.id}) — {user.email} — Роль: {user.role} — Доверен: {user.is_trusted ? "Да" : "Нет"}
              <button onClick={() => toggleTrust(user.id, user.is_trusted)}>
                {user.is_trusted ? "Отключить" : "Принять"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminDashboard;
