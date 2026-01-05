import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import ProblemWorkspace from "../components/ProblemWorkspace";


export default function ProblemDetail() {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);

  useEffect(() => {

    api.get(`/problems/${id}`)
      .then(res => setProblem(res.data));
  }, [id]);

  if (!problem) return <div className="p-4">Loading...</div>;

  return <ProblemWorkspace problem={problem} />;
}
