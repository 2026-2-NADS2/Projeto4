import ThemeToggle from "./ThemeToggle.jsx";

export default function AccessLayout({ children, className = "", showThemeToggle = true }) {
    return (
        <main className={`access-page ${className}`}>
            {showThemeToggle && <div className="access-toolbar"><ThemeToggle /></div>}
            {children}
        </main>
    );
}
