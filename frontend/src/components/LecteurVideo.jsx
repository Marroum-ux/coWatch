import { useEffect, useRef } from "react";

// Charge le script YouTube une seule fois
function chargerApiYouTube() {
  return new Promise((resolve) => {
    if (window.YT && window.YT.Player) return resolve(window.YT);
    const ancien = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (ancien) ancien();
      resolve(window.YT);
    };
    if (!document.getElementById("yt-api")) {
      const script = document.createElement("script");
      script.id = "yt-api";
      script.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(script);
    }
  });
}

export default function LecteurVideo({ videoId }) {
  const conteneur = useRef(null);
  const lecteur = useRef(null);

  useEffect(() => {
    let annule = false;

    chargerApiYouTube().then((YT) => {
      if (annule) return;
      // YouTube remplace ce div par une iframe
      const cible = document.createElement("div");
      conteneur.current.appendChild(cible);

      lecteur.current = new YT.Player(cible, {
        videoId,
        width: "640",
        height: "360",
        events: {
          onReady: () => console.log("Lecteur prêt"),
          onStateChange: (e) => console.log("État :", e.data),
        },
      });
    });

    return () => {
      annule = true;
      if (lecteur.current) lecteur.current.destroy();
      if (conteneur.current) conteneur.current.innerHTML = "";
    };
  }, [videoId]);

  return <div ref={conteneur} />;
}