import { useState } from "react";

const OPTION_KEYS = ["A", "B", "C", "D"];

const buildForm = (initialData) => ({
  questionText: initialData?.questionText || "",
  optionA: initialData?.optionA || "",
  optionB: initialData?.optionB || "",
  optionC: initialData?.optionC || "",
  optionD: initialData?.optionD || "",
  correctOption: initialData?.correctOption || "",
});

const QuestionForm = ({ initialData = null, onSubmit, submitting = false }) => {
  const [form, setForm] = useState(() => buildForm(initialData));
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = () => {
    if (!form.questionText.trim()) {
      setError("Question text is required");
      return;
    }

    for (const key of ["optionA", "optionB", "optionC", "optionD"]) {
      if (!form[key].trim()) {
        setError("All options are required");
        return;
      }
    }

    if (!OPTION_KEYS.includes(form.correctOption)) {
      setError("Please select the correct option");
      return;
    }

    onSubmit(form);
  };

  return (
    <div className="surface-card space-y-6">
      <div>
        <label htmlFor="question-text" className="field-label">
          Question
        </label>
        <textarea
          id="question-text"
          name="questionText"
          value={form.questionText}
          onChange={handleChange}
          className="input-base min-h-32 resize-y"
          rows={4}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {OPTION_KEYS.map((key) => (
          <div key={key}>
            <label htmlFor={`option-${key}`} className="field-label">
              Option {key}
            </label>
            <input
              id={`option-${key}`}
              name={`option${key}`}
              value={form[`option${key}`]}
              onChange={handleChange}
              className="input-base"
            />
          </div>
        ))}
      </div>

      <fieldset>
        <legend className="field-label">Correct option</legend>
        <div className="grid gap-3 sm:grid-cols-4">
          {OPTION_KEYS.map((key) => (
            <label
              key={key}
              className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
                form.correctOption === key
                  ? "border-sky-300/25 bg-sky-400/10 text-white"
                  : "border-white/8 bg-white/[0.03] text-slate-300 hover:border-white/12"
              }`}
            >
              <input
                type="radio"
                name="correctOption"
                value={key}
                checked={form.correctOption === key}
                onChange={handleChange}
                className="h-4 w-4 border-white/15 bg-slate-900 text-sky-400 focus:ring-sky-400"
              />
              <span>{key}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {error ? (
        <div role="alert" className="rounded-2xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      <button type="button" onClick={handleSubmit} disabled={submitting} className="btn-primary w-full">
        {submitting ? "Saving..." : "Save question"}
      </button>
    </div>
  );
};

export default QuestionForm;
