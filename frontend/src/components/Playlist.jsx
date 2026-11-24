// Composant Playlist (F04 – membre 4, carte 4.3)
// Affiche les vidéos de la playlist d'un salon, dans l'ordre.
//
// Props :
//   videos     : tableau d'éléments de la playlist, au format de la future
//                route GET /api/salons/:id/playlist (carte 4.7) :
//                { id_element, id_youtube, titre, position }
//   chargement : true pendant le chargement de la liste
//   erreur     : message d'erreur à afficher (ou chaîne vide)
//
// Les cartes suivantes ajouteront : formulaire d'ajout (4.4),
// bouton de suppression (4.8) et lancement de la vidéo (lien avec le membre 2).

import { urlMiniature } from "../utils/youtube";

function Playlist({ videos = [], chargement = false, erreur = "" }) {
  // Tri par position sans modifier le tableau reçu
  const videosTriees = [...videos].sort((a, b) => a.position - b.position);

  return (
    <section className="mt-8 w-full max-w-md" aria-labelledby="titre-playlist">
      <h2 id="titre-playlist" className="text-2xl font-bold mb-4">
        Playlist ({videosTriees.length})
      </h2>

      {chargement && (
        <p className="text-gray-500">Chargement de la playlist...</p>
      )}

      {!chargement && erreur && (
        <p className="text-red-400" role="alert">
          {erreur}
        </p>
      )}

      {!chargement && !erreur && videosTriees.length === 0 && (
        <p className="text-gray-500">La playlist est vide.</p>
      )}

      {!chargement && !erreur && videosTriees.length > 0 && (
        <ol className="flex flex-col gap-3">
          {videosTriees.map((video, index) => (
            <li
              key={video.id_element}
              className="flex items-center gap-3 border border-gray-700 rounded p-2"
            >
              <span className="w-6 text-center font-bold text-pink-400">
                {index + 1}
              </span>

              {/* Taille fixe + fond gris : la ligne garde sa forme même si l'image ne charge pas */}
              <img
                src={urlMiniature(video.id_youtube)}
                alt={`Miniature de ${video.titre}`}
                loading="lazy"
                className="w-28 h-16 shrink-0 object-cover rounded bg-gray-800 text-[0px]"
              />

              <p className="flex-1 font-medium line-clamp-2" title={video.titre}>
                {video.titre}
              </p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export default Playlist;
