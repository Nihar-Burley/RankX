import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import api from "../services/api";
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

  // 🔹 Testcase Drawer State (NEW)
  const [testTab, setTestTab] = useState("testcase"); // testcase | output
  const [sampleTestCases, setSampleTestCases] = useState([]);
  const [activeTestCase, setActiveTestCase] = useState(0);

  // 🔹 Custom Testcase (NEW)
  const [customInput, setCustomInput] = useState("");

  // Sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [problems, setProblems] = useState([]);
  const [search, setSearch] = useState("");

  /* ---------- fetch problem list ---------- */
  useEffect(() => {
    api.get("/problems")
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


  /* ---------- fetch sample testcases ---------- */
  useEffect(() => {
    if (!problem?.id) return;

    api
      .get(`/problems/${problem.id}/testcases/samples`)
      .then(res => {
        setSampleTestCases(res.data || []);
        setActiveTestCase(0);
      })
      .catch(err => console.error("Failed to load testcases", err));
  }, [problem?.id]);


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



  // ================= RUN HANDLER =================
  const handleRun = async () => {
    try {
      setOutput("Running...");
      setShowConsole(true);
      setTestTab("output");

      const res = await api.post("/submissions/run", {
        problemId: problem.id,
        languageKey,
        sourceCode: code,
      });

      const formatted = res.data.results
        .map((r, i) =>
          `Case ${i + 1}:\n` +
          `Input:\n${r.input}\n\n` +
          `Expected Output:\n${r.expectedOutput}\n\n` +
          `Your Output:\n${r.actualOutput}\n\n` +
          `Result: ${r.passed ? "✅ Passed" : "❌ Failed"}\n`
        )
        .join("\n-----------------\n");

      setOutput(formatted);
    } catch (err) {
      console.error(err);
      setOutput(
        err.response?.data?.message ||
        "❌ Error while running code"
      );
    }
  };

  // ================= SUBMIT HANDLER =================
const handleSubmit = async () => {
  try {
    setOutput("Submitting...");
    setShowConsole(true);
    setTestTab("output");

    const res = await api.post("/submissions/submit", {
      problemId: problem.id,
      userId: 1, // TODO: from auth later
      languageKey,
      sourceCode: code,
    });

    const { submissionId, verdict, results } = res.data;

    let outputText = `📨 Submission ID: ${submissionId}\n\n`;

    // --- Testcase-wise result ---
    results.forEach(tc => {
      outputText +=
        `Hidden Test Case ${tc.index}: ` +
        `${tc.passed ? "✅ Passed" : "❌ Failed"}\n`;
    });

    // --- Final verdict ---
    outputText += `\n====================\n`;
    outputText += `FINAL VERDICT: ${
      verdict === "ACCEPTED" ? "✅ ACCEPTED" : "❌ " + verdict
    }\n`;

    setOutput(outputText);
  } catch (err) {
    console.error(err);
    setOutput(
      err.response?.data?.message ||
      "❌ Error while submitting code"
    );
  }
};



  return (
    <div
      ref={workspaceRef}
      className={`h-screen flex flex-col ${isDark ? "bg-[#1e1e1e] text-gray-200" : "bg-gray-100 text-gray-900"
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
                className={`capitalize pb-1 ${activeTab === tab
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
          </div>
        </div>

        {/* ================= RIGHT PANEL ================= */}
        {/* 🔑 made relative (required for overlay drawer) */}
        <div className="w-1/2 flex flex-col relative">

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

          {/* ================= EDITOR ================= */}
          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              theme={isDark ? "vs-dark" : "light"}
              language={editorLanguage}
              value={code}
              onChange={setCode}
              onMount={(editor) => (editorRef.current = editor)}
            />
          </div>

          {/* ================= LEETCODE TESTCASE DRAWER ================= */}
          <div
            className={`absolute left-0 right-0 bottom-[56px] z-20
      transition-transform duration-300 ease-in-out
      ${showConsole ? "translate-y-0" : "translate-y-full"}
    `}
            style={{ height: "260px" }}
          >
            <div className="h-full bg-[#1e1e1e] border-t border-gray-700 flex flex-col">

              {/* Tabs */}
              <div className="flex gap-6 px-4 py-2 border-b border-gray-700">
                <button
                  onClick={() => setTestTab("testcase")}
                  className={`pb-1 ${testTab === "testcase"
                    ? "border-b-2 border-green-500 text-white"
                    : "text-gray-400"
                    }`}
                >
                  Testcase
                </button>

                <button
                  onClick={() => setTestTab("output")}
                  className={`pb-1 ${testTab === "output"
                    ? "border-b-2 border-green-500 text-white"
                    : "text-gray-400"
                    }`}
                >
                  Output
                </button>

                <button
                  onClick={() => setTestTab("custom")}
                  className={`pb-1 ${testTab === "custom"
                    ? "border-b-2 border-green-500 text-white"
                    : "text-gray-400"
                    }`}
                >
                  Custom Testcase
                </button>

              </div>

              {/* Case selector */}
              {testTab === "testcase" && (
                <div className="flex gap-2 px-4 py-2 border-b border-gray-700">
                  {sampleTestCases.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveTestCase(idx)}
                      className={`px-3 py-1 text-sm rounded ${activeTestCase === idx
                        ? "bg-[#2d2d2d] text-white"
                        : "text-gray-400 hover:bg-[#2d2d2d]"
                        }`}
                    >
                      Case {idx + 1}
                    </button>
                  ))}
                </div>
              )}

              {/* Content */}
              <div className="flex-1 p-4 overflow-y-auto text-sm">

                {/* TESTCASE TAB */}
                {testTab === "testcase" && sampleTestCases[activeTestCase] && (
                  <>
                    <div className="text-gray-400 mb-1">Input:</div>
                    <pre className="bg-[#1a1a1a] p-3 rounded whitespace-pre-wrap text-gray-200">
                      {sampleTestCases[activeTestCase].input}
                    </pre>

                    <div className="text-gray-400 mt-4 mb-1">Expected Output:</div>
                    <pre className="bg-[#1a1a1a] p-3 rounded whitespace-pre-wrap text-gray-200">
                      {sampleTestCases[activeTestCase].expectedOutput}
                    </pre>
                  </>
                )}

                {/* OUTPUT TAB */}
                {testTab === "output" && (
                  <pre className="bg-black p-3 rounded text-green-400 whitespace-pre-wrap">
                    {output || "Run the code to see output"}
                  </pre>
                )}

                {/* CUSTOM TESTCASE TAB */}
                {testTab === "custom" && (
                  <div className="flex flex-col gap-3">
                    <div className="text-gray-400 text-sm">
                      Custom Input:
                    </div>

                    <textarea
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      placeholder={
                        sampleTestCases.length > 0
                          ? `Example (from sample testcase):\n\n${sampleTestCases[0].input}`
                          : "Enter input exactly as stdin"
                      }
                      className="w-full h-32 bg-[#1a1a1a] text-gray-200 p-3 rounded resize-none outline-none border border-gray-700 focus:border-green-500"
                    />


                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          // TEMP: frontend-only
                          setOutput("Running with custom input...\n\n" + customInput);
                          setTestTab("output");
                          setShowConsole(true);
                        }}
                        className="px-4 py-1 bg-green-600 rounded text-white text-sm"
                      >
                        Run Custom Input
                      </button>
                    </div>
                  </div>
                )}


              </div>
            </div>
          </div>


          {/* ================= ACTION BAR ================= */}
          <div className="flex justify-between items-center px-4 py-2 border-t border-gray-700 relative z-40 bg-[#1e1e1e]">

            <button
              onClick={() => setShowConsole(!showConsole)}
              className="icon-btn"
              title="Toggle Testcases"
            >
              🖥️
            </button>

            <div className="flex gap-3">
              <button
                onClick={handleRun}
                className="px-4 py-1 bg-gray-600 rounded"
              >
                Run
              </button>

              <button
                onClick={handleSubmit}
                className="px-4 py-1 bg-green-600 rounded"
              >
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
