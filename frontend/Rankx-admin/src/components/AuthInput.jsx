export default function AuthInput({
  label,
  type,
  placeholder,
  value,
  onChange,
  id,
}) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="field-label">
        {label}
      </label>
      <input
        id={inputId}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="input-base"
      />
    </div>
  );
}
