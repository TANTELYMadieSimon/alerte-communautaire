from django.contrib.auth.models import AbstractUser
from django.db import models

class Utilisateur(AbstractUser):
    # Ici tu as dit que agent = admin, donc tu peux simplifier
    # Si tu veux garder citoyen vs admin
    ROLE_CHOICES = (
        ('citoyen', 'Citoyen'),
        ('admin', 'Admin'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='citoyen')

    def __str__(self):
        return f"{self.username} ({self.role})"
