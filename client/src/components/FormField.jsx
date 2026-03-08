export default function FormField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  className = "",
  inputClassName = "",
  ...props
}) {
  return (
    <div className={`flex flex-col ${className}`}>
      <label className="text-neutral-500 text-xs mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`bg-neutral-900 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-400 text-base ${inputClassName}`}
        {...props}
      />
    </div>
  );
}
