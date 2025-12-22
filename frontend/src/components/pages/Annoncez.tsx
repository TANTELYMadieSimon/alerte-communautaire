"use client"

import type React from "react"
import { useState } from "react"
import { Megaphone, UploadCloud, X, Loader2, CheckCircle } from 'lucide-react' 

// --- NOUVEAU: URL de l'API Django ---
const API_URL = 'http://localhost:8000/api/annonces/';

export default function Annoncez() {
  const [selectedType, setSelectedType] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  // La date n'est plus envoyée car Django utilise auto_now_add=True
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [photo, setPhoto] = useState<File | null>(null)
  
  // États pour la notification et le chargement
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false)


  const alertTypes = [
    { value: "maintenance", label: "Maintenance" },
    { value: "fermeture", label: "Fermeture" },
    { value: "cyclone", label: "Cyclone" },
    { value: "urgence", label: "Urgence" },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatusMessage(null); // Réinitialiser le message précédent

    if (!selectedType || !description) {
      setStatusMessage("Veuillez remplir tous les champs obligatoires (Type et Description).");
      setIsSuccess(false);
      return
    }

    setIsSubmitting(true);

    try {
        // 1. Créer le corps de la requête en FormData pour l'envoi de fichier
        const formData = new FormData();
        
        // Mappage des champs React vers les colonnes Django:
        formData.append('titre', selectedType); // type_alerte -> titre
        formData.append('message', description); // description -> message
        
        // Ajout de la photo si elle est sélectionnée
        if (photo) {
            formData.append('photo', photo);
        }

        // 2. Appel API réel à l'endpoint Django
        const response = await fetch(API_URL, {
            method: 'POST',
            // Le Content-Type est automatiquement défini par le navigateur pour FormData
            body: formData, 
        });

        // 3. Traiter la réponse
        if (response.ok) { // Vérifie le statut HTTP (201 Created est attendu)
            // Afficher le modal de succès
            setShowSuccessModal(true);
            setIsSuccess(true);

            // Réinitialiser le formulaire après succès
            setSelectedType("")
            setDescription("")
            setDate(new Date().toISOString().split("T")[0])
            setPhoto(null)
        } else {
            // Tenter de lire le corps de l'erreur JSON pour un message détaillé
            let errorMessage = `Erreur HTTP: ${response.status}.`;
            try {
                const errorData = await response.json();
                // Si des erreurs de validation sont présentes (ex: 'message': ['Ce champ est obligatoire.'])
                errorMessage += " Détails: " + JSON.stringify(errorData);
            } catch {
                errorMessage += " Réponse du serveur illisible.";
            }
            throw new Error(errorMessage);
        }

    } catch (error) {
        console.error("Erreur lors de la publication de l'annonce:", error);
        setStatusMessage(`Erreur de publication. ${error instanceof Error ? error.message : 'Veuillez vérifier la console pour les détails.'}`);
        setIsSuccess(false);
    } finally {
        setIsSubmitting(false);
        // Le message d'erreur disparaîtra après 7 secondes
        setTimeout(() => setStatusMessage(null), 7000);
    }
  }

  const handleCancel = () => {
    setSelectedType("")
    setDescription("")
    setDate(new Date().toISOString().split("T")[0])
    setPhoto(null)
    setStatusMessage(null);
    setIsSubmitting(false);
  }

  // --- COMPOSANT DE NOTIFICATION PERSONNALISÉ ---
  const Notification: React.FC = () => {
    if (!statusMessage) return null;

    return (
        <div className={`p-4 mb-6 rounded-lg font-medium flex justify-between items-center transition-all duration-300 ${
            isSuccess ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'
        }`}>
            <span>{statusMessage}</span>
            <button 
                onClick={() => setStatusMessage(null)} 
                className={`p-1 rounded-full ${isSuccess ? 'hover:bg-green-200' : 'hover:bg-red-200'} transition`}
                aria-label="Fermer la notification"
            >
                <X className="w-5 h-5" />
            </button>
        </div>
    );
  };

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
              Annonce ajoutée avec succès
            </h3>
            <p className="text-gray-600 mb-6">
              Votre annonce a été publiée avec succès et est maintenant visible.
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
  // ------------------------------------------------

  return (
    // Conteneur principal
    <div className="p-4 sm:p-6 lg:p-8 max-w-xl mx-auto bg-white rounded-xl shadow-2xl mt-4 mb-8">
      
      {/* En-tête MODIFIÉ avec background vert */}
      <div className="bg-green-500 p-4 flex justify-center items-center space-x-3 mb-8 rounded-t-xl">
        <Megaphone className="w-8 h-8 text-white" />
        <h2 className="text-2xl font-bold text-white">Créer une annonce publique</h2>
      </div>
      
      {/* Affichage de la notification (pour les erreurs) */}
      <Notification />

      {/* Modal de succès */}
      <SuccessModal />

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Type d'annonce */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type d'annonce :</label>
          <div className="relative">
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
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description :</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Décrivez clairement l'objet de l'annonce, les dates et les impacts..."
            required
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm resize-none h-32"
            disabled={isSubmitting}
          />
        </div>

        {/* Date de publication */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date de publication :</label>
          <input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
            required 
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            disabled={isSubmitting}
          />
        </div>

        {/* Photo (optionnel) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Photo (optionnel) :</label>
          <div className="flex items-center space-x-3">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhoto(e.target.files?.[0] || null)}
              id="photo-input"
              className="hidden" 
              disabled={isSubmitting}
            />
            <label 
              htmlFor="photo-input" 
              className={`cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <UploadCloud className="w-4 h-4 mr-2" /> Choisir un fichier
            </label>
            {photo && <span className="text-sm text-indigo-600 truncate max-w-[50%]">{photo.name}</span>}
            {!photo && <span className="text-sm text-gray-500">Aucun fichier sélectionné</span>}
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-end space-x-4 pt-4 border-t mt-8">
          
          <button 
            type="button" 
            onClick={handleCancel} 
            className="px-6 py-2 border border-red-300 rounded-lg shadow-sm text-sm font-medium text-white bg-red-500 hover:bg-gray-700 transition duration-150"
            disabled={isSubmitting}
          >
            Annuler
          </button>
          
          <button 
            type="submit" 
            className="px-6 py-2 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 transform hover:scale-[1.01] flex items-center justify-center min-w-[150px]"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Publication...
              </>
            ) : (
              'Publier l\'Annonce'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}