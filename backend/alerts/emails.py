from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from users.models import Utilisateur
import os
import logging
from .sms import envoyer_sms  # ✅ Import du service SMS

logger = logging.getLogger(__name__)

def envoyer_notification_alerte_aux_admins(alerte):
    """
    Envoie une notification par email ET SMS à tous les administrateurs
    lorsqu'une nouvelle alerte est créée
    """
    try:
        print(f"🚨 Début de l'envoi de notification pour l'alerte {alerte.id}")
        
        # Récupérer tous les administrateurs actifs
        admins = Utilisateur.objects.filter(role='admin', is_active=True)
        print(f"👥 Admins trouvés: {admins.count()}")
        
        if not admins.exists():
            print("❌ Aucun administrateur trouvé")
            return False

        # ✅ 1. ENVOYER LES EMAILS
        emails_envoyes = envoyer_emails_aux_admins(alerte, admins)
        
        # ✅ 2. ENVOYER LES SMS
        sms_envoyes = envoyer_sms_aux_admins(alerte, admins)
        
        print(f"✅ Notifications envoyées - Emails: {emails_envoyes}, SMS: {sms_envoyes}")
        return emails_envoyes or sms_envoyes  # Retourne True si au moins un envoi a réussi
        
    except Exception as e:
        print(f"❌ Erreur lors de l'envoi de notification: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def envoyer_emails_aux_admins(alerte, admins):
    """Envoie les emails aux administrateurs"""
    try:
        # Préparer le sujet et le contenu de l'email
        sujet = f"🚨 Nouvelle alerte créée - {alerte.get_type_alerte_display()}"
        
        # Context pour le template HTML
        context = {
            'alerte': alerte,
            'type_alerte_display': alerte.get_type_alerte_display(),
            'date_creation': alerte.date_creation.strftime('%d/%m/%Y à %H:%M'),
            'site_name': 'ToliAlerte'
        }
        
        # Rendre le template HTML
        html_message = render_to_string('emails/nouvelle_alerte.html', context)
        message_texte = strip_tags(html_message)
        
        # Liste des emails des administrateurs
        emails_admins = [admin.email for admin in admins if admin.email]
        
        if not emails_admins:
            print("❌ Aucun email d'administrateur trouvé")
            return False
        
        # Envoyer l'email
        send_mail(
            subject=sujet,
            message=message_texte,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=emails_admins,
            html_message=html_message,
            fail_silently=False,
        )
        
        print(f"✅ Emails envoyés à {len(emails_admins)} administrateur(s)")
        return True
        
    except Exception as e:
        print(f"❌ Erreur lors de l'envoi des emails: {str(e)}")
        return False

def envoyer_sms_aux_admins(alerte, admins):
    """Envoie les SMS aux administrateurs qui ont activé les notifications SMS"""
    try:
        # Filtrer les admins qui veulent recevoir des SMS et ont un numéro
        admins_sms = [
            admin for admin in admins 
            if admin.receive_sms_alerts and admin.sms_phone
        ]
        
        print(f"📱 Admins avec SMS activé: {len(admins_sms)}")
        
        if not admins_sms:
            print("ℹ️ Aucun admin n'a activé les notifications SMS")
            return False
        
        # Préparer le message SMS
        message_sms = preparer_message_sms(alerte)
        
        # Envoyer à chaque admin
        succes = 0
        for admin in admins_sms:
            if envoyer_sms(admin.sms_phone, message_sms):
                succes += 1
                print(f"✅ SMS envoyé à {admin.sms_phone}")
            else:
                print(f"❌ Échec envoi SMS à {admin.sms_phone}")
        
        print(f"📱 SMS envoyés avec succès: {succes}/{len(admins_sms)}")
        return succes > 0
        
    except Exception as e:
        print(f"❌ Erreur lors de l'envoi des SMS: {str(e)}")
        return False

def preparer_message_sms(alerte):
    """Prépare le message SMS formaté"""
    type_alerte = alerte.get_type_alerte_display()
    description_courte = alerte.description[:50] + "..." if len(alerte.description) > 50 else alerte.description
    date = alerte.date_creation.strftime('%d/%m/%Y %H:%M')
    
    message = f"🚨 ALERTE {type_alerte}\n"
    message += f"{description_courte}\n"
    if alerte.adresse:
        message += f"📍 {alerte.adresse}\n"
    message += f"🕒 {date}\n"
    message += f"👤 Par: {alerte.utilisateur_nom}"
    
    return message