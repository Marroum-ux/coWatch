import { useEffect, useState } from "react";
import socket from "./socket";
import Chat from "./components/Chat";
import Participants from "./components/Participants";


function App() {

  const [participants, setParticipants] = useState([]);

  const [pseudo, setPseudo] = useState("");

  const [message, setMessage] = useState("");
const [messages, setMessages] = useState([]);


  const [salonId, setSalonId] = useState("");
  const [status, setStatus] = useState("Disconnected");

  function envoyerMessage() {
  if (!message.trim()) return;

  socket.emit("chat:envoyer", {
    message: message,
  });

  setMessage("");
}

  useEffect(() => {
   function onParticipantsListe(participants) {
  setParticipants(participants);
}

socket.on("participant:liste", onParticipantsListe);

    function onMessage(data) {
  setMessages((previous) => [...previous, data]);
}

socket.on("chat:message", onMessage);
    function onConnect() {
      setStatus("Connected");
    }

    function onJoined(data) {
      setStatus(`Joined salon: ${data.id_salle}`);
    }

    function onError(message) {
      setStatus(`Error: ${message}`);
    }

    socket.on("connect", onConnect);
    socket.on("salon:rejoint", onJoined);
    socket.on("salon:erreur", onError);

    socket.connect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("salon:rejoint", onJoined);
      socket.off("salon:erreur", onError);
      socket.off("chat:message", onMessage);
      socket.off("participant:liste", onParticipantsListe);
      socket.disconnect();
    };
  }, []);



 function rejoindreSalon() {
  if (!pseudo.trim() || !salonId.trim()) {
    alert("Veuillez entrer un pseudonyme et un salon");
    return;
  }

  socket.emit("salon:rejoindre", {
    id_salle: salonId.trim(),
    pseudo: pseudo.trim(),
  });
}


return (
  <div className="p-10">

    {/* Participants */}
   <Participants participants={participants} />

    {/* Rejoindre un salon */}
    <h1 className="text-3xl font-bold mt-6">
      Socket.IO Test
    </h1>

    <p className="mt-4">{status}</p>

    <div className="flex gap-2 mt-4">
      <input
        className="border p-2"
        placeholder="Salon ID"
        value={salonId}
        onChange={(e) => setSalonId(e.target.value)}
      />

      <input
        className="border p-2"
        placeholder="Votre pseudonyme"
        value={pseudo}
        onChange={(e) => setPseudo(e.target.value)}
        maxLength={50}
      />

      <button
        onClick={rejoindreSalon}
        className="bg-pink-500 text-white p-2 rounded"
      >
        Rejoindre
      </button>
    </div>

    {/* Chat */}
    <Chat
      messages={messages}
      message={message}
      setMessage={setMessage}
      envoyerMessage={envoyerMessage}
    />

  </div>
);

}

export default App;