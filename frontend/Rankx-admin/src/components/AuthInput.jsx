import { TextField } from "./ui/FormField";

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
    <TextField
      id={inputId}
      label={label}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  );
}
