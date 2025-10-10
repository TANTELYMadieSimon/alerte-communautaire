"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from rest_framework import routers
from alerts.views import AlerteViewSet

# Configuration du router
router = routers.DefaultRouter()
router.register(r'alertes', AlerteViewSet, basename='alerte')

# Vue pour la page d'accueil
def home(request):
    return JsonResponse({
        'message': 'Bienvenue sur l\'API Alerte Communautaire',
        'endpoints': {
            'alertes': '/api/alertes/',
            'admin': '/admin/',
        }
    })

urlpatterns = [
    path('admin/', admin.site.urls),  # Correction : ajout de admin.site.urls
    path('api/', include(router.urls)),  # Correction : utilisation du router
    path('', home),  # Page d'accueil
]