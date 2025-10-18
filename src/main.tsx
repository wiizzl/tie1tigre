import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "uno.css";
import Game from "./components/Game";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <div className="fixed inset-0">
      <div className="absolute top-4 left-6">
        <h1 className="text-2xl font-bold">tié1tigre.</h1>
      </div>
      <Game />
    </div>
  </StrictMode>
);
