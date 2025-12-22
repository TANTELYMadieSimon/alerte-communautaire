import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginAdmin from './components/LoginAdmin';
import LoginUser from './components/LoginUser';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';

type UserRole = "guest" | "admin" | "user";

// Composant MessageDisplay (commun)
interface MessageProps {
  message: string;
  type: 'error' | 'success';
}
const MessageDisplay: React.FC<MessageProps> = ({ message, type }) => {
  const isError = type === 'error';
  const bgColor = isError ? 'bg-red-100 border-red-400 text-red-700' : 'bg-green-100 border-green-400 text-green-700';
  
  return (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 p-4 rounded-lg shadow-xl border-l-4 ${bgColor} z-50 animate-bounce-in`}>
      <div className="flex items-center">
        <p className="font-medium">{message}</p>
      </div>
    </div>
  );
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>("guest");
  const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null);

  //  Modifier le paramètre pour accepter userData
  const handleLogin = (role: UserRole, userData?: any) => {
    setIsLoggedIn(true);
    setUserRole(role);
    
    // Stocker les données selon le rôle
    if (role === 'admin' && userData) {
      localStorage.setItem('currentAdmin', JSON.stringify(userData));
    }
    //Stocker les données utilisateur
    if (role === 'user' && userData) {
      localStorage.setItem('currentUser', JSON.stringify(userData));
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole("guest");
    //Nettoyer le localStorage
    localStorage.removeItem('currentAdmin');
    localStorage.removeItem('currentUser');
    setMessage({ text: "Vous avez été déconnecté.", type: 'success' });
  };

  const handleMessage = (text: string, type: 'error' | 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  return (
    <Router>
      <div className="w-full h-full">
        {message && <MessageDisplay message={message.text} type={message.type} />}
        
        <Routes>
          {/* Route par défaut - Page de sélection du login */}
          <Route path="/" element={
            !isLoggedIn ? (
              <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl border border-gray-200">
                  <div className="flex flex-col items-center mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-800">ToliAlerte</h1>
                    <p className="text-sm text-gray-500 mt-1">Choisissez votre mode de connexion</p>
                  </div>

                  <div className="space-y-4">
                    <a
                      href="/admin-login"
                      className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition duration-300 block text-gray-800 no-underline"
                    >
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-indigo-600 font-bold">A</span>
                      </div>
                      <div>
                        <h3 className="font-semibold">Connexion Administrateur</h3>
                        <p className="text-sm text-gray-600">Accès au panel d'administration</p>
                      </div>
                    </a>

                    <a
                      href="/user-login"
                      className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-green-50 hover:border-green-300 transition duration-300 block text-gray-800 no-underline"
                    >
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-green-600 font-bold">U</span>
                      </div>
                      <div>
                        <h3 className="font-semibold">Connexion Utilisateur</h3>
                        <p className="text-sm text-gray-600">Accès à la plateforme communautaire</p>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <Navigate to={userRole === 'admin' ? '/admin-dashboard' : '/user-dashboard'} />
            )
          } />

          {/* Route login admin */}
          <Route path="/admin-login" element={
            !isLoggedIn ? 
            <LoginAdmin 
              onLogin={(role, adminData) => {
                if (adminData) {
                  const adminToSave = {
                    ...adminData,
                    profile_photo_url: adminData.profile_photo_url || null
                  };
                  localStorage.setItem('currentAdmin', JSON.stringify(adminToSave));
                  handleLogin(role, adminToSave);
                } else {
                  handleLogin(role);
                }
              }} 
              onMessage={handleMessage} 
            /> : 
            <Navigate to="/admin-dashboard" />
          } />

          {/* Route login user */}
          <Route path="/user-login" element={
            !isLoggedIn ? 
            <LoginUser 
              onLogin={(role, userData) => {
                // Stocker les données utilisateur
                if (userData) {
                  const userToSave = {
                    ...userData,
                    profile_photo_url: userData.profile_photo_url || null
                  };
                  localStorage.setItem('currentUser', JSON.stringify(userToSave));
                  handleLogin(role, userToSave);
                } else {
                  handleLogin(role);
                }
              }} 
              onMessage={handleMessage} 
            /> :
            <Navigate to="/user-dashboard" />
          } />

          {/* Route dashboard admin */}
          <Route path="/admin-dashboard" element={
            isLoggedIn && userRole === 'admin' ? 
            <AdminDashboard onLogout={handleLogout} /> : 
            <Navigate to="/admin-login" />
          } />

          {/* Route dashboard user */}
          <Route path="/user-dashboard" element={
            isLoggedIn && userRole === 'user' ? 
            <UserDashboard onLogout={handleLogout} /> : 
            <Navigate to="/user-login" />
          } />

          {/* Route de fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;