import type { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}

function Button({ children, onClick, type = "button", disabled }: ButtonProps) {
  return (
    <button className="boton" type={type} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export default Button;