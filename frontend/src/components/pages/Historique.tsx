import React, { useEffect, useState } from "react"
import { BarChart, ListOrdered } from "lucide-react"

// ✅ Interfaces (inchangées)
interface ChartItem {
  name: string
  value: number
  color: string
}

interface AlerteItem {
  id: number
  type_alerte: string
  statut: string
  titre: string
  localisation: string
  date_creation: string
}

// Fonction utilitaire pour obtenir le nom du mois à partir de "YYYY-MM"
const getMonthLabel = (month: string): string => {
  try {
    const [year, monthNum] = month.split('-').map(Number);
    const date = new Date(year, monthNum - 1, 1);
    return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' });
  } catch {
    return month;
  }
};

// ✅ NOUVELLE FONCTION : Générer les 12 derniers mois dynamiquement
const generateLast12Months = (): string[] => {
  const months: string[] = [];
  const currentDate = new Date();
  
  for (let i = 0; i < 12; i++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    months.push(`${year}-${month}`);
  }
  
  return months.reverse(); // Pour avoir du plus ancien au plus récent
};

// ✅ NOUVELLE FONCTION : Obtenir le mois actuel au format YYYY-MM
const getCurrentMonth = (): string => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

export default function Historique() {
  const [chartData, setChartData] = useState<ChartItem[]>([])
  const [maxChartValue, setMaxChartValue] = useState<number>(0)
  // ✅ Mois par défaut : mois actuel
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonth())
  const [alertes, setAlertes] = useState<AlerteItem[]>([])
  // ✅ Stocker les mois disponibles
  const [availableMonths, setAvailableMonths] = useState<string[]>([])

  // ✅ Couleurs par type d'alerte (inchangées)
  const alertColors: Record<string, string> = {
    incendie: "bg-red-500",
    inondation: "bg-cyan-500",
    vol: "bg-yellow-500",
    autre: "bg-gray-500",
  }

  // 🛑 CHARGEMENT DES ALERTES
  useEffect(() => {
    fetch("http://localhost:8000/api/alertes/")
      .then((res) => res.json())
      .then((data) => {
        setAlertes(data);
        
        // ✅ Générer les 12 derniers mois après avoir chargé les alertes
        const last12Months = generateLast12Months();
        setAvailableMonths(last12Months);
        
        // ✅ S'assurer que le mois sélectionné existe dans la liste
        if (!last12Months.includes(selectedMonth)) {
          setSelectedMonth(last12Months[last12Months.length - 1]); // Dernier mois (le plus récent)
        }
      })
      .catch((err) => console.error("Erreur chargement alertes:", err))
  }, [])

  // ✅ CALCUL DES STATISTIQUES (pour le graphique)
  useEffect(() => {
    // 1. Filtrer les alertes par le mois sélectionné (YYYY-MM)
    const alertesDuMois = alertes.filter(
      (alerte) => alerte.date_creation.startsWith(selectedMonth)
    );

    // 2. Compter le nombre de chaque type d'alerte
    const counts = alertesDuMois.reduce((acc, alerte) => {
      const type = alerte.type_alerte ? alerte.type_alerte.toLowerCase() : 'autre';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 3. Formater les données pour le graphique
    let formatted: ChartItem[] = Object.keys(counts).map((type) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: counts[type],
      color: alertColors[type] || "bg-gray-400",
    }));

    // 4. Trier par valeur (le plus grand en premier)
    formatted.sort((a, b) => b.value - a.value);

    // 5. Calculer la valeur max ajustée pour l'axe Y
    const maxVal = Math.max(...formatted.map((d) => d.value), 0);
    const adjustedMax = Math.max(5, Math.ceil(maxVal / 5) * 5);

    setChartData(formatted)
    setMaxChartValue(adjustedMax)

  }, [alertes, selectedMonth])

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8 flex items-center">
        <ListOrdered className="w-8 h-8 mr-3 text-indigo-600" /> Tableau de Bord Communautaire
      </h1>
      <div className="bg-white p-6 rounded-xl shadow-xl">
        <HistoriqueContent
          chartData={chartData}
          maxChartValue={maxChartValue}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          alertes={alertes}
          availableMonths={availableMonths} // ✅ Passer les mois disponibles
        />
      </div>
    </div>
  )
}

