// Page de démonstration du composant Playlist (membre 4, carte 4.3)
// Point d'entrée : demo/main-playlist-demo.jsx (comme main.jsx pour App.jsx).
// Ouvrir http://localhost:5173/playlist-demo.html avec le frontend lancé (npm run dev).
// Fausses données : la vraie route GET /api/salons/:id/playlist arrive à la carte 4.7.
// Cette page ne touche pas à App.jsx et n'est pas incluse dans le site final.

import { useState } from "react";
import Playlist from "../components/Playlist";

// Volontairement dans le désordre pour vérifier le tri par position
const videosExemple = [
  { id_element: 3, id_youtube: "kJQP7kiw5Fk", titre: "Luis Fonsi - Despacito ft. Daddy Yankee", position: 3 },
  { id_element: 1, id_youtube: "dQw4w9WgXcQ", titre: "Rick Astley - Never Gonna Give You Up", position: 1 },
  { id_element: 2, id_youtube: "9bZkp7q19f0", titre: "PSY - GANGNAM STYLE", position: 2 },
  {
    id_element: 4,
    id_youtube: "jNQXAC9IVRw",
    titre: "Un titre de vidéo très long pour vérifier qu'il est bien coupé sur deux lignes sans casser la mise en page de la liste",
    position: 5,
  },
];

const cas = {
  liste: { libelle: "Liste de vidéos", props: { videos: videosExemple } },
  vide: { libelle: "Playlist vide", props: { videos: [] } },
  chargement: { libelle: "Chargement", props: { chargement: true } },
  erreur: { libelle: "Erreur", props: { erreur: "Impossible de charger la playlist." } },
};

function PlaylistDemo() {
  const [casActif, setCasActif] = useState("liste");

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-pink-400 mb-6">
        Démo – composant Playlist
      </h1>

      <div className="flex gap-2 flex-wrap justify-center">
        {Object.entries(cas).map(([cle, { libelle }]) => (
          <button
            key={cle}
            onClick={() => setCasActif(cle)}
            className={`px-4 py-2 rounded ${
              casActif === cle ? "bg-pink-500" : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            {libelle}
          </button>
        ))}
      </div>

      <Playlist {...cas[casActif].props} />
    </div>
  );
}

export default PlaylistDemo;
