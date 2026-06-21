const VARIANT_CLASSES = {
  primary: 'bg-accent text-[#1a0f0a] hover:bg-accent-hover',
  secondary: 'bg-elevated-2 text-text-primary hover:bg-bg-hover',
  ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-elevated',
  danger: 'bg-transparent text-danger border border-danger hover:bg-danger/10',
};

const SIZE_CLASSES = {
  sm: 'px-4 py-1.5 text-[0.8rem]',
  md: 'px-6 py-2.5 text-[0.9rem]',
  lg: 'px-9 py-3.5 text-[1rem]',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  type = 'button',
  disabled = false,
  onClick,
  className = '',
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`
        inline-flex items-center justify-center gap-2 whitespace-nowrap
        rounded-full font-semibold transition-all duration-150
        active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed
        disabled:active:scale-100
        ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${fullWidth ? 'w-full' : ''} ${className}
      `}
      {...rest}
    >
      {children}
    </button>
  );
}
