
function Participants({ participants }) {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">
        Participants connectés ({participants.length})
      </h2>

      {participants.length === 0 ? (
        <p className="text-gray-500">
          Aucun participant connecté.
        </p>
      ) : (
        participants.map((participant) => (
          <p key={participant.socketId} className="mb-2">
            🟢 {participant.pseudo}
          </p>
        ))
      )}
    </div>
  );
}

export default Participants;
