# users/views.py
from django.contrib.auth import login, logout
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Utilisateur
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .serializers import (
    UtilisateurSerializer,
    AdminCreateSerializer,
    LoginSerializer,
    UserCreateSerializer,
    UserLoginSerializer
)

# Vues publiques (gardez @permission_classes([permissions.AllowAny]))
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def admin_login(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        if user.role != 'admin':
            return Response({'success': False, 'message': 'Accès admin seulement'}, status=403)
        
        # JWT au lieu de login(request, user)
        refresh = RefreshToken.for_user(user)
        user.last_login = timezone.now()
        user.save()
        
        return Response({
            'success': True,
            'message': f'Bienvenue {user.username} !',
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            },
            'admin': {
                **UtilisateurSerializer(user).data,
                'profile_photo_url': request.build_absolute_uri(user.profile_photo.url) if user.profile_photo else None
            }
        })
    return Response({
        'success': False,
        'message': 'Identifiants incorrects ou accès non autorisé'
    }, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def user_login(request):
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        
        # SUPPRIMER cette vérification qui cause l'erreur 403
        # if user.role != 'user':
        #     return Response({'success': False, 'message': 'Accès utilisateur seulement'}, status=403)
        
        refresh = RefreshToken.for_user(user)
        user.last_login = timezone.now()
        user.save()

        profile_photo_url = None
        if user.profile_photo:
            profile_photo_url = request.build_absolute_uri(user.profile_photo.url)
        
        return Response({
            'success': True,
            'message': f'Bienvenue {user.username} !',
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            },
            'user': {
                **UtilisateurSerializer(user).data,
                'profile_photo_url': profile_photo_url
            }
        })
    
    return Response({
        'success': False,
        'message': 'Identifiants incorrects'
    }, status=status.HTTP_401_UNAUTHORIZED)
# ==================== VUES PROTÉGÉES (CSRF NORMAL) ====================

@api_view(['POST'])
def admin_logout(request):
    logout(request)
    return Response({'success': True, 'message': 'Déconnexion réussie'})


@api_view(['GET'])
def admin_list(request):
    if not request.user.is_superuser:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    admins = Utilisateur.objects.filter(role='admin', is_active=True)
    return Response(UtilisateurSerializer(admins, many=True).data)


@api_view(['DELETE'])
def admin_delete(request, admin_id):
    if not request.user.is_superuser:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    try:
        admin = Utilisateur.objects.get(id=admin_id, role='admin')
        if admin == request.user:
            return Response({'error': 'Vous ne pouvez pas supprimer votre propre compte'}, status=400)
        admin.delete()
        return Response({'success': True, 'message': 'Administrateur supprimé'})
    except Utilisateur.DoesNotExist:
        return Response({'error': 'Administrateur non trouvé'}, status=404)


@api_view(['GET'])
def admin_profile(request):
    if request.user.is_authenticated and request.user.role == 'admin':
        return Response(UtilisateurSerializer(request.user).data)
    return Response({'error': 'Non authentifié ou non autorisé'}, status=401)


@api_view(['PUT'])
def admin_update_profile(request):
    if not (request.user.is_authenticated and request.user.role == 'admin'):
        return Response({'error': 'Non authentifié ou non autorisé'}, status=401)
    serializer = UtilisateurSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({'success': True, 'message': 'Profil mis à jour', 'admin': serializer.data})
    return Response({'success': False, 'errors': serializer.errors}, status=400)


@api_view(['GET'])
def user_profile(request):
    if request.user.is_authenticated:
        return Response(UtilisateurSerializer(request.user).data)
    return Response({'error': 'Non authentifié'}, status=401)


@api_view(['PUT'])
def user_update_profile(request):
    if not request.user.is_authenticated:
        return Response({'error': 'Non authentifié'}, status=401)
    serializer = UtilisateurSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({'success': True, 'message': 'Profil mis à jour', 'user': serializer.data})
    return Response({'success': False, 'errors': serializer.errors}, status=400)


@api_view(['GET'])
def user_list(request):
    if not (request.user.is_authenticated and request.user.role == 'admin'):
        return Response({'error': 'Permission denied'}, status=403)
    users = Utilisateur.objects.filter(role='user', is_active=True)
    return Response(UtilisateurSerializer(users, many=True).data)


# ==================== CRÉATION D'UN ADMINISTRATEUR (premier admin ou par un superadmin) ====================
@api_view(['POST'])
@permission_classes([permissions.AllowAny])   # ← AllowAny = tout le monde peut créer le 1er admin
def admin_create(request):
    serializer = AdminCreateSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        
        # Le premier admin créé devient automatiquement superadmin
        if not Utilisateur.objects.filter(is_superuser=True).exists():
            user.is_superuser = True
            user.is_staff = True
        
        # Les suivants auront juste role='admin' + is_staff (mais pas superuser)
        else:
            user.is_staff = True   # Pour accéder à l'admin Django si besoin
            # user.is_superuser reste False → c’est un admin "normal"
        
        user.save()

        return Response({
            'success': True,
            'message': 'Administrateur créé avec succès',
            'admin': {
                **UtilisateurSerializer(user).data,
                'profile_photo_url': request.build_absolute_uri(user.profile_photo.url) if user.profile_photo else None
            }
        }, status=status.HTTP_201_CREATED)

    return Response({
        'success': False,
        'message': 'Données invalides',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)
# ==================== CRÉATION D'UN UTILISATEUR NORMAL (inscription publique) ====================
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def user_create(request):
    serializer = UserCreateSerializer(data=request.data, context={'request': request})
    
    if serializer.is_valid():
        user = serializer.save()
        
        profile_photo_url = None
        if user.profile_photo:
            profile_photo_url = request.build_absolute_uri(user.profile_photo.url)

        return Response({
            'success': True,
            'message': 'Compte créé avec succès !',
            'user': {
                **UtilisateurSerializer(user).data,
                'profile_photo_url': profile_photo_url
            }
        }, status=201)

    return Response({
        'success': False,
        'message': 'Données invalides',
        'errors': serializer.errors
    }, status=400)