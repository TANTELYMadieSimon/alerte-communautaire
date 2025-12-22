from django.urls import path
from . import views

urlpatterns = [
    # ==================== ROUTES ADMIN ====================
    path('api/admins/login/', views.admin_login, name='admin-login'),
    path('api/admins/create/', views.admin_create, name='admin-create'),
    path('api/admins/logout/', views.admin_logout, name='admin-logout'),
    path('api/admins/profile/', views.admin_profile, name='admin-profile'),
    path('api/admins/update-profile/', views.admin_update_profile, name='admin-update-profile'),
    path('api/admins/list/', views.admin_list, name='admin-list'),
    path('api/admins/delete/<int:admin_id>/', views.admin_delete, name='admin-delete'),
    
    # ==================== ROUTES UTILISATEUR ====================
    path('api/users/login/', views.user_login, name='user-login'),
    path('api/users/create/', views.user_create, name='user-create'),
    path('api/users/logout/', views.admin_logout, name='user-logout'),  # Même fonction
    path('api/users/profile/', views.user_profile, name='user-profile'),
    path('api/users/update-profile/', views.user_update_profile, name='user-update-profile'),
    path('api/users/list/', views.user_list, name='user-list'),
]