interface HistoriqueContentProps {
  chartData: ChartItem[]
  maxChartValue: number
  selectedMonth: string
  onMonthChange: (month: string) => void
  alertes: AlerteItem[]
  availableMonths: string[] // ✅ Nouvelle prop
}

const HistoriqueContent: React.FC<HistoriqueContentProps> = ({
  chartData,
  maxChartValue,
  selectedMonth,
  onMonthChange,
  alertes,
  availableMonths,
}) => {
    // 1. Définir les niveaux de l'axe Y pour la grille (5 paliers)
    const yAxisValues = [
        maxChartValue, 
        Math.round(maxChartValue * 0.75), 
        Math.round(maxChartValue * 0.5), 
        Math.round(maxChartValue * 0.25), 
        0
    ].filter((value, index, self) => self.indexOf(value) === index).slice(0, 5);
    
    // 2. Filtrer la liste des alertes par le mois sélectionné (filtre côté client)
    const filteredAlertes = alertes.filter(
      (alerte) => alerte.date_creation.startsWith(selectedMonth)
    );

    return (
        <>
            <div className="flex flex-wrap gap-4 justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                    <BarChart className="w-6 h-6 mr-2 text-indigo-600"/>
                    Statistiques des Alertes — {getMonthLabel(selectedMonth)}
                </h2>

                <div className="flex items-center gap-2">
                    <label htmlFor="mois" className="text-sm font-medium text-gray-700">
                        Mois :
                    </label>
                    <select
                        id="mois"
                        value={selectedMonth}
                        onChange={(e) => onMonthChange(e.target.value)}
                        className="border rounded-lg px-3 py-1 text-sm text-gray-700 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        {/* ✅ OPTIONS DYNAMIQUES : Générées automatiquement */}
                        {availableMonths.map(month => (
                          <option key={month} value={month}>
                            {getMonthLabel(month)}
                          </option>
                        ))}
                    </select>
                </div>
            </div>

            {chartData.length > 0 ? (
                // Conteneur du graphique
                <div className="h-72 relative flex p-2 border rounded-xl bg-white shadow-lg mb-8">
                    
                    {/* Axe Y et Lignes de grille */}
                    <div className="flex flex-col justify-between items-end pr-3 text-xs text-gray-500 h-full w-10">
                        {yAxisValues.map((val, index) => (
                            <span key={index} className="relative -top-2">
                                {val}
                                {/* Ligne de grille */}
                                {val !== 0 && (
                                    <div 
                                        className="absolute right-0 w-[calc(100vw-120px)] max-w-[500px] border-t border-gray-200"
                                        style={{ 
                                            bottom: `calc(${(val / maxChartValue) * 100}% - 1px)`
                                        }}
                                    ></div>
                                )}
                            </span>
                        ))}
                    </div>

                    {/* Conteneur des Barres */}
                    <div className="flex flex-1 justify-around items-end h-full pt-1 pb-1 text-center border-l border-gray-300">
                        {chartData.map((item, index) => (
                            <div
                                key={index}
                                className="flex flex-col items-center justify-end h-full w-1/4 max-w-[100px] px-2 relative group"
                            >
                                {/* Étiquette de valeur (Tooltip) */}
                                <span className="absolute bottom-full mb-1 px-2 py-1 bg-gray-800 text-white text-xs font-bold rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                                    {item.value}
                                </span>
                                {/* Barre d'Histogramme */}
                                <div
                                    className={`w-full rounded-t-md transition-all duration-500 ease-out z-10 hover:opacity-80 ${item.color}`}
                                    style={{
                                        height: `${(item.value / (maxChartValue > 0 ? maxChartValue : 1)) * 100}%`,
                                        minHeight: item.value > 0 ? "5px" : "0",
                                    }}
                                ></div>
                                {/* Étiquette de Catégorie (Axe X) */}
                                <span className="mt-2 text-xs font-semibold text-gray-700 w-full truncate pt-1">
                                    {item.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <p className="text-gray-500 text-sm p-4 bg-gray-100 rounded-lg">
                    Aucune donnée d'alerte trouvée pour {getMonthLabel(selectedMonth)}.
                </p>
            )}
        </>
    );
};