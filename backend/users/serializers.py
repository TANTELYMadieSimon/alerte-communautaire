from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import Utilisateur

class UtilisateurSerializer(serializers.ModelSerializer):
    class Meta:
        model = Utilisateur
        fields = ('id', 'username', 'email', 'phone', 'profile_photo', 
                 'role', 'created_at', 'last_login', 'receive_sms_alerts', 'sms_phone')
        read_only_fields = ('id', 'created_at', 'last_login')

class AdminCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = Utilisateur
        fields = ('username', 'email', 'phone', 'profile_photo', 'password', 'password_confirm', 'sms_phone')

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Les mots de passe ne correspondent pas."})
        
        if Utilisateur.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({"email": "Un utilisateur avec cet email existe déjà."})
        
        if Utilisateur.objects.filter(username=attrs['username']).exists():
            raise serializers.ValidationError({"username": "Ce nom d'utilisateur est déjà pris."})
            
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        
        admin = Utilisateur.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            phone=validated_data.get('phone', ''),
            password=validated_data['password'],
            profile_photo=validated_data.get('profile_photo'),
            role='admin',
            sms_phone=validated_data.get('sms_phone', ''),
            receive_sms_alerts=bool(validated_data.get('sms_phone'))
        )
        return admin

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        if username and password:
            user = authenticate(username=username, password=password)
            
            if not user:
                try:
                    user_obj = Utilisateur.objects.get(email=username)
                    user = authenticate(username=user_obj.username, password=password)
                except Utilisateur.DoesNotExist:
                    pass

            if not user:
                raise serializers.ValidationError('Identifiants incorrects.')
            
            if not user.is_active:
                raise serializers.ValidationError('Ce compte est désactivé.')
                
            if user.role != 'admin':
                raise serializers.ValidationError('Accès réservé aux administrateurs.')

            attrs['user'] = user
        else:
            raise serializers.ValidationError('Must include "username" and "password".')

        return attrs

class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    password_confirm = serializers.CharField(write_only=True)
    profile_photo = serializers.ImageField(required=False, allow_null=True, allow_empty_file=True)

    class Meta:
        model = Utilisateur
        fields = ('username', 'email', 'phone', 'profile_photo', 'password', 'password_confirm')
        extra_kwargs = {
            'phone': {'required': False, 'allow_blank': True},
            'email': {'required': True},
        }

    def validate(self, attrs):
        # Validation de la correspondance des mots de passe
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Les mots de passe ne correspondent pas."})

        # Validation de l'unicité de l'email
        if Utilisateur.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({"email": "Cet email est déjà utilisé."})

        # Validation de l'unicité du username
        if Utilisateur.objects.filter(username=attrs['username']).exists():
            raise serializers.ValidationError({"username": "Ce nom d'utilisateur existe déjà."})

        # Normalisation du numéro de téléphone
        phone = attrs.get('phone', '')
        if phone:
            # Nettoyage du numéro
            phone = phone.replace(' ', '').replace('-', '')
            if phone.startswith('0'):
                phone = '+261' + phone[1:]
            elif not phone.startswith('+'):
                phone = '+261' + phone
            
            # Validation du format
            if not phone.startswith('+261') or len(phone) != 13:
                raise serializers.ValidationError({"phone": "Le numéro de téléphone doit être au format malgache (+261 XX XX XXX XX)"})
            
            attrs['phone'] = phone
        else:
            attrs['phone'] = ''

        return attrs

    def create(self, validated_data):
        # Extraction du mot de passe et confirmation
        password = validated_data.pop('password')
        validated_data.pop('password_confirm')
        
        # Création de l'utilisateur
        user = Utilisateur(**validated_data)
        user.set_password(password)
        user.role = 'user'
        user.is_active = True
        user.save()
        
        return user
class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        if username and password:
            user = authenticate(username=username, password=password)
            
            if not user:
                try:
                    user_obj = Utilisateur.objects.get(email=username)
                    user = authenticate(username=user_obj.username, password=password)
                except Utilisateur.DoesNotExist:
                    pass

            if not user:
                raise serializers.ValidationError('Identifiants incorrects.')
            
            if not user.is_active:
                raise serializers.ValidationError('Ce compte est désactivé.')

            attrs['user'] = user
        else:
            raise serializers.ValidationError('Must include "username" and "password".')

        return attrs