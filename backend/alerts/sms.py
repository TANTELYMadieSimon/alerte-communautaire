from django.conf import settings
import logging
import time

logger = logging.getLogger(__name__)

def formater_numero_twilio(numero):
    """
    Convertit les numéros malgaches au format Twilio E.164
    """
    try:
        # Nettoyer le numéro
        numero_clean = ''.join(filter(str.isdigit, str(numero)))
        
        print(f"🔍 Numéro nettoyé: '{numero_clean}' (longueur: {len(numero_clean)})")
        
        # Format pour Madagascar
        if len(numero_clean) == 10 and numero_clean.startswith('0'):
            formaté = '+261' + numero_clean[1:]
            print(f"✅ Formaté (10 chiffres): {numero_clean} → {formaté}")
            return formaté
        elif len(numero_clean) == 9:
            formaté = '+261' + numero_clean
            print(f"✅ Formaté (9 chiffres): {numero_clean} → {formaté}")
            return formaté
        elif len(numero_clean) == 12 and numero_clean.startswith('261'):
            formaté = '+' + numero_clean
            print(f"✅ Formaté (12 chiffres): {numero_clean} → {formaté}")
            return formaté
        else:
            print(f"⚠️ Format non reconnu: {numero_clean}")
            return '+' + numero_clean if not numero_clean.startswith('+') else numero_clean
            
    except Exception as e:
        print(f"❌ Erreur formatage: {e}")
        return numero

def envoyer_sms(numero, message):
    """
    Fonction principale - VERSION CORRIGÉE
    """
    try:
        # Vérifier si Twilio est configuré
        if not hasattr(settings, 'TWILIO_ACCOUNT_SID') or not hasattr(settings, 'TWILIO_AUTH_TOKEN'):
            print("❌ Twilio non configuré - mode simulation")
            return envoyer_sms_simulation(numero, message)
        
        # Utiliser Twilio si configuré
        provider = getattr(settings, 'SMS_PROVIDER', 'simulation')
        print(f"🔧 Provider SMS: {provider}")
        
        if provider == 'twilio' and settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN:
            print("🚀 Tentative d'envoi via Twilio...")
            return envoyer_sms_twilio(numero, message)
        else:
            print("🔶 Mode simulation activé")
            return envoyer_sms_simulation(numero, message)
            
    except Exception as e:
        print(f"❌ Erreur générale SMS: {str(e)}")
        return envoyer_sms_simulation(numero, message)

def envoyer_sms_twilio(numero, message):
    """
    Version Twilio réelle
    """
    try:
        from twilio.rest import Client
        from twilio.base.exceptions import TwilioRestException
        
        # Formater le numéro
        numero_formate = formater_numero_twilio(numero)
        print(f"🔧 Envoi à: {numero_formate}")
        
        # Initialiser le client Twilio
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        
        # Envoyer le SMS
        message_twilio = client.messages.create(
            body=str(message),
            from_=settings.TWILIO_PHONE_NUMBER,
            to=numero_formate
        )
        
        print(f"✅ SMS Twilio ENVOYÉ avec succès!")
        print(f"📱 SID: {message_twilio.sid}")
        print(f"📞 À: {numero_formate}")
        print(f"📝 Statut: {message_twilio.status}")
        
        return True
        
    except TwilioRestException as e:
        print(f"❌ Erreur Twilio: {e.code} - {e.msg}")
        print("💡 Vérifiez:")
        print("   - Votre token Twilio")
        print("   - Votre balance Twilio")
        print("   - Les numéros vérifiés")
        print("   - La configuration du numéro Twilio")
        return False
        
    except Exception as e:
        print(f"❌ Erreur inattendue Twilio: {str(e)}")
        return False

def envoyer_sms_simulation(numero, message):
    """
    Mode simulation (fallback)
    """
    print("=" * 60)
    print("🔶 MODE SIMULATION - PAS D'ENVOI RÉEL")
    print("=" * 60)
    print(f"📞 DESTINATAIRE: {numero}")
    print(f"💬 MESSAGE: {message}")
    print("💡 POUR ACTIVER TWILIO:")
    print("   1. Vérifiez TWILIO_AUTH_TOKEN dans settings.py")
    print("   2. Ajoutez vos numéros dans Twilio Verified Caller IDs")
    print("   3. Vérifiez votre balance Twilio")
    print("=" * 60)
    return True