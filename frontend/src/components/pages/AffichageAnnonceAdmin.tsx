"use client"

import React, { useState, useEffect, useRef } from "react"
import { Edit, Trash2, Clock, X, Loader2, CheckCircle, Search } from "lucide-react"

interface Annonce {
  id: number
  titre: string
  message: string
  date_publication: string
  photo: string | null
}

const API_URL = "http://localhost:8000/api/annonces/"

// === MODAL DE SUCCÈS ===
const SuccessModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  message: string 
}> = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Overlay avec opacité */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
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
              onClick={onClose}
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
            {message}
          </h3>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

// === MODAL DE CONFIRMATION DE SUPPRESSION ===
const DeleteConfirmModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void;
  annonceTitre: string;
}> = ({ isOpen, onClose, onConfirm, annonceTitre }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Overlay avec opacité */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Contenu du modal */}
      <div
        className="relative bg-white rounded-lg shadow-lg w-full max-w-sm mx-4 overflow-hidden border border-red-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête avec bouton X */}
        <div className="bg-red-500 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white text-center flex-1">
              Confirmation
            </h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/20 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenu du modal */}
        <div className="p-6 text-center">
          <div className="flex justify-center mb-4">
            <Trash2 className="w-16 h-16 text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Confirmer la suppression
          </h3>
          <p className="text-gray-600 mb-4">
            Êtes-vous sûr de vouloir supprimer l'annonce "<strong>{annonceTitre}</strong>" ?
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// === MODAL ÉDITION AVEC OPACITÉ ===
const EditModal: React.FC<{
  annonce: Annonce
  onClose: () => void
  onSave: (updated: Annonce) => void
}> = ({ annonce, onClose, onSave }) => {
  const [formData, setFormData] = useState<Annonce>(annonce)
  const [imagePreview, setImagePreview] = useState<string | null>(annonce.photo)
  const [newImage, setNewImage] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [])

  useEffect(() => {
    setFormData({ ...annonce, titre: annonce.titre || "" })
    setImagePreview(annonce.photo)
    setNewImage(null)
  }, [annonce])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewImage(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async () => {
    const fd = new FormData()
    fd.append("titre", formData.titre)
    fd.append("message", formData.message)
    if (newImage) fd.append("photo", newImage)

    const res = await fetch(`${API_URL}${formData.id}/`, {
      method: "PUT",
      body: fd,
    })

    if (res.ok) {
      const updated = await res.json()
      onSave(updated)
      onClose()
    } else {
      alert("Erreur de mise à jour")
    }
  }

  if (!annonce) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay avec opacité */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Contenu du modal */}
      <div
        className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-4 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête avec bouton X */}
        <div className="bg-green-500 from-green-600 p-3 md:p-4">
           <div className="flex items-center justify-between">
                <h2 className="text-base md:text-lg font-bold text-white text-center flex-1">
                   Modifier l'annonce
                </h2>
                <button
                    onClick={onClose}
                    className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/20 rounded-lg"
                >
                    <X className="w-4 h-4 md:w-5 md:h-5" />
                </button>
            </div>
        </div>

        {/* Contenu du formulaire */}
        <div className="p-4 space-y-4">
          {/* Type d'annonce */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type d'annonce
            </label>
            <select
              value={formData.titre || ""}
              onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500"
            >
              <option value="">Choisir un type</option>
              <option value="maintenance">Maintenance</option>
              <option value="fermeture">Fermeture</option>
              <option value="urgence">Urgence</option>
              <option value="cyclone">Cyclone</option>
              <option value="Autre">Autre</option>
            </select>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              placeholder="Entrez votre message..."
            />
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image
            </label>
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-32 object-cover rounded-md mb-2"
              />
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Changer l'image
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Boutons */}
        <div className="flex gap-3 p-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 text-white bg-red-700 border border-gray-300 rounded-md text-sm font-medium hover:bg-red-500 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  )
}

