"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { X, CheckCircle, Megaphone } from "lucide-react"
import { ALERTES_API_URL } from "../../lib/api";
export default function AjoutAlerte() {
  const [selectedType, setSelectedType] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [photo, setPhoto] = useState<File | null>(null)
  const [adresse, setAdresse] = useState("Localisation en cours...")
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const alertTypes = [
    { value: "inondation", label: "Inondation" },
    { value: "incendie", label: "Incendie" },
    { value: "vol", label: "Vol" },
    { value: "autre", label: "Autre" },
  ]

  // Récupération automatique de la position et reverse geocoding
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          setLatitude(latitude)
          setLongitude(longitude)

          try {
            const res = await axios.get(
             `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=16&addressdetails=1&accept-language=fr`,
            )

            const locationName = res.data.display_name || `Lat: ${latitude}, Lng: ${longitude}`
            setAdresse(locationName)
          } catch (err) {
            console.error("Erreur reverse geocoding :", err)
            setAdresse(`Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}`)
          }
        },
        (error) => {
          console.error("Erreur géolocalisation :", error)
          setAdresse("Géolocalisation refusée / non disponible")
        }
      )
    } else {
      setAdresse("Géolocalisation non supportée")
    }
  }, [])

  //  Envoi de l'alerte vers le backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!selectedType || !description) {
      alert("Veuillez remplir tous les champs obligatoires");
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append("description", description);
    formData.append("type_alerte", selectedType);
    formData.append("adresse", adresse);
    if (latitude) formData.append("latitude", latitude.toString());
    if (longitude) formData.append("longitude", longitude.toString());
    if (photo) formData.append("photo", photo); // ajout photo facultative

    try {
      await axios.post(ALERTES_API_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      // Afficher le modal de succès au lieu de alert()
      setShowSuccessModal(true);
      
      // Réinitialiser le formulaire
      setSelectedType("");
      setDescription("");
      setPhoto(null);
    } catch (error: any) {
      console.error("Erreur API :", error.response?.data || error.message);
      alert("Erreur lors de l'ajout de l'alerte");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setSelectedType("")
    setDescription("")
    setDate(new Date().toISOString().split("T")[0])
    setPhoto(null)
  }

  // --- MODAL DE SUCCÈS ---
  const SuccessModal: React.FC = () => {
    if (!showSuccessModal) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Overlay avec opacité */}
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={() => setShowSuccessModal(false)}
        />
        
        {/* Contenu du modal */}
        <div
          className="relative bg-white rounded-lg shadow-lg w-full max-w-sm mx-4 overflow-hidden border border-green-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* En-tête avec bouton X */}
          <div className="bg-green-500 p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white text-center flex-1">
                Succès
              </h2>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/20 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Contenu du modal */}
          <div className="p-6 text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Alerte ajoutée avec succès
            </h3>
            <p className="text-gray-600 mb-6">
              Votre alerte a été envoyée avec succès et est maintenant visible.
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    // Remplacement de .ajout-alerte-container
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto bg-white rounded-xl shadow-2xl mt-4 mb-8">
      {/* En-tête MODIFIÉ avec background vert */}
      <div className="bg-green-500 p-4 flex justify-center items-center space-x-3 mb-8 rounded-t-xl">
        <Megaphone className="w-8 h-8 text-white" />
        <h2 className="text-2xl font-bold text-white ">Ajouter une alerte</h2>
      </div>

      {/* Modal de succès */}
      <SuccessModal />

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Remplacement de .form-group */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type :</label>
          <div className="relative">
            {/* Remplacement de .type-selector et styles du select */}
            <select 
              value={selectedType} 
              onChange={(e) => setSelectedType(e.target.value)} 
              required
              className="mt-1 block w-full pl-3 pr-10 py-2 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm appearance-none"
              disabled={isSubmitting}
            >
              <option value="">Choisir un type</option>
              {alertTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Remplacement de .form-group pour Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description :</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Décrivez l'alerte en détail (Lieu, heure, impact)..."
            required
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm resize-none h-28"
            disabled={isSubmitting}
          />
        </div>

        {/* Remplacement de .form-group pour Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date :</label>
          <input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
            required 
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            disabled={isSubmitting}
          />
        </div>

        {/* Remplacement de .form-group pour Adresse */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Adresse (Géolocalisation automatique) :</label>
          <input 
            type="text" 
            value={adresse} 
            readOnly 
            className={`mt-1 block w-full p-3 border rounded-lg shadow-sm sm:text-sm 
              ${adresse.includes("en cours") ? 'border-yellow-400 bg-yellow-50 text-yellow-800' : 'border-green-400 bg-green-50 text-green-800'}
              cursor-default`}
          />
          {latitude && longitude && (
             <p className="text-xs text-gray-500 mt-1">Lat: {latitude.toFixed(5)}, Lng: {longitude.toFixed(5)}</p>
          )}
        </div>

        {/* Remplacement de .form-group pour Photo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Photo (Facultatif) :</label>
          <div className="flex items-center space-x-3">
            {/* Cacher l'input file par défaut */}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhoto(e.target.files?.[0] || null)}
              id="photo-input"
              className="hidden" // Classe Tailwind pour cacher l'input
              disabled={isSubmitting}
            />
            {/* Remplacement de .photo-label */}
            <label 
              htmlFor="photo-input" 
              className={`cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              📷 Choisir un fichier
            </label>
            {/* Remplacement de .photo-name */}
            {photo && <span className="text-sm text-indigo-600 truncate max-w-[50%]">{photo.name}</span>}
            {!photo && <span className="text-sm text-gray-500">Aucun fichier sélectionné</span>}
          </div>
        </div>

        {/* Remplacement de .form-actions */}
        <div className="flex justify-end space-x-4 pt-4 border-t mt-8">
          {/* Remplacement de .cancel-btn */}
          <button 
            type="button" 
            onClick={handleCancel} 
           className="px-6 py-2 border border-red-300 rounded-lg shadow-sm text-sm font-medium text-white bg-red-500 hover:bg-gray-700 transition duration-150"
            disabled={isSubmitting}
          >
            Annuler
          </button>
          {/* Remplacement de .submit-btn */}
          <button 
            type="submit" 
            className="px-6 py-2 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 transform hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Envoi en cours..." : "Envoyer l'Alerte"}
          </button>
        </div>
      </form>
    </div>
  )
}