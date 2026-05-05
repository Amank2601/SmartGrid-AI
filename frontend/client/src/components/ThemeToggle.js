import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

function ThemeToggle() {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <button
      onClick={toggleTheme}
      style={{
        padding: "8px 14px",
        borderRadius: "8px",
        border: "none",
        background: theme === "dark" ? "#3b82f6" : "#0d9488",
        color: "white",
        cursor: "pointer"
      }}
    >
      {theme === "dark" ? "☀ Light" : "🌙 Dark"}
    </button>
  );
}

export default ThemeToggle;