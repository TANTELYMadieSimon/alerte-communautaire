from rest_framework import viewsets, permissions
from rest_framework.response import Response
from .models import Annonce
from .serializers import AnnonceSerializer

class AnnonceViewSet(viewsets.ModelViewSet):
    queryset = Annonce.objects.all().order_by('-date_publication')
    serializer_class = AnnonceSerializer
    permission_classes = [permissions.AllowAny]   # ← Cette ligne résout tout

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', True)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)