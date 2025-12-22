from django.shortcuts import render
from rest_framework import viewsets, permissions
from .models import Alerte
from .serializers import AlerteSerializer
from rest_framework.permissions import AllowAny
from django.db.models import Count
from django.db.models.functions import TruncMonth
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Alerte
from .emails import envoyer_notification_alerte_aux_admins

class AlerteViewSet(viewsets.ModelViewSet):
    queryset = Alerte.objects.all()
    serializer_class = AlerteSerializer
    permission_classes = [AllowAny]  # Permet l'accès sans token
    
    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        # 🔥 CORRECTION : Capturer l'instance d'alerte retournée par save()
        alerte = serializer.save(utilisateur=user)

        try:
            envoyer_notification_alerte_aux_admins(alerte)  # ✅ Maintenant 'alerte' est défini
        except Exception as e:
            # Ne pas bloquer la création si l'envoi d'email échoue
            print(f"❌ Erreur lors de l'envoi de notification: {str(e)}")
            
@api_view(['GET'])
def historique_alertes_par_mois(request):
    data = (
        Alerte.objects
        .annotate(mois=TruncMonth('date_creation'))
        .values('mois', 'type_alerte')
        .annotate(total=Count('id'))
        .order_by('mois', 'type_alerte')
    )

    formatted_data = [
        {
            "mois": item["mois"].strftime("%Y-%m"),
            "type_alerte": item["type_alerte"],
            "total": item["total"]
        }
        for item in data
    ]
    return Response(formatted_data)