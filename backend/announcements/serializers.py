from rest_framework import serializers
from .models import Annonce


class AnnonceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Annonce
        fields = ['id', 'titre', 'message', 'date_publication']
        read_only_fields = ['id', 'date_publication']
    
    def create(self, validated_data):
        return Annonce.objects.create(**validated_data)
