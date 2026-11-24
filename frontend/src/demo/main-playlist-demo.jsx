// Point d'entrée de la page de démo Playlist (membre 4) – même rôle que main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../index.css";
import PlaylistDemo from "./PlaylistDemo";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <PlaylistDemo />
  </StrictMode>
);
