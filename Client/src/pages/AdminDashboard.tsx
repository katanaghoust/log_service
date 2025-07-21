import React, { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";

type User = {
  id: number;
  username: string;
  email: string;
  is_trusted: boolean;
};

const AdminDashboard: React.FC = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [searchId, setSearchId] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) {
        const sorted = data.sort((a: User, b: User) => a.id - b.id);
        setUsers(sorted);
      } else {
        console.error(data.error);
      }
    } catch (error) {
      console.error("Ошибка при загрузке пользователей", error);
    }
  };

  const toggleTrust = async (id: number, newStatus: boolean) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${id}/trust`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_trusted: newStatus }),
      });

      if (res.ok) {
        await fetchUsers(); // обновляем список после изменения
      } else {
        const data = await res.json();
        console.error(data.error);
      }
    } catch (error) {
      console.error("Ошибка при обновлении пользователя", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) =>
    searchId === "" ? true : user.id.toString().includes(searchId)
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
      <div className="max-w-4xl w-full bg-gray-800 p-8 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold mb-6 text-center">Панель администратора</h1>

        <div className="mb-4 text-center">
          <input
            type="text"
            placeholder="Поиск по ID"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className="p-2 w-1/2 rounded bg-gray-700 text-white text-center outline-none"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead>
              <tr>
                <th className="p-2">ID</th>
                <th className="p-2">Имя</th>
                <th className="p-2">Email</th>
                <th className="p-2">Доступ</th>
                <th className="p-2">Действие</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="bg-gray-700 rounded">
                  <td className="p-2 rounded-l-lg">{user.id}</td>
                  <td className="p-2">{user.username}</td>
                  <td className="p-2">{user.email}</td>
                  <td className="p-2">
                    {user.is_trusted ? (
                      <span className="text-green-400 font-semibold">✔️ Доступен</span>
                    ) : (
                      <span className="text-red-400 font-semibold">⛔ Нет доступа</span>
                    )}
                  </td>
                  <td className="p-2 rounded-r-lg">
                    <button
                      onClick={() => toggleTrust(user.id, !user.is_trusted)}
                      className={`px-4 py-1 rounded transition duration-300 ${
                        user.is_trusted
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      {user.is_trusted ? "Kick" : "Accept"}
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-gray-400">
                    Пользователи не найдены
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
