import React, { useState, useCallback } from 'react';
import { MapPin, ArrowRight, ListChecks, Loader2, X, Check, Search, Clock } from 'lucide-react';

export type Alerte = {
  id: number;
  type_alerte: string;
  description: string;
  latitude: number | null;
  longitude: number | null;
  date_creation: string;
  adresse: string;
  photo: string | null;
  utilisateur_nom: string | null;
  statut: 'en_cours' | 'termine';
};

export interface ListeAlerteProps {
  goToMapWithAlert: (params: { lat: number; lng: number; nomLieu: string }) => void;
}

const API_URL = 'http://localhost:8000/api/alertes/';

// Types d'alerte disponibles pour le filtre
const ALERT_TYPES = [
  { value: '', label: 'Tous les types' },
  { value: 'incendie', label: 'Incendie' },
  { value: 'inondation', label: 'Inondation' },
  { value: 'vol', label: 'Vol' },
  { value: 'autre', label: 'Autre' },
];

// === MODAL DE SUCCÈS ===
const SuccessModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  message: string 
}> = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div
        className="relative bg-white rounded-lg shadow-lg w-full max-w-sm mx-4 overflow-hidden border border-green-200"
        onClick={(e) => e.stopPropagation()}
      >
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

        <div className="p-6 text-center">
          <div className="flex justify-center mb-4">
            <Check className="w-16 h-16 text-green-500" />
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

