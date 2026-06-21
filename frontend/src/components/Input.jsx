export default function Input({ label, error, id, className = '', ...rest }) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={id} className="text-[0.8rem] font-semibold text-text-secondary">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`
          bg-elevated border rounded-md px-3.5 py-3 text-[0.95rem]
          text-text-primary placeholder:text-text-muted
          transition-colors duration-150 focus:outline-none focus:border-accent
          ${error ? 'border-danger' : 'border-border'} ${className}
        `}
        {...rest}
      />
      {error && <span className="text-[0.78rem] text-danger">{error}</span>}
    </div>
  );
}
