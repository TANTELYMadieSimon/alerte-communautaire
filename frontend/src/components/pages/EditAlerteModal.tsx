import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import type { Alerte } from "./ListeAlerte";
import { ALERTES_API_URL } from "../../lib/api";
interface EditAlerteModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerte: Alerte;
  onSave: (updated: Alerte) => void;
}

const EditAlerteModal: React.FC<EditAlerteModalProps> = ({ isOpen, onClose, alerte, onSave }) => {
  const [formData, setFormData] = useState<Alerte>(alerte);
  const [newImage, setNewImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(alerte.photo || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  useEffect(() => {
    setFormData(alerte);
    setImagePreview(alerte.photo || null);
    setNewImage(null);
  }, [alerte]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("type_alerte", formData.type_alerte || "");
      formDataToSend.append("description", formData.description || "");
      // On n'envoie PAS l'adresse → elle reste inchangée
      if (newImage) formDataToSend.append("photo", newImage);

      const res = await fetch(`${ALERTES_API_URL}${formData.id}/`, {
        method: "PUT",
        body: formDataToSend,
      });

      if (!res.ok) throw new Error("Erreur serveur");
      const updated = await res.json();
      onSave(updated);
      onClose();
    } catch (err) {
      alert("Erreur lors de la sauvegarde !");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2">
      {/* Overlay avec opacité moderne */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />
      
      {/* Contenu du modal - Compact sans scroll */}
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête avec dégradé moderne */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 md:p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base md:text-lg font-bold text-white text-center flex-1">
              Modifier l'alerte 
            </h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/20 rounded-lg"
            >
              <X className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>

        {/* Contenu du formulaire - Espacement réduit sur mobile */}
        <div className="p-3 md:p-4 space-y-2 md:space-y-3">
          {/* PHOTO MODIFIABLE - Réduite sur mobile */}
          <div>
            <label className="block text-xs md:text-sm font-semibold text-slate-700 mb-1 md:mb-2">Photo de l'alerte</label>
            <div className="flex flex-col items-center">
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-16 h-16 md:w-28 md:h-28 object-cover rounded-lg shadow-sm mb-2 md:mb-3 border border-slate-200" 
                />
              ) : (
                <div className="w-16 h-16 md:w-28 md:h-28 bg-slate-100 border border-dashed border-slate-300 rounded-lg flex items-center justify-center mb-2 md:mb-3">
                  <p className="text-slate-500 text-xs text-center px-1">Aucune image</p>
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-2 py-1.5 md:px-3 md:py-2 bg-slate-100 text-slate-700 rounded text-xs md:text-sm font-medium hover:bg-slate-200 transition-colors border border-slate-300"
              >
                📷 Changer l'image
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </div>
          </div>

          {/* TYPE D'ALERTE */}
          <div>
            <label className="block text-xs md:text-sm font-semibold text-slate-700 mb-1 md:mb-2">Type d'alerte</label>
            <select
                value={formData.type_alerte || ""}
                onChange={(e) => setFormData({ ...formData, type_alerte: e.target.value })}
                className="w-full px-2 py-1.5 md:px-3 md:py-2 border border-slate-300 rounded text-xs md:text-sm focus:border-blue-500 focus:ring-1 md:focus:ring-2 focus:ring-blue-200 transition-all bg-white"
            >
                <option value="">Choisir un type</option>
                <option value="incendie">🔥 Incendie</option>
                <option value="inondation">🌊 Inondation</option>
                <option value="vol">🚨 Vol</option>
                <option value="autre">📌 Autre</option>
            </select>
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-xs md:text-sm font-semibold text-slate-700 mb-1 md:mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              rows={2}
              className="w-full px-2 py-1.5 md:px-3 md:py-2 border border-slate-300 rounded text-xs md:text-sm resize-none focus:border-blue-500 focus:ring-1 md:focus:ring-2 focus:ring-blue-200 transition-all"
              placeholder="Décrivez la situation..."
            />
          </div>

          {/* ADRESSE NON MODIFIABLE */}
          <div>
            <label className="block text-xs md:text-sm font-semibold text-slate-700 mb-1 md:mb-2">
              📍 Adresse (non modifiable)
            </label>
            <div className="w-full px-2 py-1.5 md:px-3 md:py-2 bg-slate-50 border border-slate-300 rounded text-xs md:text-sm text-slate-800">
              {formData.adresse || "Aucune adresse définie"}
            </div>
          </div>
        </div>

        {/* Boutons avec style moderne - Compact sur mobile */}
        <div className="flex gap-2 md:gap-3 p-3 md:p-4 bg-slate-50 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-3 py-2 md:px-4 md:py-2.5 text-white bg-red-700 border border-red-300 rounded text-xs md:text-sm font-semibold hover:bg-slate-100 transition-colors shadow-sm"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-3 py-2 md:px-4 md:py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded text-xs md:text-sm font-semibold hover:from-blue-600 hover:to-purple-700 transition-all shadow-sm md:shadow-md hover:shadow-lg"
          >
           Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditAlerteModal;