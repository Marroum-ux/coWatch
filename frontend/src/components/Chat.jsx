
function Chat({ messages, message, setMessage, envoyerMessage }) {
  return (
    <div className="mt-10 max-w-md">
      <h2 className="text-2xl font-bold mb-4">
        Chat du salon
      </h2>

      <div className="border rounded p-4 h-64 overflow-y-auto mb-4">
        {messages.map((msg, index) => (
          <div key={index} className="mb-2">
            <span className="text-gray-500 text-sm">
              {new Date(msg.date).toLocaleTimeString()}
            </span>

            <p>
              <strong>{msg.pseudo}:</strong> {msg.message}
            </p>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") envoyerMessage();
          }}
          placeholder="Votre message..."
          maxLength={500}
          className="border rounded p-2 flex-1"
        />

        <button
          onClick={envoyerMessage}
          className="bg-pink-500 text-white px-4 rounded"
        >
          Envoyer
        </button>
      </div>
    </div>
  );
}

export default Chat;
