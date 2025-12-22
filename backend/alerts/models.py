from django.db import models
from users.models import Utilisateur

class Alerte(models.Model):
    TYPE_ALERTES = (
        ('incendie', 'Incendie'),
        ('inondation', 'Inondation'),
        ('vol', 'Vol'),
        ('autre', 'Autre'),
    )
    
    STATUT_ALERTE = (
        ('en_cours', 'En cours'),
        ('termine', 'Terminé'),
    )
    
    description = models.TextField()
    type_alerte = models.CharField(max_length=20, choices=TYPE_ALERTES)
    date_creation = models.DateTimeField(auto_now_add=True)
    utilisateur = models.ForeignKey(Utilisateur, null=True, blank=True, on_delete=models.CASCADE)
    adresse = models.CharField(max_length=300, blank=True, null=True)
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)
    photo = models.ImageField(upload_to='alertes_photos/', blank=True, null=True)
    statut = models.CharField(max_length=20, choices=STATUT_ALERTE, default='en_cours')  
    
    def __str__(self):
        return f"{self.type_alerte} - {self.description[:50]}"
    
    def get_type_alerte_display(self):
        """
        Retourne le libellé formaté du type d'alerte
        """
        types_display = {
            'incendie': 'Incendie',
            'inondation': 'Inondation',
            'vol': 'Vol',
            'autre': 'Autre Incident',
        }
        return types_display.get(self.type_alerte, self.type_alerte.title())
    
    @property
    def utilisateur_nom(self):
        """Retourne le nom de l'utilisateur ou 'Anonyme'"""
        return self.utilisateur.username if self.utilisateur else "Anonyme"