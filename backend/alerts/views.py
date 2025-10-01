from django.shortcuts import render
from rest_framework import viewsets, permissions
from .models import Alerte
from .serializers import AlerteSerializer

class AlerteViewSet(viewsets.ModelViewSet):
    queryset = Alerte.objects.all().order_by('-date_creation')
    serializer_class = AlerteSerializer
    permission_classes = [permissions.AllowAny]  # à sécuriser plus tard

