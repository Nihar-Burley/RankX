import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function ProblemList() {
  const [problems, setProblems] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
  api.get("/problems")
    .then(res => {
      setProblems(res.data.content || []);
    })
    .catch(err => {
      console.error(err);
      if (err.response?.status === 401) {
        navigate("/login"); // token expired / missing
      }
    });
}, [navigate]);


  const difficultyColor = (level) => {
    switch (level) {
      case "EASY":
        return "text-green-400 bg-green-900/40";
      case "MEDIUM":
        return "text-yellow-400 bg-yellow-900/40";
      case "HARD":
        return "text-red-400 bg-red-900/40";
      default:
        return "text-gray-400 bg-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6 text-gray-200">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6">
        <h1 className="text-3xl font-bold mb-2 text-white">Problems</h1>
        <p className="text-gray-400">
          Practice coding problems and improve your skills
        </p>
      </div>

      {/* Search */}
      <div className="max-w-6xl mx-auto mb-4">
        <input
          type="text"
          placeholder="Search problems..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 
                     text-gray-200 placeholder-gray-500 
                     outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Table Card */}
      <div className="max-w-6xl mx-auto bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700 border-b border-gray-600">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-300">
                Title
              </th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-300">
                Difficulty
              </th>
            </tr>
          </thead>

          <tbody>
            {problems
              .filter(p =>
                p.title.toLowerCase().includes(search.toLowerCase())
              )
              .map((p, idx) => (
                <tr
                  key={p.id}
                  onClick={() => navigate(`/problems/${p.id}`)}
                  className="cursor-pointer border-b border-gray-700 
                             hover:bg-gray-700 transition"
                >
                  <td className="px-6 py-4 font-medium text-gray-100">
                    {idx + 1}. {p.title}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${difficultyColor(
                        p.difficulty
                      )}`}
                    >
                      {p.difficulty}
                    </span>
                  </td>
                </tr>
              ))}

            {problems.length === 0 && (
              <tr>
                <td
                  colSpan="2"
                  className="text-center py-8 text-gray-400"
                >
                  No problems found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
