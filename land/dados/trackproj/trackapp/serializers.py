from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Track, Profile, Rating, Favorite

class TrackSerializer(serializers.ModelSerializer):
    is_favorited = serializers.SerializerMethodField()

    class Meta:
        model = Track
        fields = '__all__' + ('is_favorited',)

    def get_is_favorited(self, obj):
        request = self.context.get('request', None)
        if request and request.user.is_authenticated:
            return Favorite.objects.filter(user=request.user, track=obj).exists()
        return False

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    name = serializers.CharField(write_only=True)
    phone = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    cpf = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'name', 'phone', 'cpf']

    def create(self, validated_data):
        name = validated_data.pop('name')
        phone = validated_data.pop('phone', '')
        cpf = validated_data.pop('cpf', '')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        Profile.objects.create(user=user, name=name, phone=phone, cpf=cpf)
        return user

class ProfileSerializer(serializers.ModelSerializer):
    picture = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ['name', 'phone', 'cpf', 'picture']

    def get_picture(self, obj):
        if obj.photo and hasattr(obj.photo, 'url'):
            request = self.context.get('request')
            if request is not None:
                return request.build_absolute_uri(obj.photo.url)
            return obj.photo.url # Fallback para URL relativa se request não estiver disponível
        return None

class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'profile']

class RatingSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.id')

    class Meta:
        model = Rating
        fields = ['id', 'user', 'track', 'comment', 'date', 'score']
        read_only_fields = ['user', 'date']

class FavoriteSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username') # Ou 'user.id' dependendo do que você quer exibir

    class Meta:
        model = Favorite
        fields = ['id', 'user', 'track', 'created_at']
        read_only_fields = ['user', 'created_at']