// === MODAL IMAGE AVEC OPACITÉ ===
const ImageModal: React.FC<{ imageUrl: string; onClose: () => void }> = ({ imageUrl, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay avec opacité */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative max-w-full max-h-full p-4" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white text-gray-800 rounded-full p-2 shadow-lg hover:bg-gray-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <img
          src={imageUrl}
          alt="Annonce"
          className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
        />
      </div>
    </div>
  )
}

// === COMPOSANT PRINCIPAL ===
export default function AffichageAnnonceAdmin() {
  const [annonces, setAnnonces] = useState<Annonce[]>([])
  const [filteredAnnonces, setFilteredAnnonces] = useState<Annonce[]>([])
  const [loading, setLoading] = useState(true)
  const [editAnnonce, setEditAnnonce] = useState<Annonce | null>(null)
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("all")
  const [activeImageUrl, setActiveImageUrl] = useState<string | null>(null)
  
  // États pour les modales de succès et confirmation
  const [successModal, setSuccessModal] = useState({ isOpen: false, message: "" })
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({ isOpen: false, annonce: null as Annonce | null })

  // Fonction pour filtrer les annonces par type
  const filterAnnoncesByType = (annoncesList: Annonce[], type: string) => {
    if (!type || type === "all") return annoncesList;
    return annoncesList.filter(annonce => annonce.titre.toLowerCase().includes(type.toLowerCase()));
  };

  useEffect(() => {
    const fetchAnnonces = async () => {
      try {
        setLoading(true);
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: Annonce[] = await res.json();
        setAnnonces(data);
        setFilteredAnnonces(filterAnnoncesByType(data, filter));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    };
    fetchAnnonces();
  }, []);

  // Effet pour filtrer les annonces quand le type sélectionné change
  useEffect(() => {
    setFilteredAnnonces(filterAnnoncesByType(annonces, filter));
  }, [filter, annonces]);

  const handleDelete = async (id: number) => {
    const res = await fetch(`${API_URL}${id}/`, { method: "DELETE" })
    if (res.ok) {
      setAnnonces((prev) => prev.filter((a) => a.id !== id))
      setSuccessModal({ isOpen: true, message: "Annonce supprimée avec succès" })
    } else {
      alert("Erreur lors de la suppression")
    }
  }

  const handleSave = (updated: Annonce) => {
    setAnnonces((prev) =>
      prev.map((a) => (a.id === updated.id ? updated : a))
    )
    setSuccessModal({ isOpen: true, message: "Annonce modifiée avec succès" })
  }

  // Fonction pour ouvrir la modale de confirmation de suppression
  const openDeleteConfirm = (annonce: Annonce) => {
    setDeleteConfirmModal({ isOpen: true, annonce })
  }

  // Fonction pour confirmer la suppression
  const confirmDelete = () => {
    if (deleteConfirmModal.annonce) {
      handleDelete(deleteConfirmModal.annonce.id)
      setDeleteConfirmModal({ isOpen: false, annonce: null })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="ml-3 text-lg text-gray-600">Chargement...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-red-50 rounded-xl border border-red-200">
        <p className="text-red-700 font-semibold">Erreur : {error}</p>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-red-50 to-green-50 min-h-screen relative">
      {/* En-tête centré */}
      <h1 className="text-2xl md:text-3xl font-extrabold text-center mb-6 md:mb-8 text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-green-600">
        Liste des Annonces ({filteredAnnonces.length})
      </h1>

      {/* Barre de recherche/filtre centrée - STYLE LISTEALERTE */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex items-center gap-2 text-gray-600">
              <Search className="w-5 h-5" />
              <span className="font-medium">Filtrer par type :</span>
            </div>
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="all">Toutes les annonces</option>
              <option value="maintenance">Maintenance</option>
              <option value="fermeture">Fermeture</option>
              <option value="cyclone">Cyclone</option>
              <option value="urgence">Urgence</option>
            </select>
            {filter !== "all" && (
              <button
                onClick={() => setFilter("all")}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors"
              >
                Réinitialiser
              </button>
            )}
          </div>
        </div>
      </div>

      {filteredAnnonces.length === 0 ? (
        <div className="text-center p-10 bg-white rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800">
            {annonces.length === 0 
              ? "Aucune annonce disponible" 
              : filter !== "all" 
                ? `Aucune annonce de type "${filter}"` 
                : "Aucune annonce ne correspond aux critères"}
          </h2>
        </div>
      ) : (
        <div className="space-y-6 md:space-y-8 max-w-5xl mx-auto">
          {filteredAnnonces.map((annonce) => (
            <div
              key={annonce.id}
              className="bg-white rounded-3xl shadow-2xl p-4 md:p-8 border-4 border-red-100 flex flex-col md:flex-row gap-4 md:gap-8"
            >
              {/* Contenu principal - Ordre modifié pour mobile */}
              <div className="flex-1 order-2 md:order-1">
                {/* Type annonce en haut */}
                <h3 className="text-xl md:text-3xl font-bold text-red-700 mb-2 md:mb-0">
                  {annonce.titre}
                </h3>
                
                {/* Image en dessous du type sur mobile */}
                {annonce.photo && (
                  <div className="my-3 md:hidden">
                    <img
                      src={annonce.photo}
                      alt="Annonce"
                      className="w-full h-48 object-cover rounded-2xl shadow-xl cursor-pointer"
                      onClick={() => setActiveImageUrl(annonce.photo)}
                    />
                  </div>
                )}
                
                {/* Message/description */}
                <p className="text-gray-700 text-base md:text-lg mt-2 md:mt-4">
                  {annonce.message}
                </p>
                
                {/* Date */}
                <div className="flex items-center mt-3 md:mt-4 text-gray-600 text-sm md:text-base">
                  <Clock className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  {new Date(annonce.date_publication).toLocaleString("fr-MG")}
                </div>
              </div>

              {/* Colonne droite - Image (desktop) et boutons */}
              <div className="flex flex-col md:flex-row items-start gap-4 order-1 md:order-2">
                {/* Image - cachée sur mobile car déjà affichée au-dessus */}
                {annonce.photo && (
                  <div className="hidden md:block">
                    <img
                      src={annonce.photo}
                      alt="Annonce"
                      className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-2xl shadow-xl cursor-pointer"
                      onClick={() => setActiveImageUrl(annonce.photo)}
                    />
                  </div>
                )}

                {/* Boutons modifier/supprimer - alignés à droite */}
                <div className="flex gap-2 md:gap-4 ml-auto">
                  <button
                    onClick={() => setEditAnnonce(annonce)}
                    className="flex items-center justify-center py-2 px-3 rounded-full text-sm bg-yellow-500 text-white hover:bg-yellow-600 transition shadow-md"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openDeleteConfirm(annonce)}
                    className="flex items-center justify-center py-2 px-3 rounded-full text-sm bg-red-500 text-white hover:bg-red-600 transition shadow-md"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODALS */}
      {editAnnonce && (
        <EditModal
          annonce={editAnnonce}
          onClose={() => setEditAnnonce(null)}
          onSave={handleSave}
        />
      )}

      {activeImageUrl && (
        <ImageModal imageUrl={activeImageUrl} onClose={() => setActiveImageUrl(null)} />
      )}

      {/* Modal de succès */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, message: "" })}
        message={successModal.message}
      />

      {/* Modal de confirmation de suppression */}
      <DeleteConfirmModal
        isOpen={deleteConfirmModal.isOpen}
        onClose={() => setDeleteConfirmModal({ isOpen: false, annonce: null })}
        onConfirm={confirmDelete}
        annonceTitre={deleteConfirmModal.annonce?.titre || ""}
      />
    </div>
  )
}