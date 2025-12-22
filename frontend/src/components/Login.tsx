import React, { useState } from 'react'
import { Bell, User, Shield, CheckCircle, AlertTriangle } from 'lucide-react'

// 💡 IMPORT DES DASHBOARDS
// Assurez-vous que ces chemins d'importation sont corrects
import AdminDashboard from './AdminDashboard' 
import UserDashboard from './UserDashboard' 

// Définition des types pour le rôle utilisateur
type UserRole = "guest" | "admin" | "user"

// --- Message Display Component (remplace alert()) ---
interface MessageProps {
  message: string
  type: 'error' | 'success'
}

const MessageDisplay: React.FC<MessageProps> = ({ message, type }) => {
  const isError = type === 'error'
  const bgColor = isError ? 'bg-red-100 border-red-400 text-red-700' : 'bg-green-100 border-green-400 text-green-700'
  const Icon = isError ? AlertTriangle : CheckCircle

  return (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 p-4 rounded-lg shadow-xl border-l-4 ${bgColor} z-50 animate-bounce-in`}>
      <div className="flex items-center">
        <Icon className={`w-5 h-5 mr-3 ${isError ? 'text-red-500' : 'text-green-500'}`} />
        <p className="font-medium">{message}</p>
      </div>
    </div>
  )
}

// --- Login Component (Refactorisé avec Tailwind) ---
interface LoginProps {
  onLogin: (role: UserRole) => void
  onMessage: (message: string, type: 'error' | 'success') => void
}

export const LoginComponent: React.FC<LoginProps> = ({ onLogin, onMessage }) => { // 💡 Renommé en LoginComponent
  const [selectedRole, setSelectedRole] = useState<"admin" | "user">("user")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Logique d'authentification simple
    // 1. Connexion Admin (code valide : admin/admin123)
    if (selectedRole === "admin" && username === "admin" && password === "admin123") {
      onLogin("admin")
      onMessage("Connexion Admin réussie !", "success")
    // 2. Connexion Utilisateur (code valide : n'importe quel identifiant non-admin)
    } else if (selectedRole === "user" && username && password) {
      // NOTE : Dans un vrai projet, une requête API vérifierait l'identifiant et le mot de passe utilisateur ici.
      onLogin("user")
      onMessage("Connexion Utilisateur réussie !", "success")
    } else {
      onMessage("Identifiants incorrects. Veuillez réessayer.", "error")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <style>{`
        /* Simple animation for the message box */
        @keyframes bounce-in {
          0% { opacity: 0; transform: translate(-50%, -50px); }
          50% { transform: translate(-50%, 10px); }
          100% { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-bounce-in {
          animation: bounce-in 0.5s ease-out;
        }
      `}</style>
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl border border-gray-200">
        
        {/* En-tête de l'application */}
        <div className="flex flex-col items-center mb-8">
          <Bell className="w-12 h-12 text-indigo-600 mb-2" /> 
          <h1 className="text-3xl font-extrabold text-gray-800">ToliAlerte</h1>
          <p className="text-sm text-gray-500 mt-1">Connexion à la plateforme communautaire</p>
        </div>

        <form onSubmit={handleSubmit}>
          
          {/* Sélecteur de Rôle (Segmented Control) */}
          <div className="flex justify-between mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-300 flex items-center justify-center ${
                selectedRole === "admin"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
              onClick={() => setSelectedRole("admin")}
            >
              <Shield className="w-4 h-4 mr-2" /> Admin
            </button>
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-300 flex items-center justify-center ${
                selectedRole === "user"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
              onClick={() => setSelectedRole("user")}
            >
              <User className="w-4 h-4 mr-2" /> Utilisateur
            </button>
          </div>

          {/* Champs de Saisie */}
          <input
            type="text"
            placeholder="Nom d'utilisateur"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150 shadow-sm"
          />

          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 mb-6 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150 shadow-sm"
          />

          {/* Bouton de Connexion */}
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold uppercase tracking-wider hover:bg-indigo-700 transition duration-300 shadow-lg transform hover:scale-[1.01]"
          >
            Se connecter
          </button>
        </form>

        {/* Informations de Connexion */}
        <div className="mt-8 p-4 bg-indigo-50 rounded-lg text-sm text-indigo-800 border-l-4 border-indigo-400 shadow-inner">
          <p className="font-semibold mb-1">Informations de test :</p>
          <p className="ml-2">
            <strong>Admin:</strong> admin / admin123
          </p>
          <p className="ml-2">
            <strong>Utilisateur:</strong> (n'importe quel nom d'utilisateur et mot de passe non-admin)
          </p>
        </div>
      </div>
    </div>
  )
}


// --- Main Application Component (Contrôleur de routage) ---
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState<UserRole>("guest")
  const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null)

  const handleLogin = (role: UserRole) => {
    setIsLoggedIn(true)
    setUserRole(role)
    // Le message de succès est déjà géré dans LoginComponent
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUserRole("guest")
    setMessage({ text: "Vous avez été déconnecté.", type: 'success' })
  }

  const handleMessage = (text: string, type: 'error' | 'success') => {
    setMessage({ text, type })
    // Disparaître après 4 secondes
    setTimeout(() => setMessage(null), 4000)
  }

  // 💡 LOGIQUE DE ROUTAGE BASÉE SUR LE RÔLE
  const renderDashboard = () => {
    switch (userRole) {
      case 'admin':
        return <AdminDashboard onLogout={handleLogout} /> // ➡️ Redirection vers AdminDashboard
      case 'user':
        return <UserDashboard onLogout={handleLogout} />  // ➡️ Redirection vers UserDashboard
      case 'guest':
      default:
        // Si la connexion est active mais le rôle est "guest" (ne devrait pas arriver),
        // ou si l'état est incohérent, on affiche l'écran de connexion par défaut.
        return <LoginComponent onLogin={handleLogin} onMessage={handleMessage} />
    }
  }

  return (
    <div className="w-full h-full">
      {message && <MessageDisplay message={message.text} type={message.type} />}

      {isLoggedIn ? (
        // Affiche le bon tableau de bord
        renderDashboard()
      ) : (
        // Affiche l'écran de connexion
        <LoginComponent onLogin={handleLogin} onMessage={handleMessage} />
      )}
    </div>
  )
}