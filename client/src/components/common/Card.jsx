function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-xl border border-gray-100 bg-white p-6 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export default Card;