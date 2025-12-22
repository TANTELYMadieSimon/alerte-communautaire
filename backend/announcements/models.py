from django.db import models

class Annonce(models.Model):
    titre = models.CharField(max_length=200)
    message = models.TextField()
    date_publication = models.DateTimeField(auto_now_add=True)
    photo = models.ImageField(upload_to='annonces_photos/', blank=True, null=True)  # AJOUTÉ

    def __str__(self):
        return self.titre