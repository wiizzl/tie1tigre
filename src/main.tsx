import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "uno.css";
import Game from "./components/Game";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <div className="fixed inset-0">
      <h1 className="top-2 left-2">tié1tigre.</h1>
      <Game />
    </div>
  </StrictMode>
);
