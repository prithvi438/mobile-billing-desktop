import { theme } from "../theme/theme";

export default function Layout({ title, children }) {
  return (
    <div>
      {/* AppBar */}
      <header
        style={{
          background: theme.colors.primaryBlue,
          color: "white",
          padding: "14px 20px",
          textAlign: "center",
          fontWeight: 600,
          fontSize: "18px"
        }}
      >
        {title}
      </header>

      {/* Body */}
      <main
        style={{
          padding: theme.layout.padding,
          background: theme.colors.background,
          minHeight: "calc(100vh - 56px)"
        }}
      >
        {children}
      </main>
    </div>
  );
}
