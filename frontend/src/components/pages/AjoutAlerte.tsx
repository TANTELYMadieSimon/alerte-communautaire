"use client"

import type React from "react"

import { useState } from "react"
import "./AjoutAlerte.css"

export default function AjoutAlerte() {
  const [selectedType, setSelectedType] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [photo, setPhoto] = useState<File | null>(null)

  const alertTypes = [
    { value: "inondation", label: "Inondation" },
    { value: "incendie", label: "Incendie" },
    { value: "electricite", label: "Électricité" },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedType || !description) {
      alert("Veuillez remplir tous les champs obligatoires")
      return
    }

    // Simulate alert submission
    alert("Alerte ajoutée avec succès!")

    // Reset form
    setSelectedType("")
    setDescription("")
    setDate(new Date().toISOString().split("T")[0])
    setPhoto(null)
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
