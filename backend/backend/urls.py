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
"""
URL configuration for backend project.
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from rest_framework import routers
from alerts.views import AlerteViewSet
from announcements.views import AnnonceViewSet
from django.conf import settings
from django.conf.urls.static import static
from alerts.views import historique_alertes_par_mois
from users import views as users_views

# Configuration du router
router = routers.DefaultRouter()
router.register(r'alertes', AlerteViewSet, basename='alerte')
router.register(r'annonces', AnnonceViewSet, basename='annonce')

# Vue pour la page d'accueil
def home(request):
    return JsonResponse({
        'message': 'Bienvenue sur l\'API Alerte Communautaire',
        'endpoints': {
            'alertes': '/api/alertes/',
            'annonces': '/api/annonces/',
            'admin': '/admin/',
            'users': '/api/users/',
            'admins': '/api/admins/',
        }
    })

urlpatterns = [
    path('admin/', admin.site.urls),  
    path('api/', include(router.urls)),  
    
    path('api/', include('users.urls')),  
    #  AJOUTEZ CES URLs DIRECTEMENT
    # URLs Admin
    path('api/admins/login/', users_views.admin_login, name='admin-login'),
    path('api/admins/create/', users_views.admin_create, name='admin-create'),
    path('api/admins/logout/', users_views.admin_logout, name='admin-logout'),
    path('api/admins/profile/', users_views.admin_profile, name='admin-profile'),
    path('api/admins/update-profile/', users_views.admin_update_profile, name='admin-update-profile'),
    path('api/admins/list/', users_views.admin_list, name='admin-list'),
    path('api/admins/delete/<int:admin_id>/', users_views.admin_delete, name='admin-delete'),
    
    # URLs User
    path('api/users/login/', users_views.user_login, name='user-login'),
    path('api/users/create/', users_views.user_create, name='user-create'),
    path('api/users/profile/', users_views.user_profile, name='user-profile'),
    path('api/users/update-profile/', users_views.user_update_profile, name='user-update-profile'),
    path('api/users/list/', users_views.user_list, name='user-list'),
    
    path('', home),  # Page d'accueil
    path('historique_par_mois/', historique_alertes_par_mois, name='historique_par_mois'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)