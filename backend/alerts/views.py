from django.shortcuts import render
from rest_framework import viewsets, permissions
from .models import Alerte
from .serializers import AlerteSerializer
from rest_framework.permissions import AllowAny  # Temporaire pour tester

class AlerteViewSet(viewsets.ModelViewSet):
    queryset = Alerte.objects.all()
    serializer_class = AlerteSerializer
    permission_classes = [AllowAny]  # Permet l'accès sans token
    
    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        serializer.save(utilisateur=user)
