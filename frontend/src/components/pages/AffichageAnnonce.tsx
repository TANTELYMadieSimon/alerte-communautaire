"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Wrench, Ban, Calendar, AlertTriangle, Speaker, Clock, Loader2, X, Search } from "lucide-react"

// Interface adaptée à ta DB
interface Annonce {
  id: number
  titre: string
  message: string
  date_publication: string
  photo: string | null
}

const API_URL = "http://localhost:8000/api/annonces/"

interface ImageModalProps {
  imageUrl: string
  onClose: () => void
}

const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, onClose }) => {
  const [isImageLoaded, setIsImageLoaded] = useState<boolean>(false)
  const [imageError, setImageError] = useState<boolean>(false)

  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [])

  const handleImageError = () => {
    console.error(`[ERREUR CHARGEMENT IMAGE] ${imageUrl}`)
    setImageError(true)
    setIsImageLoaded(true)
  }

  const handleImageLoad = () => {
    setIsImageLoaded(true)
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-90 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div className="relative max-w-full max-h-full lg:max-w-6xl p-4" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-0 right-0 z-10 bg-white text-gray-800 rounded-full p-2 shadow-xl hover:bg-gray-200 transition transform translate-x-2 -translate-y-2"
          aria-label="Fermer"
        >
          <X className="w-6 h-6" />
        </button>

        {!isImageLoaded && !imageError && (
          <div className="flex justify-center items-center min-w-[200px] min-h-[200px] bg-gray-700 rounded-lg">
            <Loader2 className="w-10 h-10 animate-spin text-white" />
          </div>
        )}

        {imageError ? (
          <div className="p-8 bg-red-600 text-white rounded-lg text-center max-w-md mx-auto">
            <p className="font-bold mb-2 text-xl">Image non disponible</p>
            <button
              onClick={onClose}
              className="mt-4 bg-white text-red-600 px-4 py-2 rounded-full font-semibold"
            >
              Fermer
            </button>
          </div>
        ) : (
          <img
            src={imageUrl}
            alt="Photo agrandie"
            className={`max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl transition-opacity ${isImageLoaded ? "opacity-100" : "opacity-0"}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}
      </div>
    </div>
  )
}

// Icône selon le titre
const getTypeIcon = (titre: string) => {
  const lower = titre.toLowerCase()
  if (lower.includes("maintenance")) return <Wrench className="w-6 h-6" />
  if (lower.includes("fermeture")) return <Ban className="w-6 h-6" />
  if (lower.includes("evenement") || lower.includes("événement")) return <Calendar className="w-6 h-6" />
  if (lower.includes("urgence")) return <AlertTriangle className="w-6 h-6" />
  return <Speaker className="w-6 h-6" />
}

// Couleur selon le titre
const getTypeColorClasses = (titre: string): { bg: string; text: string } => {
  const lower = titre.toLowerCase()
  if (lower.includes("maintenance")) return { bg: "bg-amber-500", text: "text-amber-800" }
  if (lower.includes("fermeture")) return { bg: "bg-red-500", text: "text-red-800" }
  if (lower.includes("evenement") || lower.includes("événement")) return { bg: "bg-green-500", text: "text-green-800" }
  if (lower.includes("urgence")) return { bg: "bg-rose-600", text: "text-rose-800" }
  return { bg: "bg-gray-500", text: "text-gray-800" }
}

interface AnnonceItemProps {
  annonce: Annonce
  onPhotoClick: (url: string) => void
}

const AnnonceItem: React.FC<AnnonceItemProps> = ({ annonce, onPhotoClick }) => {
  const colorClasses = getTypeColorClasses(annonce.titre)
  const photoUrl = annonce.photo

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition duration-300 border border-gray-100 flex flex-col md:flex-row gap-4 items-start">
      {/* Affiche la photo SI elle existe */}
      {photoUrl && (
        <div className="flex-shrink-0">
          <button
            onClick={() => onPhotoClick(photoUrl)}
            className="focus:outline-none focus:ring-4 focus:ring-indigo-500 rounded-lg"
            aria-label="Agrandir la photo"
          >
            <img
              src={photoUrl}
              alt="Miniature de l'annonce"
              className="w-24 h-24 object-cover rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:opacity-80 transition-opacity"
              onError={(e) => {
                console.error("Image non chargée :", photoUrl)
                e.currentTarget.style.display = "none"
              }}
            />
          </button>
        </div>
      )}

      <div className="flex-grow space-y-2 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <div className={`w-8 h-8 flex items-center justify-center rounded-full text-white ${colorClasses.bg}`}>
            {getTypeIcon(annonce.titre)}
          </div>
          <h3 className="text-lg font-semibold text-gray-800">
            {annonce.titre}
          </h3>
        </div>

        <p className="text-gray-600 text-sm leading-relaxed">{annonce.message}</p>

        <div className="flex flex-wrap items-center text-sm text-gray-500 gap-3 pt-2">
          <span className="flex items-center font-medium">
            <Clock className="w-4 h-4 mr-1 text-indigo-400" />
            {new Date(annonce.date_publication).toLocaleString("fr-FR", {
              weekday: "long",
              day: "2-digit",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function AffichageAnnonce() {
  const [annonces, setAnnonces] = useState<Annonce[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState("all")
  const [activeImageUrl, setActiveImageUrl] = useState<string | null>(null)

  const handlePhotoClick = useCallback((url: string) => {
    setActiveImageUrl(url)
  }, [])

  const handleCloseModal = useCallback(() => {
    setActiveImageUrl(null)
  }, [])

  useEffect(() => {
    const fetchAnnonces = async () => {
      try {
        setLoading(true)
        const res = await fetch(API_URL)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data: Annonce[] = await res.json()
        console.log("Annonces reçues →", data)
        setAnnonces(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur")
      } finally {
        setLoading(false)
      }
    }
    fetchAnnonces()
  }, [])

  // FILTRAGE CORRIGÉ : sur titre.toLowerCase()
  const filteredAnnonces = filter === "all"
    ? annonces
    : annonces.filter(a => a.titre.toLowerCase().includes(filter.toLowerCase()))

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
    <div className="p-4 md:p-8 max-w-4xl mx-auto bg-gray-50 min-h-screen">
      {/* En-tête centré comme ListeAlerte */}
      <h1 className="text-2xl md:text-3xl font-extrabold text-center mb-6 md:mb-8 text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-green-600">
        Annonces Publiques ({filteredAnnonces.length})
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

      <div className="space-y-4">
        {filteredAnnonces.length === 0 ? (
          <div className="text-center p-10 bg-white rounded-xl shadow-lg">
            <Speaker className="w-12 h-12 mx-auto text-gray-400" />
            <h2 className="mt-4 text-xl font-semibold text-gray-800">
              {annonces.length === 0 
                ? "Aucune annonce disponible" 
                : filter !== "all" 
                  ? `Aucune annonce de type "${filter}"` 
                  : "Aucune annonce ne correspond aux critères"}
            </h2>
          </div>
        ) : (
          filteredAnnonces.map((annonce) => (
            <AnnonceItem key={annonce.id} annonce={annonce} onPhotoClick={handlePhotoClick} />
          ))
        )}
      </div>

      {activeImageUrl && <ImageModal imageUrl={activeImageUrl} onClose={handleCloseModal} />}
    </div>
  )
}