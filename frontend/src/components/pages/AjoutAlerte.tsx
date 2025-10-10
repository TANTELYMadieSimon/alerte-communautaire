"use client"

import type React from "react"
import { useState, useEffect } from "react"
import axios from "axios"
import "./AjoutAlerte.css"

export default function AjoutAlerte() {
  const [selectedType, setSelectedType] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [photo, setPhoto] = useState<File | null>(null)
  const [adresse, setAdresse] = useState("Non précisé")  // pour stocker la géoloc

  const alertTypes = [
  { value: "inondation", label: "Inondation" },
  { value: "incendie", label: "Incendie" },
  { value: "vol", label: "Vol" },
  { value: "autre", label: "Autre" },
  ]

 useEffect(() => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords

        try {
          const res = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          )

          // Exemple : "Bandobiby, Toliara, Madagascar"
          const locationName = res.data.display_name || `Lat: ${latitude}, Lng: ${longitude}`
          setAdresse(locationName)
        } catch (err) {
          console.error("Erreur reverse geocoding :", err)
          setAdresse(`Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}`)
        }
      },
      (error) => {
        console.error("Erreur géolocalisation :", error)
      }
    )
  }
}, [])


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedType || !description) {
      alert("Veuillez remplir tous les champs obligatoires")
      return
    }

    try {
      await axios.post("http://127.0.0.1:8000/api/alertes/", {
        // NE PAS envoyer 'titre'
        description: description,
        type_alerte: selectedType,
        adresse: adresse
        // NE PAS envoyer 'utilisateur' - le backend le gère
      })
      alert("Alerte ajoutée avec succès !")
      setSelectedType("")
      setDescription("")
      setAdresse("")
    } catch (error: any) {
      console.error("Erreur API :", error.response?.data || error.message)
      alert("Erreur lors de l'ajout de l'alerte")
    }
  }
  const handleCancel = () => {
    setSelectedType("")
    setDescription("")
    setDate(new Date().toISOString().split("T")[0])
    setPhoto(null)
  }
  return (
    <div className="ajout-alerte-container">
      <div className="tab-header">
        <span className="tab-inactive">Historique</span>
        <span className="tab-active">Annonce</span>
      </div>

      <div className="add-alert-header">
        <div className="megaphone-icon">📢</div>
        <h2>Ajouter une alerte</h2>
      </div>

      <form onSubmit={handleSubmit} className="alert-form">
        <div className="form-group">
          <label>Type :</label>
          <div className="type-selector">
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} required>
              <option value="">Choisir une type</option>
              {alertTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Description :</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Décrivez l'alerte..."
            required
          />
        </div>

        <div className="form-group">
          <label>Date :</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Adresse :</label>
          <input type="text" value={adresse} readOnly />
        </div>


        <div className="form-group">
          <label>Photo :</label>
          <div className="photo-upload">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhoto(e.target.files?.[0] || null)}
              id="photo-input"
            />
            <label htmlFor="photo-input" className="photo-label">
              📷 Choisir
            </label>
            {photo && <span className="photo-name">{photo.name}</span>}
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={handleCancel} className="cancel-btn">
            Annuler
          </button>
          <button type="submit" className="submit-btn">
            Envoyer
          </button>
        </div>
      </form>
    </div>
  )
}
