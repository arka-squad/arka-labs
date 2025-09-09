interface ButtonProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export function Button({ 
  children, 
  variant = 'default', 
  size = 'default', 
  className = "",
  onClick,
  disabled = false,
  type = 'button'
}: ButtonProps) {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  
  const variantClasses = {
    default: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100",
    ghost: "text-gray-700 hover:bg-gray-100 active:bg-gray-200",
    destructive: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800"
  };
  
  const sizeClasses = {
    default: "h-10 px-4 py-2 text-sm",
    sm: "h-8 px-3 py-1 text-sm",
    lg: "h-12 px-6 py-3 text-base"
  };
  
  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}