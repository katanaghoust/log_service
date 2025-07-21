import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const UserDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-xl w-full bg-gray-800 p-8 rounded-2xl shadow-lg text-center"
      >
        <h1 className="text-3xl font-bold mb-4">Личный кабинет</h1>
        <p className="mb-6 text-gray-300">
          Здесь вы можете просматривать свои лог-файлы и выполнять анализ.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/analyze"
            className="bg-blue-600 hover:bg-blue-700 transition-all duration-300 px-6 py-3 rounded-lg font-semibold"
          >
            Анализировать файл
          </Link>
          <Link
            to="/logs"
            className="bg-gray-700 hover:bg-gray-600 transition-all duration-300 px-6 py-3 rounded-lg font-semibold"
          >
            Мои логи
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default UserDashboard;
