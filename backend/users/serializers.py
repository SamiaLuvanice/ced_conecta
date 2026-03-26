from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User


class UserSummarySerializer(serializers.ModelSerializer):
    turma = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'nome', 'email', 'perfil', 'turma')

    def get_turma(self, obj):
        if obj.turma:
            return {'id': obj.turma.id, 'nome': obj.turma.nome, 'codigo': obj.turma.codigo}
        return None


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    senha = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = authenticate(username=attrs['email'], password=attrs['senha'])
        if not user:
            raise serializers.ValidationError('Credenciais inválidas.')
        refresh = RefreshToken.for_user(user)
        return {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSummarySerializer(user).data,
        }
