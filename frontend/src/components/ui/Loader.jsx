export default function Loader({ size = 'md' }) {
  const sizes = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-2',
    lg: 'h-16 w-16 border-4',
  };
  return (
    <div className="flex justify-center items-center">
      <div
        className={`${sizes[size]} border-emerald-700 border-t-transparent rounded-full animate-spin`}
      />
    </div>
  );
}

