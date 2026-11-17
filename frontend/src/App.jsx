import { useState,useEffect } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import axios from "axios"
import './App.css'

function App() {
  const [message, setMessage] = useState("Connecting...");
 useEffect(() => {
    axios
      .get("http://localhost:3000/api/health")
      .then((response) => {
        setMessage(response.data.message);
      })
      .catch((error) => {
        console.error(error);
        setMessage("Connection failed!");
      });
  }, []);

  return (
    
       <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center">
      <h1 className="text-5xl font-bold text-pink-400 mb-6">
        coWatch
      </h1>

      <p className="text-xl text-white">{message}</p>
    </div>
  )
}

export default App
