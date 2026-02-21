export default function Button({ children, type = 'button', variant = 'primary', className = '', ...props }) {
  const baseClasses = 'px-6 py-2 font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed theme-focus';
  const variants = {
    primary: 'theme-accent-gradient shadow-md shadow-emerald-900/20 hover:shadow-lg hover:shadow-emerald-900/25 transform hover:-translate-y-0.5',
    secondary: 'bg-white text-emerald-700 border-2 border-emerald-700 hover:bg-emerald-50',
    outline: 'border-2 border-emerald-200 text-slate-700 hover:bg-emerald-50/50',
  };
  return (
    <button
      type={type}
      className={`${baseClasses} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

