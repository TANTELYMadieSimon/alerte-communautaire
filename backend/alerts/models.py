from django.db import models
from users.models import Utilisateur

class Alerte(models.Model):
    TYPE_ALERTES = (
        ('incendie', 'Incendie'),
        ('inondation', 'Inondation'),
        ('vol', 'Vol'),
        ('autre', 'Autre'),
    )
    
    description = models.TextField()
    type_alerte = models.CharField(max_length=20, choices=TYPE_ALERTES)
    date_creation = models.DateTimeField(auto_now_add=True)
    utilisateur = models.ForeignKey(Utilisateur, null=True, blank=True, on_delete=models.CASCADE)
    adresse = models.CharField(max_length=300, blank=True, null=True)
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.type_alerte} - {self.description[:50]}"  # Correction ici