from rest_framework import serializers
from .models import Alerte

class AlerteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alerte
        fields = '__all__'
        read_only_fields = ('id','date_creation','statut')
