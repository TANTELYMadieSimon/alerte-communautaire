from django.db import models
from users.models import Utilisateur  # Relier au modèle utilisateur

class Alerte(models.Model):
    TYPE_ALERTES = (
        ('incendie', 'Incendie'),
        ('inondation', 'Inondation'),
        ('vol', 'Vol'),
        ('autre', 'Autre'),
    )
    titre = models.CharField(max_length=200)
    description = models.TextField()
    type_alerte = models.CharField(max_length=20, choices=TYPE_ALERTES)
    date_creation = models.DateTimeField(auto_now_add=True)
    statut = models.CharField(max_length=20, default='nouvelle')
    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE, related_name='alertes')
    adresse = models.CharField(max_length=300, blank=True, null=True)

    def __str__(self):
        return f"{self.titre} ({self.statut})"
