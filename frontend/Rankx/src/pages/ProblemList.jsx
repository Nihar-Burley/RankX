import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ProblemList() {
  const [problems, setProblems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/problems')
      .then(res => {
        setProblems(res.data.content);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Problems</h1>

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">Title</th>
            <th className="p-2">Difficulty</th>
          </tr>
        </thead>
        <tbody>
          {problems.map(p => (
            <tr
              key={p.id}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => navigate(`/problems/${p.id}`)}
            >
              <td className="p-2">{p.title}</td>
              <td className="p-2">{p.difficulty}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