// === ImageModal ===
interface ImageModalProps {
  imageUrl: string;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, onClose }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleImageError = () => {
    console.error(`[ERREUR CHARGEMENT IMAGE] ${imageUrl}`);
    setImageError(true);
    setIsImageLoaded(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex justify-center items-center p-4" onClick={onClose}>
      <div className="relative max-w-full max-h-full lg:max-w-6xl p-4" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-0 right-0 z-10 bg-white text-gray-800 rounded-full p-2 shadow-xl hover:bg-gray-200 transition transform translate-x-2 -translate-y-2"
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
            <p className="font-bold mb-2 text-xl">Erreur de Chargement</p>
            <button onClick={onClose} className="mt-4 bg-white text-red-600 px-4 py-2 rounded-full font-semibold">
              Fermer
            </button>
          </div>
        ) : (
          <img
            src={imageUrl}
            alt="Photo d'alerte"
            className={`max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl transition-opacity duration-300 ${
              isImageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setIsImageLoaded(true)}
            onError={handleImageError}
          />
        )}
      </div>
    </div>
  );
};

// === AlerteItem ===
interface AlerteItemProps {
  alerte: Alerte;
  goToMap: (params: { lat: number; lng: number; nomLieu: string }) => void;
  onPhotoClick: (url: string) => void;
  onTerminer: (id: number) => void;
}

const AlerteItem: React.FC<AlerteItemProps> = ({ alerte, goToMap, onPhotoClick, onTerminer }) => {
  const hasLocation = alerte.latitude !== null && alerte.longitude !== null;
  const nomLieu = alerte.adresse.split(',')[0].trim() || 'Lieu inconnu';
  const photoUrl = alerte.photo;
  const isTermine = alerte.statut === 'termine';

  const handleViewOnMap = () => {
    if (hasLocation && alerte.latitude && alerte.longitude) {
      goToMap({ lat: alerte.latitude, lng: alerte.longitude, nomLieu });
    }
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg hover:shadow-xl transition duration-300 border border-gray-100 flex flex-col">
      {/* En-tête avec type d'alerte, badge et boutons d'action */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2 flex-wrap flex-1">
          <ListChecks className="w-5 h-5 text-indigo-500" />
          <h3 className="text-lg font-semibold text-gray-800 capitalize">{alerte.type_alerte}</h3>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            isTermine ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {isTermine ? 'Terminé' : 'En cours'}
          </span>
        </div>
        
        {/* Bouton Terminer uniquement - Plus de bouton Supprimer */}
        <div className="flex gap-2 ml-4">
          {!isTermine && (
            <button
              onClick={() => onTerminer(alerte.id)}
              className="flex items-center justify-center py-2 px-3 rounded-full text-sm bg-green-500 text-white hover:bg-green-600 transition shadow-md"
              title="Marquer comme terminé"
            >
              <Check className="w-4 h-4" />
              <span className="ml-1 hidden sm:inline">Terminer</span>
            </button>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 italic text-sm mb-3">{alerte.description}</p>

      {/* Informations lieu et date avec HEURE ET MINUTE */}
      <div className="flex flex-wrap items-center text-sm text-gray-500 gap-3 mb-4">
        <span className="flex items-center">
          <MapPin className="w-4 h-4 mr-1 text-indigo-400" />
          {nomLieu}
        </span>
        <span className="flex items-center">
          <Clock className="w-4 h-4 mr-1 text-indigo-400" />
          {new Date(alerte.date_creation).toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      </div>

      {/* Zone photo + bouton Voir sur Carte */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-auto">
        {/* Photo - à gauche */}
        {photoUrl && (
          <div className="flex-shrink-0">
            <button onClick={() => onPhotoClick(photoUrl)}>
              <img
                src={photoUrl}
                alt="Photo"
                className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:opacity-80"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            </button>
          </div>
        )}

        {/* Bouton Voir sur Carte aligné à droite */}
        <div className="w-full flex justify-end sm:w-auto sm:ml-auto">
          <div className="flex flex-col gap-2 flex-shrink-0">
            <button
              onClick={handleViewOnMap}
              disabled={!hasLocation}
              className={`flex items-center justify-center font-medium py-2 px-4 rounded-full text-sm whitespace-nowrap transition shadow-md ${
                hasLocation 
                  ? 'bg-indigo-500 text-white hover:bg-indigo-600' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {hasLocation ? (
                <>
                  Voir sur Carte <ArrowRight className="w-4 h-4 ml-2" />
                </>
              ) : (
                'Pas de position'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// === Composant Principal ===
const ListeAlerteComponent: React.FC<ListeAlerteProps> = ({ goToMapWithAlert }) => {
  const [alerts, setAlerts] = useState<Alerte[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<Alerte[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageUrl, setActiveImageUrl] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>('');

  // État pour le modal de succès uniquement
  const [successModal, setSuccessModal] = useState({ isOpen: false, message: "" });

  const handlePhotoClick = useCallback((url: string) => setActiveImageUrl(url), []);
  const handleCloseImageModal = useCallback(() => setActiveImageUrl(null), []);

  // Fonction pour filtrer les alertes par type
  const filterAlertsByType = useCallback((alertsList: Alerte[], type: string) => {
    if (!type) return alertsList;
    return alertsList.filter(alerte => alerte.type_alerte === type);
  }, []);

  // Fonction pour trier les alertes par date de création (du plus récent au plus ancien)
  const sortAlertsByDate = useCallback((alertsList: Alerte[]) => {
    return alertsList.sort((a, b) => new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime());
  }, []);

  const fetchAlerts = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data: Alerte[] = await response.json();
      
      // TRI DES ALERTES : Les plus récentes en premier
      const sortedAlerts = sortAlertsByDate(data);
      
      setAlerts(sortedAlerts);
      setFilteredAlerts(filterAlertsByType(sortedAlerts, selectedType));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  }, [filterAlertsByType, selectedType, sortAlertsByDate]);

  React.useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // Effet pour filtrer les alertes quand le type sélectionné change
  React.useEffect(() => {
    const filtered = filterAlertsByType(alerts, selectedType);
    // Re-trier les alertes filtrées par date (du plus récent au plus ancien)
    const sortedFiltered = sortAlertsByDate([...filtered]);
    setFilteredAlerts(sortedFiltered);
  }, [selectedType, alerts, filterAlertsByType, sortAlertsByDate]);

  const showSuccessMessage = (msg: string) => {
    setSuccessModal({ isOpen: true, message: msg });
  };

  // Fonction pour marquer une alerte comme terminée
  const handleTerminerAlerte = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ statut: 'termine' }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const updatedAlerte = await res.json();
      setAlerts(prev => prev.map(a => a.id === id ? updatedAlerte : a));
      showSuccessMessage("Alerte marquée comme terminée");
    } catch (err) {
      alert(`Erreur: ${err instanceof Error ? err.message : err}`);
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="ml-3">Chargement...</p>
      </div>
    );

  if (error) return <p className="text-red-600 text-center">{error}</p>;

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-red-50 to-green-50 min-h-screen relative">
      <h1 className="text-2xl md:text-3xl font-extrabold text-center mb-6 md:mb-8 text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-green-600">
        Liste des Alertes ({filteredAlerts.length})
      </h1>

      {/* Barre de recherche/filtre centrée */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex items-center gap-2 text-gray-600">
              <Search className="w-5 h-5" />
              <span className="font-medium">Filtrer par type :</span>
            </div>
            <select 
              value={selectedType} 
              onChange={(e) => setSelectedType(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              {ALERT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {selectedType && (
              <button
                onClick={() => setSelectedType('')}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors"
              >
                Réinitialiser
              </button>
            )}
          </div>
        </div>
      </div>

      {filteredAlerts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {alerts.length === 0 
              ? "Aucune alerte disponible." 
              : selectedType 
                ? `Aucune alerte de type "${ALERT_TYPES.find(t => t.value === selectedType)?.label}".` 
                : "Aucune alerte ne correspond aux critères."}
          </p>
        </div>
      ) : (
        <div className="space-y-4 max-w-4xl mx-auto">
          {filteredAlerts.map((alerte) => (
            <AlerteItem
              key={alerte.id}
              alerte={alerte}
              goToMap={goToMapWithAlert}
              onPhotoClick={handlePhotoClick}
              onTerminer={handleTerminerAlerte}
            />
          ))}
        </div>
      )}

      <p className="text-sm text-gray-500 text-center pt-4">
        Cliquez sur "Voir sur Carte" pour localiser l'alerte.
      </p>

      {/* Modal Image */}
      {activeImageUrl && <ImageModal imageUrl={activeImageUrl} onClose={handleCloseImageModal} />}

      {/* Modal de succès */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, message: "" })}
        message={successModal.message}
      />
    </div>
  );
};

export default ListeAlerteComponent;