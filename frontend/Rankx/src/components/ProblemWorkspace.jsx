import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";

export default function ProblemWorkspace({ problem }) {
  const navigate = useNavigate();
  const workspaceRef = useRef(null);
  const editorRef = useRef(null);

  const [activeTab, setActiveTab] = useState("question");

  // 🔹 Language + Editor
  const [languageKey, setLanguageKey] = useState("");
  const [editorLanguage, setEditorLanguage] = useState("python");
  const [code, setCode] = useState("");

  // 🔹 Starter code cache
  const [starterCodeMap, setStarterCodeMap] = useState({});

  const [output, setOutput] = useState("");
  const [isDark, setIsDark] = useState(true);
  const [showConsole, setShowConsole] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  /* ---------- navigation ---------- */
  const goPrev = () => {
    if (problem.id > 1) {
      navigate(`/problems/${problem.id - 1}`);
    }
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

  /* ---------- INIT LANGUAGES + TEMPLATES ---------- */
  useEffect(() => {
    if (problem?.languages?.length > 0) {
      // build starter code map
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

          {/* Tabs */}
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

          {/* Content */}
          <div className="p-5 overflow-y-auto leading-relaxed">
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

          {/* Toolbar */}
          <div className="flex justify-between items-center px-4 py-2 border-b border-gray-700">
            <select
              value={languageKey}
              onChange={(e) => {
                const selectedKey = e.target.value;
                setLanguageKey(selectedKey);

                const lang = problem.languages.find(
                  l => l.languageKey === selectedKey
                );
                setEditorLanguage(lang.editorMode);
                setCode(starterCodeMap[selectedKey] || "");
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
              {/* 🔁 RESET TO STARTER CODE */}
              <button
                onClick={() => setCode(starterCodeMap[languageKey] || "")}
                className="icon-btn"
                title="Reset to Starter Code"
              >
                ↺
              </button>

              <button onClick={toggleFullscreen} className="icon-btn" title="Fullscreen">
                ⛶
              </button>
            </div>
          </div>

          {/* Editor + Console */}
          <div className="flex flex-col flex-1 overflow-hidden">

            {/* EDITOR */}
            <div
              className={`transition-all duration-200 ${
                showConsole ? "h-[calc(100%-160px)]" : "h-full"
              }`}
            >
              <Editor
                height="100%"
                theme={isDark ? "vs-dark" : "light"}
                language={editorLanguage}
                value={code}
                onChange={setCode}
                onMount={(editor) => (editorRef.current = editor)}
              />
            </div>

            {/* CONSOLE */}
            {showConsole && (
              <div className="h-40 bg-black border-t border-gray-700 p-3 text-sm overflow-auto">
                <strong>Console Output</strong>
                <pre className="mt-2 whitespace-pre-wrap">
                  {output || "No output yet"}
                </pre>
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="flex justify-between items-center px-4 py-2 border-t border-gray-700">
            <button
              onClick={() => setShowConsole(!showConsole)}
              className="icon-btn"
              title="Toggle Console"
            >
              🖥️
            </button>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setOutput("Sample test case output...");
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
