export default function AccessLayout({ children, className = "" }) {
    return (
        <main className={`access-page ${className}`}>
            {children}
        </main>
    );
}  