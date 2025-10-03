from rest_framework import serializers
from .models import Alerte
from users.models import Utilisateur


class AlerteSerializer(serializers.ModelSerializer):
    utilisateur_nom = serializers.CharField(source='utilisateur.username', read_only=True)
    
    class Meta:
        model = Alerte
        fields = [
            'id',
            'description',
            'type_alerte',
            'date_creation',
            'utilisateur',
            'adresse'
        ]
        read_only_fields = ['id', 'date_creation']
    
    def create(self, validated_data):
        return Alerte.objects.create(**validated_data)
