
import { useState, useEffect } from 'react'
import axios from "axios"
import './App.css'

function App() {
  const [message, setMessage] = useState("Connexion au serveur...")
  const [salon, setSalon] = useState(null)
  const [erreur, setErreur] = useState("")

  useEffect(() => {
    axios
      .get("http://localhost:3000/api/health")
      .then((response) => {
        setMessage(response.data.message)
      })
      .catch((error) => {
        console.error(error)
        setMessage("Connexion impossible au serveur.")
      })
  }, [])

  async function creerSalon() {
    setErreur("")
    try {
      const response = await axios.post(
        "http://localhost:3000/api/salons"
      )
      setSalon(response.data.salon)
    } catch (error) {
      console.error(error)
      setErreur("Impossible de créer le salon.")
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center">
      <h1 className="text-5xl font-bold text-pink-400 mb-6">
        coWatch
      </h1>

      <p className="text-xl text-white mb-8">{message}</p>

      <button
        onClick={creerSalon}
        className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-6 rounded-lg"
      >
        Créer un salon
      </button>

      {salon && (
        <div className="mt-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-3">
            Salon créé !
          </h2>
          <p>Identifiant : {salon.idSalle}</p>
          <p>Code d'invitation : {salon.codeInvitation}</p>
        </div>
      )}

      {erreur && (
        <p className="text-red-400 mt-4">{erreur}</p>
      )}
    </div>
  )
}

export default App
