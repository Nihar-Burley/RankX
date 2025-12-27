import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

export default function ProblemWorkspace({ problem }) {
  const navigate = useNavigate();
  const workspaceRef = useRef(null);
  const editorRef = useRef(null);

  const [activeTab, setActiveTab] = useState("question");

  // Editor
  const [languageKey, setLanguageKey] = useState("");
  const [editorLanguage, setEditorLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [starterCodeMap, setStarterCodeMap] = useState({});

  // UI state
  const [output, setOutput] = useState("");
  const [isDark, setIsDark] = useState(true);
  const [showConsole, setShowConsole] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [problems, setProblems] = useState([]);
  const [search, setSearch] = useState("");

  /* ---------- fetch problem list ---------- */
  useEffect(() => {
    axios.get("/api/problems")
      .then(res => setProblems(res.data.content || []));
  }, []);

  /* ---------- navigation ---------- */
  const goPrev = () => {
    if (problem.id > 1) navigate(`/problems/${problem.id - 1}`);
  };

  const goNext = () => {
    navigate(`/problems/${problem.id + 1}`);
  };

  /* ---------- fullscreen ---------- */
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      workspaceRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handler = () => {
      if (!document.fullscreenElement) setIsFullscreen(false);
    };
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  /* ---------- init language + starter code ---------- */
  useEffect(() => {
    if (problem?.languages?.length > 0) {
      const map = {};
      problem.templates.forEach(t => {
        map[t.languageKey] = t.starterCode;
      });
      setStarterCodeMap(map);

      const defaultLang = problem.languages[0];
      setLanguageKey(defaultLang.languageKey);
      setEditorLanguage(defaultLang.editorMode);
      setCode(map[defaultLang.languageKey] || "");
    }
  }, [problem]);

  return (
    <div
      ref={workspaceRef}
      className={`h-screen flex flex-col ${
        isDark ? "bg-[#1e1e1e] text-gray-200" : "bg-gray-100 text-gray-900"
      }`}
    >

      {/* ================= NAVBAR ================= */}
      {!isFullscreen && (
        <div className="flex justify-between items-center px-6 py-3 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <button onClick={() => setSidebarOpen(true)} className="nav-icon">☰</button>
            <button onClick={goPrev} className="nav-icon">⟵</button>
            <button onClick={goNext} className="nav-icon">⟶</button>
            <span className="ml-4 font-semibold">{problem.title}</span>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setIsDark(!isDark)} className="nav-icon">
              {isDark ? "🌙" : "☀️"}
            </button>
            <button className="px-4 py-1 bg-green-600 rounded text-white">
              Sign Up
            </button>
          </div>
        </div>
      )}

      {/* ================= BODY ================= */}
      <div className="flex flex-1 overflow-hidden">

        {/* ================= LEFT PANEL ================= */}
        <div className="w-1/2 border-r border-gray-700 flex flex-col">
          <div className="flex gap-6 px-4 py-3 border-b border-gray-700">
            {["question", "solution", "submissions", "notes"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`capitalize pb-1 ${
                  activeTab === tab
                    ? "border-b-2 border-green-500 text-white"
                    : "text-gray-400"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-5 overflow-y-auto">
            {activeTab === "question" && (
              <>
                <h2 className="text-2xl font-bold">{problem.title}</h2>
                <span className="inline-block mt-2 px-2 py-1 bg-green-600 rounded text-sm">
                  {problem.difficulty}
                </span>
                <p className="mt-4">{problem.statement}</p>
                <h3 className="mt-6 font-semibold">Constraints</h3>
                <p className="text-gray-400">{problem.constraints}</p>
              </>
            )}
            {activeTab !== "question" && (
              <p className="text-gray-400">Coming soon...</p>
            )}
          </div>
        </div>

        {/* ================= RIGHT PANEL ================= */}
        <div className="w-1/2 flex flex-col">

          <div className="flex justify-between items-center px-4 py-2 border-b border-gray-700">
            <select
              value={languageKey}
              onChange={(e) => {
                const key = e.target.value;
                setLanguageKey(key);
                const lang = problem.languages.find(l => l.languageKey === key);
                setEditorLanguage(lang.editorMode);
                setCode(starterCodeMap[key] || "");
              }}
              className="bg-[#2d2d2d] px-2 py-1 rounded"
            >
              {problem.languages.map(lang => (
                <option key={lang.languageKey} value={lang.languageKey}>
                  {lang.displayName}
                </option>
              ))}
            </select>

            <div className="flex gap-3">
              <button
                onClick={() => setCode(starterCodeMap[languageKey] || "")}
                className="icon-btn"
              >
                ↺
              </button>
              <button onClick={toggleFullscreen} className="icon-btn">⛶</button>
            </div>
          </div>

          <div className="flex flex-col flex-1 overflow-hidden">
            <Editor
              height="100%"
              theme={isDark ? "vs-dark" : "light"}
              language={editorLanguage}
              value={code}
              onChange={setCode}
              onMount={(editor) => (editorRef.current = editor)}
            />
          </div>

          <div className="flex justify-between items-center px-4 py-2 border-t border-gray-700">
            <button
              onClick={() => setShowConsole(!showConsole)}
              className="icon-btn"
            >
              🖥️
            </button>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setOutput("Sample output...");
                  setShowConsole(true);
                }}
                className="px-4 py-1 bg-gray-600 rounded"
              >
                Run
              </button>
              <button className="px-4 py-1 bg-green-600 rounded">
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= SIDEBAR ================= */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black z-40"
            />

            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3 }}
              className="fixed top-0 left-0 z-50 h-full w-80 bg-[#1e1e1e] border-r border-gray-700"
            >
              <div className="flex justify-between items-center px-4 py-3 border-b border-gray-700">
                <h2 className="font-semibold">Problems</h2>
                <button onClick={() => setSidebarOpen(false)} className="icon-btn">✕</button>
              </div>

              <div className="p-4">
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search problems..."
                  className="w-full px-3 py-2 rounded bg-[#2d2d2d] text-gray-200"
                />
              </div>

              <div className="overflow-y-auto">
                {problems
                  .filter(p => p.title.toLowerCase().includes(search.toLowerCase()))
                  .map((p, idx) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        navigate(`/problems/${p.id}`);
                        setSidebarOpen(false);
                      }}
                      className={`px-4 py-3 cursor-pointer border-b border-gray-700
                        hover:bg-[#2d2d2d]
                        ${p.id === problem.id ? "text-green-400 bg-[#2d2d2d]" : ""}`}
                    >
                      <span className="mr-2 text-gray-400">{idx + 1}.</span>
                      {p.title}
                    </div>
                  ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ================= STYLES ================= */}
      <style>{`
        .nav-icon {
          padding: 6px 10px;
          border-radius: 6px;
          background: #2d2d2d;
        }
        .nav-icon:hover {
          background: #3d3d3d;
        }
        .icon-btn {
          padding: 6px 8px;
          background: #2d2d2d;
          border-radius: 6px;
        }
        .icon-btn:hover {
          background: #3d3d3d;
        }
      `}</style>
    </div>
  );
}
  