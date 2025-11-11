from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.contrib.auth.models import User
from .models import Track, Profile, Rating, Favorite
from .serializers import (
    TrackSerializer, UserRegisterSerializer, UserSerializer, ProfileSerializer, RatingSerializer, FavoriteSerializer
)
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticatedOrReadOnly

class TrackViewSet(viewsets.ModelViewSet):
    queryset = Track.objects.all().order_by('id')
    serializer_class = TrackSerializer
    pagination_class = PageNumberPagination
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_serializer_context(self):
        return {'request': self.request}

    @action(detail=True, methods=['post', 'delete'], permission_classes=[permissions.IsAuthenticated])
    def favorite(self, request, pk=None):
        track = self.get_object()
        user = request.user

        if request.method == 'POST':
            if Favorite.objects.filter(user=user, track=track).exists():
                return Response({'detail': 'Trilha já favoritada.'}, status=status.HTTP_409_CONFLICT)
            else:
                Favorite.objects.create(user=user, track=track)
                return Response({'detail': 'Trilha favoritada com sucesso.'}, status=status.HTTP_201_CREATED)

        elif request.method == 'DELETE':
            try:
                favorite_instance = Favorite.objects.get(user=user, track=track)
                favorite_instance.delete()
                return Response({'detail': 'Trilha removida dos favoritos.'}, status=status.HTTP_204_NO_CONTENT)
            except Favorite.DoesNotExist:
                return Response({'detail': 'Trilha não está nos seus favoritos.'}, status=status.HTTP_404_NOT_FOUND)

class UserRegisterViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return User.objects.filter(id=self.request.user.id)

    @action(detail=False, methods=['get', 'put', 'patch'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        user = request.user
        if request.method in ['PUT', 'PATCH']:
            profile_serializer = ProfileSerializer(user.profile, data=request.data, partial=True, context={'request': request})
            if profile_serializer.is_valid():
                profile_serializer.save()
                return Response(UserSerializer(user, context={'request': request}).data)
            return Response(profile_serializer.errors, status=400)
        return Response(UserSerializer(user, context={'request': request}).data)

class RatingViewSet(viewsets.ModelViewSet):
    queryset = Rating.objects.all()
    serializer_class = RatingSerializer

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy', 'create']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        track = serializer.validated_data['track']
        if Rating.objects.filter(user=self.request.user, track=track).exists():
            from rest_framework import serializers as drf_serializers
            raise drf_serializers.ValidationError('Você já avaliou esta trilha.')
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        if serializer.instance.user != self.request.user:
            raise permissions.PermissionDenied('Você só pode editar suas próprias avaliações.')
        serializer.save()

    def perform_destroy(self, instance):
        if instance.user != self.request.user:
            raise permissions.PermissionDenied('Você só pode apagar suas próprias avaliações.')
        instance.delete()