// src/components/AuthInput.jsx
export default function AuthInput({
  label,
  type,
  placeholder,
  value,
  onChange,
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-400">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}          // ✅ REQUIRED
        onChange={onChange}    // ✅ REQUIRED
        className="px-4 py-2 rounded-lg bg-[#1a1a1a] text-white
                   border border-gray-700 focus:border-green-500
                   focus:outline-none transition"
      />
    </div>
  );
}
