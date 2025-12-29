import React, { useState, useRef, useEffect } from 'react';
import { User, Mail, Phone, Camera,BellRing, Eye, EyeOff } from 'lucide-react';

import { USERS_API } from "../lib/api";
// Service pour appeler l'API Django (version utilisateur)
const djangoUserAPI = {
  async createUser(userData: any) {
    const formData = new FormData();
    
    formData.append('username', userData.username);
    formData.append('email', userData.email);
    formData.append('phone', userData.phone || '');
    formData.append('password', userData.password);
    formData.append('password_confirm', userData.passwordConfirm);

    if (userData.profilePhoto && userData.profilePhoto.startsWith('data:')) {
      const response = await fetch(userData.profilePhoto);
      const blob = await response.blob();
      formData.append('profile_photo', blob, 'profile.jpg');
    }

  const response = await fetch(`${USERS_API}create/`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    const data = await response.json();
    
    if (!response.ok) {
      if (data.errors) {
        const errorMessages = Object.values(data.errors).flat().join(', ');
        throw new Error(errorMessages);
      }
      throw new Error(data.message || 'Erreur lors de la création du compte');
    }
    
    return data;
  },

  async loginUser(credentials: any) {
    const response = await fetch(`${USERS_API}login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Erreur de connexion');
    }
    
    return data;
  },

  async logoutUser() {
     const response = await fetch(`${USERS_API}logout/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Erreur de déconnexion');
    }
    
    return data;
  },

  async getUserProfile() {
     const response = await fetch(`${USERS_API}profile/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors de la récupération du profil');
    }
    
    return data;
  }
};

interface LoginUserProps {
  onLogin: (role: "user", userData?: any) => void;
  onMessage: (message: string, type: 'error' | 'success') => void;
}

// Composant TextType pour l'effet de frappe
const TextType: React.FC<{
  text: string[];
  typingSpeed?: number;
  pauseDuration?: number;
  showCursor?: boolean;
  cursorCharacter?: string;
}> = ({ 
  text, 
  typingSpeed = 50, 
  pauseDuration = 2000, 
  showCursor = true, 
  cursorCharacter = "|" 
}) => {
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const handleTyping = () => {
      const current = currentIndex % text.length;
      const fullText = text[current];

      if (isDeleting) {
        setCurrentText(fullText.substring(0, currentText.length - 1));
      } else {
        setCurrentText(fullText.substring(0, currentText.length + 1));
      }

      if (!isDeleting && currentText === fullText) {
        setTimeout(() => setIsDeleting(true), pauseDuration);
      } else if (isDeleting && currentText === '') {
        setIsDeleting(false);
        setCurrentIndex(currentIndex + 1);
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentIndex, text, typingSpeed, pauseDuration]);

  return (
    <span>
      {currentText}
      {showCursor && <span className="animate-pulse">{cursorCharacter}</span>}
    </span>
  );
};

export const LoginUser: React.FC<LoginUserProps> = ({ onLogin, onMessage }) => {
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loginImages = [
    "/sauve.jpg",
    "/ordi.jpg", 
    "/pop.jpg",
    "/toliara-madagascar-k5hy74.jpg"
  ];
  // Carrousel automatique
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % loginImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [loginImages.length]);

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        onMessage("La photo ne doit pas dépasser 2MB", "error");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePhoto(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setProfilePhoto(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (password !== confirmPassword) {
      onMessage("Les mots de passe ne correspondent pas.", "error");
      setIsLoading(false);
      return;
    }

    try {
      const userData = {
        username,
        email,
        phone,
        password,
        passwordConfirm: confirmPassword,
        profilePhoto
      };

      const result = await djangoUserAPI.createUser(userData);
      
      if (result.success) {
        onMessage(result.message, "success");
        setIsCreatingAccount(false);
        resetForm();
      } else {
        onMessage(result.message || "Erreur lors de la création", "error");
      }
    } catch (error: any) {
      onMessage(error.message || "Erreur de connexion au serveur", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const credentials = { username, password };
      const result = await djangoUserAPI.loginUser(credentials);
      
      if (result.success) {
        onLogin("user", result.user);
        onMessage(result.message, "success");
      } else {
        onMessage(result.message, "error");
      }
    } catch (error: any) {
      onMessage(error.message || "Erreur de connexion au serveur", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setUsername("");
    setEmail("");
    setPhone("");
    setPassword("");
    setConfirmPassword("");
    setProfilePhoto(null);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: `url('/toliara-madagascar-k5hy74.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay sombre */}
      <div className="absolute inset-0 bg-black/40"></div>
      
      {/* Cadre principal - disposition verticale sur mobile */}
      <div className="w-full max-w-4xl bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row relative z-10">
        
        {/* Section Login (toujours en haut sur mobile, à gauche sur desktop) */}
        <div className="flex-1 flex flex-col justify-center p-8 lg:p-12 order-1 lg:order-1">
          <div className="w-full max-w-md mx-auto space-y-8">
            {/* Logo mobile */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex flex-col items-center">
                <div className="text-center">
                  <BellRing className="w-7 h-7 text-red-600 inline-block" />
                </div>
                <h1 className="text-3xl font-bold text-gray-800">ToliAlerte</h1>
              </div>
            </div>

            <div className="text-center">
              <div className="text-center">
               <BellRing className="w-7 h-7 text-red-600 inline-block" />
              </div>
              <h1 className="text-4xl font-bold text-gray-800 hidden lg:block">
                ToliAlerte
              </h1>
              <p className="text-gray-600 mt-2">
                {isCreatingAccount ? "Créer votre compte" : "Connectez-vous à votre compte"}
              </p>
            </div>

            <form onSubmit={isCreatingAccount ? handleCreateAccount : handleLogin}>
              <div className="space-y-4">
                
                {/* Upload photo pour la création */}
                {isCreatingAccount && (
                  <div className="flex flex-col items-center mb-4">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full border-4 border-blue-200 overflow-hidden bg-gray-100 flex items-center justify-center">
                        {profilePhoto ? (
                          <img src={profilePhoto} alt="Photo de profil" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-10 h-10 text-gray-400" />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full shadow-lg hover:bg-blue-700 transition duration-200"
                      >
                        <Camera className="w-3 h-3" />
                      </button>
                      {profilePhoto && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="absolute top-0 right-0 bg-red-600 text-white p-1 rounded-full shadow-lg hover:bg-red-700 transition duration-200 text-xs w-4 h-4 flex items-center justify-center"
                        >
                          ×
                        </button>
                      )}
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <p className="text-xs text-gray-500 mt-2">Photo optionnelle</p>
                  </div>
                )}

                {/* Champs communs */}
                <div className="space-y-4">
                  {isCreatingAccount && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <Mail className="w-4 h-4 inline mr-1" /> Email
                        </label>
                        <input
                          type="email"
                          placeholder="votre@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <Phone className="w-4 h-4 inline mr-1" /> Téléphone
                        </label>
                        <input
                          type="tel"
                          placeholder="+261 34 12 345 67"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom d'utilisateur
                    </label>
                    <input
                      type="text"
                      placeholder="Votre nom d'utilisateur"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
                    />
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mot de passe
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder={isCreatingAccount ? "Créez un mot de passe" : "Votre mot de passe"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {isCreatingAccount && (
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirmer le mot de passe
                      </label>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Retapez votre mot de passe"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold uppercase tracking-wider hover:bg-blue-700 transition duration-300 shadow-lg transform hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Chargement..." : 
                   isCreatingAccount ? "Créer mon compte" : "Se connecter"}
                </button>
              </div>
            </form>

            {/* Lien pour basculer */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsCreatingAccount(!isCreatingAccount)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
              >
                {isCreatingAccount ? "Déjà un compte ? Se connecter" : "Créer un nouveau compte"}
              </button>
            </div>

            {/* Footer */}
            <div className="text-center text-sm text-gray-500 mt-8">
              <p>© 2025 ToliAlerte. Tous droits réservés.</p>
            </div>
          </div>
        </div>

        {/* Section Image (en bas sur mobile, à droite sur desktop) */}
        <div className="flex-1 flex relative min-h-[300px] lg:min-h-[600px] order-2 lg:order-2">
          {/* Image changeante */}
          <div className="absolute inset-0">
            <img
              src={loginImages[currentImage]}
              alt="ToliAlerte"
              className="w-full h-full object-cover transition-opacity duration-1000"
            />
            <div className="absolute inset-0 bg-black/20"></div>
          </div>
          
          {/* Texte avec effet typing */}
          <div className="relative z-10 flex flex-col justify-center h-full px-6 lg:px-12 text-white">
            <div className="text-center">
              <h1 className="text-3xl lg:text-5xl font-bold mb-4 lg:mb-6 text-green-400">
                <TextType 
                  text={["Bienvenue", "Welcome", "Tongasoa"]}
                  typingSpeed={75}
                  pauseDuration={2500}
                  showCursor={true}
                  cursorCharacter="|"
                />
              </h1>
              <h3 className="text-lg lg:text-2xl font-bold text-white">
                <TextType 
                  text={[
                    "Système d'alerte communautaire",
                    "Protégez votre communauté", 
                    "Restez informé en temps réel"
                  ]}
                  typingSpeed={50}
                  pauseDuration={2000}
                  showCursor={true}
                  cursorCharacter="_"
                />
              </h3>
            </div>         
            
            {/* Indicateurs d'images */}
            <div className="flex gap-2 mt-6 lg:mt-8 justify-center">
              {loginImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImage(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentImage 
                      ? "bg-white scale-125" 
                      : "bg-white/50 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginUser;