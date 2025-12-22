import React, { useState, useCallback, useEffect } from 'react';
import {
    LogOut, Map, History, Megaphone, ListChecks, ClipboardList, Menu, X, BellRing,
    Mail, User
} from 'lucide-react';

// --- Importation des VRAIS composants de page ---
import CarteComponent, { type CarteProps } from './pages/Carte'; 
import HistoriqueComponent from './pages/Historique'; 
import AjoutAlerteComponent from './pages/AjoutAlerte';     
import AffichageAnnonceComponent from './pages/AffichageAnnonce'; 
import ListeAlerteComponent, { type ListeAlerteProps, type Alerte } from './pages/ListeAlerte';

// --- Nouveaux Types pour la gestion des alertes ---
interface AlertParams {
    lat: number;
    lng: number;
    nomLieu: string;
}

interface AdminDashboardProps {
    onLogout: () => void;
}

// Définir un type union pour les props du composant actuel
type ComponentProps = CarteProps | ListeAlerteProps | Record<string, unknown>;

interface Tab {
    id: string;
    label: string;
    icon: React.ElementType; 
    component: React.FC<any>;
    notificationCount?: number;
}

// URLs des APIs
const ALERTES_API_URL = 'http://localhost:8000/api/alertes/';
const ANNONCES_API_URL = 'http://localhost:8000/api/annonces/';

// --- Configuration des Onglets ---
const tabs: Tab[] = [
    { id: "carte", label: "Carte", icon: Map, component: CarteComponent },
    { id: "historique", label: "Historique", icon: History, component: HistoriqueComponent },
    { id: "alerte", label: "Alerter", icon: Megaphone, component: AjoutAlerteComponent },
    { id: "affichage", label: "Annonces", icon: ListChecks, component: AffichageAnnonceComponent },
    { id: "liste", label: "Alertes", icon: ClipboardList, component: ListeAlerteComponent },
];

// Types pour les données
interface Annonce {
    id: number;
    titre: string;
    contenu: string;
    created_at: string;
}

export default function UserDashboard({ onLogout }: AdminDashboardProps) {
    const [currentTabId, setCurrentTabId] = useState<string>(tabs[0].id);
    const [menuOpen, setMenuOpen] = useState<boolean>(false);
    
    // NOUVEAU: État pour stocker les paramètres d'alerte sélectionnés
    const [alertParams, setAlertParams] = useState<AlertParams | null>(null);

    // 🔥 AJOUT: État pour gérer l'alerte en cours de modification (nécessaire pour onEdit)
    const [alerteToEdit, setAlerteToEdit] = useState<Alerte | null>(null);

    // 🔥 AJOUT: Récupérer les données de l'utilisateur connecté
    const [currentUser] = useState(() => {
        const saved = localStorage.getItem('currentUser');
        return saved ? JSON.parse(saved) : null;
    });

    // NOUVEAU : États pour les notifications
    const [unreadAlertsCount, setUnreadAlertsCount] = useState<number>(0);
    const [unreadAnnoncesCount, setUnreadAnnoncesCount] = useState<number>(0);
    const [tabsWithNotifications, setTabsWithNotifications] = useState<Tab[]>(tabs);
    
    // NOUVEAU : Stocker le dernier ID vu pour chaque type
    const [lastSeenAlertId, setLastSeenAlertId] = useState<number>(0);
    const [lastSeenAnnonceId, setLastSeenAnnonceId] = useState<number>(0);

    // NOUVEAU : Référence pour forcer le refresh
    const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

    // Charger les derniers IDs vus depuis le localStorage
    useEffect(() => {
        const savedLastSeenAlertId = localStorage.getItem('lastSeenAlertId');
        const savedLastSeenAnnonceId = localStorage.getItem('lastSeenAnnonceId');
        
        if (savedLastSeenAlertId) {
            setLastSeenAlertId(parseInt(savedLastSeenAlertId, 10));
        }
        if (savedLastSeenAnnonceId) {
            setLastSeenAnnonceId(parseInt(savedLastSeenAnnonceId, 10));
        }
    }, []);

    // NOUVEAU : Fonction pour forcer le refresh des notifications
    const forceRefreshNotifications = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    // NOUVEAU : Fonction pour récupérer seulement les NOUVELLES alertes non lues
    const fetchUnreadAlertsCount = useCallback(async () => {
        try {
            const response = await fetch(ALERTES_API_URL);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data: Alerte[] = await response.json();
            
            const newAlerts = data.filter(alerte => 
                alerte.statut === 'en_cours' && alerte.id > lastSeenAlertId
            );
            
            setUnreadAlertsCount(newAlerts.length);
            return newAlerts.length;
        } catch (error) {
            console.error('Erreur lors du fetch des alertes:', error);
            return 0;
        }
    }, [lastSeenAlertId]);

    // NOUVEAU : Fonction pour récupérer seulement les NOUVELLES annonces non lues
    const fetchUnreadAnnoncesCount = useCallback(async () => {
        try {
            const response = await fetch(ANNONCES_API_URL);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data: Annonce[] = await response.json();
            
            const newAnnonces = data.filter(annonce => 
                annonce.id > lastSeenAnnonceId
            );
            
            setUnreadAnnoncesCount(newAnnonces.length);
            return newAnnonces.length;
        } catch (error) {
            console.error('Erreur lors du fetch des annonces:', error);
            return 0;
        }
    }, [lastSeenAnnonceId]);

    // NOUVEAU : Marquer les alertes comme lues
    const markAlertsAsRead = useCallback(async () => {
        try {
            const response = await fetch(ALERTES_API_URL);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data: Alerte[] = await response.json();
            
            const alertIds = data
                .filter(alerte => alerte.statut === 'en_cours')
                .map(alerte => alerte.id);
            
            if (alertIds.length > 0) {
                const maxAlertId = Math.max(...alertIds);
                setLastSeenAlertId(maxAlertId);
                localStorage.setItem('lastSeenAlertId', maxAlertId.toString());
            }
            
            setUnreadAlertsCount(0);
            
        } catch (error) {
            console.error('Erreur lors du marquage des alertes comme lues:', error);
        }
    }, []);

    // NOUVEAU : Marquer les annonces comme lues
    const markAnnoncesAsRead = useCallback(async () => {
        try {
            const response = await fetch(ANNONCES_API_URL);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data: Annonce[] = await response.json();
            
            const annonceIds = data.map(annonce => annonce.id);
            
            if (annonceIds.length > 0) {
                const maxAnnonceId = Math.max(...annonceIds);
                setLastSeenAnnonceId(maxAnnonceId);
                localStorage.setItem('lastSeenAnnonceId', maxAnnonceId.toString());
            }
            
            setUnreadAnnoncesCount(0);
            
        } catch (error) {
            console.error('Erreur lors du marquage des annonces comme lues:', error);
        }
    }, []);

    // NOUVEAU : Mettre à jour les compteurs de notifications
    const updateNotificationCounts = useCallback(async () => {
        const alertsCount = await fetchUnreadAlertsCount();
        const annoncesCount = await fetchUnreadAnnoncesCount();
        
        // Mettre à jour les tabs avec les notifications - seulement si > 0
        const updatedTabs = tabs.map(tab => {
            if (tab.id === 'liste') {
                return alertsCount > 0 
                    ? { ...tab, notificationCount: alertsCount }
                    : { ...tab, notificationCount: undefined };
            } else if (tab.id === 'affichage') {
                return annoncesCount > 0 
                    ? { ...tab, notificationCount: annoncesCount }
                    : { ...tab, notificationCount: undefined };
            }
            return tab;
        });
        
        setTabsWithNotifications(updatedTabs);
    }, [fetchUnreadAlertsCount, fetchUnreadAnnoncesCount]);

    // NOUVEAU : Effet pour récupérer les notifications immédiatement après les actions
    useEffect(() => {
        updateNotificationCounts();
    }, [refreshTrigger, updateNotificationCounts]);

    // NOUVEAU : Effet pour les mises à jour périodiques
    useEffect(() => {
        const interval = setInterval(updateNotificationCounts, 30000);
        return () => clearInterval(interval);
    }, [updateNotificationCounts]);

    // NOUVEAU : Effet pour marquer comme lu quand on visite l'onglet
    useEffect(() => {
        if (currentTabId === 'liste' && unreadAlertsCount > 0) {
            markAlertsAsRead();
        } else if (currentTabId === 'affichage' && unreadAnnoncesCount > 0) {
            markAnnoncesAsRead();
        }
    }, [currentTabId, unreadAlertsCount, unreadAnnoncesCount, markAlertsAsRead, markAnnoncesAsRead]);

    const CurrentComponent = tabs.find(tab => tab.id === currentTabId)?.component || tabs[0].component;

    // --- Fonctions de Gestion des États ---

    const handleTabClick = useCallback((tabId: string) => {
        setCurrentTabId(tabId);
        setMenuOpen(false); 
        
        // Règle: Si on quitte l'onglet "Carte", on efface les paramètres d'alerte spécifiques.
        if (tabId !== 'carte') {
            setAlertParams(null);
        }
        // Fermer la modale d'édition si l'on change d'onglet
        setAlerteToEdit(null);
    }, []);
    
    // NOUVELLE FONCTION: Utiliser cette fonction pour naviguer vers la carte avec une alerte spécifique
    const goToMapWithAlert = useCallback((params: AlertParams) => {
        setAlertParams(params);
        setCurrentTabId('carte'); // 1. Changer l'onglet pour 'carte'
        setMenuOpen(false);       // 2. Fermer le menu si sur mobile
    }, []);

    // 🔥 AJOUT NÉCESSAIRE: Ouvre le formulaire de modification avec les données de l'alerte
    const handleEditAlert = useCallback((alerte: Alerte) => {
        setAlerteToEdit(alerte); // Stocke l'alerte pour l'affichage du formulaire
    }, []);

    // 🔥 AJOUT NÉCESSAIRE: Ferme le formulaire de modification et le réinitialise
    const handleCloseEdit = useCallback(() => {
        setAlerteToEdit(null); // Cache le formulaire/la modale
    }, []);
    
    // NOUVELLE FONCTION: Efface les paramètres spécifiques de la carte
    const clearAlertParams = useCallback(() => {
        setAlertParams(null);
    }, []);

    // NOUVEAU : Composant Badge de notification
    const NotificationBadge: React.FC<{ count: number }> = ({ count }) => {
        if (count <= 0) return null;
        
        return (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold animate-pulse">
                {count > 99 ? '99+' : count}
            </span>
        );
    };

    // Styles CSS intégrés pour la réactivité mobile
    const style = `
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
        .mobile-menu-slide { animation: slideIn 0.3s ease-out; }
        .mobile-menu-slide-out { animation: slideOut 0.3s ease-in; }
        .bottom-nav {
            position: fixed; bottom: 0; left: 0; right: 0; z-index: 50; 
            background-color: white; border-top: 1px solid #e5e7eb;
            box-shadow: 0 -4px 6px -1px rgb(0 0 0 / 0.1), 0 -2px 4px -2px rgb(0 0 0 / 0.1);
            display: flex; justify-content: space-around; padding: 0.5rem 0;
        }
        .nav-item { display: flex; flex-direction: column; align-items: center; padding: 0.5rem; border-radius: 0.5rem; transition: all 0.2s; position: relative; }
        .nav-item .nav-label { font-size: 0.75rem; line-height: 1; margin-top: 0.25rem; font-weight: 500; }
        @media (min-width: 768px) { .bottom-nav { display: none; } }
        
        /* Animation pour les badges */
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }
        .animate-pulse {
            animation: pulse 2s infinite;
        }
    `;

    // Préparation des props spécifiques à passer
    let componentProps: ComponentProps = {};

    // NOUVEAU : Passer la fonction de refresh aux composants enfants
    if (currentTabId === 'carte') {
        componentProps = { 
            role: "user", 
            alertParams, 
            clearAlertParams,
            onDataChange: forceRefreshNotifications // ← NOUVEAU
        } as CarteProps; 
    } else if (currentTabId === 'liste') {
        componentProps = { 
            role: "user", 
            goToMapWithAlert,
            onEdit: handleEditAlert,
            onDataChange: forceRefreshNotifications // ← NOUVEAU
        } as ListeAlerteProps;
    } else {
        // Les autres composants reçoivent juste le rôle et la fonction de refresh
        componentProps = { 
            role: "user",
            onDataChange: forceRefreshNotifications // ← NOUVEAU
        };
    }
    
    return (
        <div className="min-h-screen bg-gray-200 flex flex-col pb-[4rem] md:pb-0 font-sans">
            <style>{style}</style>

            {/* TÊTE DE PAGE (Header) */}
            <header className="bg-gray-800 shadow-lg sticky top-0 z-30">
                <div className="max-w-7x2 mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
                    
                    {/* Logo et titre */}
                    <div className="flex items-center space-x-3">
                        <div className="relative">
                            <img 
                                src="/atsimoandrefana-logo.jpg" 
                                alt="Logo Atsimo-Andrefana" 
                                className="h-12 w-auto object-contain rounded-lg border-2 border-gray-300"
                            />
                            {/* BellRing comme badge */}
                            <div className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 flex items-center justify-center shadow-lg">
                                <BellRing className="w-3 h-3" />
                            </div>
                        </div>
                        <span className="text-xl font-bold text-white">Utilisateur ToliAlerte</span>
                    </div>

                    {/* Navigation DESKTOP avec badges */}
                    <nav className="hidden md:flex space-x-8 rounded-xl p-1 shadow-inner">
                        {tabsWithNotifications.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = currentTabId === tab.id;
                            const hasNotification = tab.notificationCount !== undefined && tab.notificationCount > 0;
                            
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabClick(tab.id)}
                                    className={`flex items-center px-4 py-2 rounded-lg font-semibold text-sm transition-colors duration-200 relative ${
                                        isActive
                                            ? "bg-indigo-600 text-white shadow-md transform scale-[1.02]"
                                            : "text-white hover:bg-indigo-200"
                                    }`}
                                >
                                    <Icon className="w-5 h-5 mr-2" />
                                    {tab.label}
                                    {hasNotification && (
                                        <NotificationBadge count={tab.notificationCount!} />
                                    )}
                                </button>
                            );
                        })}
                    </nav>

                    {/* 🔥 MODIFICATION: Ajout du profil utilisateur et boutons */}
                    <div className="flex items-center space-x-4">
                        {/* Affichage du profil utilisateur */}
                        {currentUser && (
                            <div className="hidden md:flex items-center space-x-3 px-4 py-2 rounded-lg">
                                <div className="flex items-center space-x-2">
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 border-2 border-indigo-200 overflow-hidden flex items-center justify-center">
                                        {currentUser.profile_photo_url ? (
                                            <img 
                                                src={currentUser.profile_photo_url} 
                                                alt="Photo de profil" 
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <User className="w-4 h-4 text-indigo-600" />
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-white">
                                            {currentUser.username}
                                        </span>
                                        <div className="flex items-center text-xs text-white">
                                            <Mail className="w-3 h-3 mr-1" />
                                            {currentUser.email}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={onLogout}
                            className="hidden md:flex items-center bg-red-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-600 transition duration-200 shadow-md text-sm"
                        >
                            <LogOut className="w-4 h-4 mr-2" /> Déconnexion
                        </button>
                        
                        {/* Bouton menu mobile avec badge */}
                        <button
                            className="md:hidden p-2 rounded-lg hover:bg-gray-700 transition duration-200 relative"
                            onClick={() => setMenuOpen((prev) => !prev)}
                            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
                        >
                            {menuOpen ? (
                                <X className="w-6 h-6 text-white transform rotate-0 transition-transform duration-300" />
                            ) : (
                                <Menu className="w-6 h-6 text-white transform rotate-0 transition-transform duration-300" />
                            )}
                            {/* Badge pour le menu mobile montrant le total des notifications */}
                            {(unreadAlertsCount > 0 || unreadAnnoncesCount > 0) && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold animate-pulse">
                                    {unreadAlertsCount + unreadAnnoncesCount > 99 ? '99+' : unreadAlertsCount + unreadAnnoncesCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {/* MENU MOBILE LATÉRAL avec badges */}
            {menuOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={() => setMenuOpen(false)}
                >
                    <div
                        className="mobile-menu-slide fixed right-0 top-0 w-3/4 max-w-xs h-full bg-white shadow-2xl p-6 flex flex-col space-y-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* En-tête du menu mobile avec le titre et un bouton X */}
                        <div className="flex justify-between items-center pb-4 border-b">
                            <span className="text-lg font-bold text-gray-800">Menu utilisateur</span>
                            <button
                                className="p-2 rounded-lg hover:bg-gray-100 transition"
                                onClick={() => setMenuOpen(false)}
                            >
                                <X className="w-6 h-6 text-gray-700" />
                            </button>
                        </div>
                        
                        {/* 🔥 MODIFICATION: Ajout du profil utilisateur dans le menu mobile */}
                        {currentUser && (
                            <div className="flex items-center space-x-3 pb-4 border-b">
                                <div className="w-12 h-12 rounded-full bg-indigo-100 border-2 border-indigo-200 overflow-hidden flex items-center justify-center">
                                    {currentUser.profile_photo_url ? (
                                        <img 
                                            src={currentUser.profile_photo_url} 
                                            alt="Photo de profil" 
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <User className="w-6 h-6 text-indigo-600" />
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-semibold text-gray-800">
                                        {currentUser.username}
                                    </span>
                                    <span className="text-sm text-gray-600 flex items-center">
                                        <Mail className="w-3 h-3 mr-1" />
                                        {currentUser.email}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2 flex-1">
                            {tabsWithNotifications.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = currentTabId === tab.id;
                                const hasNotification = tab.notificationCount !== undefined && tab.notificationCount > 0;
                                
                                return (
                                    <button
                                        key={tab.id}
                                        className={`flex items-center p-3 rounded-lg font-semibold transition-colors duration-200 w-full relative ${
                                            isActive
                                                ? "bg-indigo-100 text-indigo-700 border-l-4 border-indigo-600"
                                                : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                        onClick={() => handleTabClick(tab.id)}
                                    >
                                        <Icon className="w-5 h-5 mr-3" />
                                        {tab.label}
                                        {hasNotification && (
                                            <NotificationBadge count={tab.notificationCount!} />
                                        )}
                                        {isActive && (
                                            <span className="ml-auto text-indigo-600 text-sm">●</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        
                        <div className="pt-4 border-t">
                            <button 
                                onClick={onLogout} 
                                className="w-full flex items-center justify-center bg-red-100 text-red-700 py-3 rounded-lg font-semibold hover:bg-red-200 transition"
                            >
                                <LogOut className="w-5 h-5 mr-2" /> Se déconnecter
                            </button>
                        </div>

                        {/* Bouton Fermer en bas pour plus d'accessibilité */}
                        <div className="pt-2">
                            <button 
                                onClick={() => setMenuOpen(false)}
                                className="w-full flex items-center justify-center bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition duration-200"
                            >
                                <X className="w-5 h-5 mr-2" /> Fermer le menu
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* 🔥 AJOUT: Rendu Conditionnel du Formulaire de Modification (Modale) */}
            {alerteToEdit && (
                <div 
                    className="fixed inset-0 z-50 bg-black bg-opacity-70 flex justify-center items-center p-4 transition-opacity duration-300"
                    onClick={handleCloseEdit} 
                >
                    {/* Placeholder du Formulaire de Modification (où vous mettrez votre composant d'édition) */}
                    <div 
                        className="bg-white p-8 rounded-xl shadow-2xl max-w-lg w-full transform scale-100 transition-transform duration-300"
                        onClick={(e) => e.stopPropagation()} 
                    >
                        <div className="flex justify-between items-center mb-4 border-b pb-3">
                            <h2 className="text-2xl font-bold text-indigo-700">
                                Modifier Alerte #{alerteToEdit.id}
                            </h2>
                            <button onClick={handleCloseEdit} aria-label="Fermer la modification" className="text-gray-500 hover:text-red-500">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <p className="text-gray-600 italic">
                            **Formulaire Actif :** Modification de l'alerte de type **{alerteToEdit.type_alerte || 'N/A'}** ({alerteToEdit.id}).
                        </p>
                        
                        <div className="mt-6 flex justify-end">
                            <button 
                                onClick={handleCloseEdit} 
                                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition"
                            >
                                Annuler et Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CONTENU PRINCIPAL */}
            <main className={`flex-grow w-full max-w-7xl mx-auto ${currentTabId === 'carte' ? 'p-0' : 'p-4 md:p-8'}`}>
                {/* Passage des props spécifiques en fonction de l'onglet actif */}
                <CurrentComponent {...componentProps} /> 
            </main>

            {/* NAV BAR INFÉRIEURE (Mobile Only) avec badges */}
            <nav className="bottom-nav md:hidden">
                {tabsWithNotifications.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = currentTabId === tab.id;
                    const hasNotification = tab.notificationCount !== undefined && tab.notificationCount > 0;
                    
                    return (
                        <button
                            key={tab.id}
                            className={`nav-item ${isActive ? "text-indigo-600" : "text-gray-500 hover:text-indigo-600"}`}
                            onClick={() => handleTabClick(tab.id)}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="nav-label">{tab.label}</span>
                            {hasNotification && (
                                <NotificationBadge count={tab.notificationCount!} />
                            )}
                        </button>
                    );
                })}
                <button 
                    onClick={onLogout} 
                    className="nav-item text-red-500 hover:text-red-700"
                    title="Déconnexion"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="nav-label">Quitter</span>
                </button>
            </nav>
        </div>
    );
}