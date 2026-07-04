import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import { QuranPlayerProvider } from "./context/QuranPlayerContext";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
    <QuranPlayerProvider>
      <App />
    </QuranPlayerProvider>
  </ThemeProvider>
);
