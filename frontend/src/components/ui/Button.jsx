export default function Button({ children, type = 'button', variant = 'primary', className = '', ...props }) {
  const baseClasses = 'px-6 py-2 font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-green-500 text-white hover:shadow-lg transform hover:-translate-y-0.5',
    secondary: 'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50',
    outline: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50',
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
