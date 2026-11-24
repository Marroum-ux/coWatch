// Outils YouTube partagés (membre 4)

// La miniature n'est pas stockée en base : elle se déduit de l'identifiant YouTube.
export function urlMiniature(idYoutube) {
  return `https://i.ytimg.com/vi/${idYoutube}/hqdefault.jpg`;
}
