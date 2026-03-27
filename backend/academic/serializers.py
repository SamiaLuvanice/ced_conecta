from datetime import datetime, time

from django.utils import timezone
from rest_framework import serializers
from .models import Turma, Atividade, Resposta


class TurmaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Turma
        fields = ('id', 'nome', 'codigo', 'descricao')


class TurmaProfessorSerializer(serializers.ModelSerializer):
    alunos_count = serializers.SerializerMethodField()
    alunos = serializers.SerializerMethodField()

    class Meta:
        model = Turma
        fields = ('id', 'nome', 'codigo', 'descricao', 'alunos_count', 'alunos')

    def get_alunos_count(self, obj):
        cache = getattr(obj, '_prefetched_objects_cache', {})
        if 'alunos' in cache:
            return len(cache['alunos'])
        return obj.alunos.count()

    def get_alunos(self, obj):
        cache = getattr(obj, '_prefetched_objects_cache', {})
        if 'alunos' in cache:
            alunos = cache['alunos']
        else:
            alunos = obj.alunos.all()
        return [{'id': aluno.id, 'nome': aluno.nome} for aluno in alunos]


class AtividadeSerializer(serializers.ModelSerializer):
    turma = TurmaSerializer(read_only=True)
    turma_id = serializers.PrimaryKeyRelatedField(queryset=Turma.objects.all(), write_only=True, source='turma')
    professor_nome = serializers.CharField(source='professor.nome', read_only=True)
    status = serializers.SerializerMethodField()
    total_respostas = serializers.SerializerMethodField()
    total_corrigidas = serializers.SerializerMethodField()
    total_pendentes_correcao = serializers.SerializerMethodField()
    minha_resposta_id = serializers.SerializerMethodField()

    class Meta:
        model = Atividade
        fields = (
            'id', 'titulo', 'descricao', 'data_entrega', 'turma', 'turma_id', 'professor_nome',
            'created_at', 'updated_at', 'status', 'total_respostas', 'total_corrigidas',
            'total_pendentes_correcao', 'minha_resposta_id'
        )
        read_only_fields = ('created_at', 'updated_at')

    def validate_data_entrega(self, value):
        # Toda atividade vence no ultimo minuto do dia informado (23:59:59).
        if timezone.is_aware(value):
            value_local = timezone.localtime(value)
            return datetime.combine(value_local.date(), time(23, 59, 59), tzinfo=value_local.tzinfo)
        return datetime.combine(value.date(), time(23, 59, 59))

    def get_status(self, obj):
        user = self.context['request'].user
        prazo_encerrado = timezone.now() > obj.data_entrega
        if user.perfil == 'PROFESSOR':
            return 'prazo_encerrado' if prazo_encerrado else 'aberta'
        resposta = obj.respostas.filter(aluno=user).first()
        if resposta and resposta.nota is not None:
            return 'corrigida'
        if resposta:
            return 'respondida'
        return 'prazo_encerrado' if prazo_encerrado else 'nao_respondida'

    def get_total_respostas(self, obj):
        respostas = self._get_respostas(obj)
        return len(respostas)

    def get_total_corrigidas(self, obj):
        respostas = self._get_respostas(obj)
        return sum(1 for resposta in respostas if resposta.nota is not None)

    def get_total_pendentes_correcao(self, obj):
        respostas = self._get_respostas(obj)
        return sum(1 for resposta in respostas if resposta.nota is None)

    def _get_respostas(self, obj):
        cache = getattr(obj, '_prefetched_objects_cache', {})
        if 'respostas' in cache:
            return cache['respostas']
        return list(obj.respostas.all())

    def get_minha_resposta_id(self, obj):
        user = self.context['request'].user
        if user.is_authenticated and user.perfil == 'ALUNO':
            resposta = obj.respostas.filter(aluno=user).first()
            return resposta.id if resposta else None
        return None

    def create(self, validated_data):
        request = self.context['request']
        return Atividade.objects.create(professor=request.user, **validated_data)


class RespostaListSerializer(serializers.ModelSerializer):
    aluno_nome = serializers.CharField(source='aluno.nome', read_only=True)
    atividade_titulo = serializers.CharField(source='atividade.titulo', read_only=True)

    class Meta:
        model = Resposta
        fields = (
            'id', 'atividade', 'atividade_titulo', 'aluno', 'aluno_nome', 'texto_resposta',
            'nota', 'feedback', 'enviada_em', 'atualizada_em'
        )
        read_only_fields = fields


class RespostaCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resposta
        fields = ('id', 'atividade', 'texto_resposta')

    def validate(self, attrs):
        user = self.context['request'].user
        atividade = attrs['atividade']
        if user.perfil != 'ALUNO':
            raise serializers.ValidationError('Somente alunos podem enviar respostas.')
        if user.turma_id != atividade.turma_id:
            raise serializers.ValidationError('O aluno não pode acessar atividade de outra turma.')
        if timezone.now() > atividade.data_entrega:
            raise serializers.ValidationError('O prazo para envio já foi encerrado.')
        if Resposta.objects.filter(atividade=atividade, aluno=user).exists():
            raise serializers.ValidationError('O aluno não pode enviar mais de uma resposta para a mesma atividade.')
        return attrs

    def create(self, validated_data):
        return Resposta.objects.create(aluno=self.context['request'].user, **validated_data)


class RespostaPatchSerializer(serializers.ModelSerializer):
    texto_resposta = serializers.CharField(required=False)
    nota = serializers.DecimalField(max_digits=3, decimal_places=1, required=False)
    feedback = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Resposta
        fields = ('texto_resposta', 'nota', 'feedback')

    def validate(self, attrs):
        request = self.context['request']
        resposta = self.instance
        user = request.user

        if user.perfil == 'ALUNO':
            if resposta.aluno_id != user.id:
                raise serializers.ValidationError('Você só pode editar a própria resposta.')
            if timezone.now() > resposta.atividade.data_entrega:
                raise serializers.ValidationError('A resposta não pode ser alterada após a data de entrega.')
            if resposta.feedback and resposta.feedback.strip():
                raise serializers.ValidationError('A resposta não pode ser alterada após o professor enviar feedback.')
            if 'nota' in attrs or 'feedback' in attrs:
                raise serializers.ValidationError('Aluno não pode corrigir resposta.')
            if 'texto_resposta' not in attrs:
                raise serializers.ValidationError('Informe o texto da resposta para editar.')

        elif user.perfil == 'PROFESSOR':
            if resposta.atividade.professor_id != user.id:
                raise serializers.ValidationError('O professor só pode corrigir atividades que criou.')
            if 'texto_resposta' in attrs:
                raise serializers.ValidationError('Professor não pode editar o texto da resposta do aluno.')
            if 'nota' not in attrs and 'feedback' not in attrs:
                raise serializers.ValidationError('Informe nota e/ou feedback para corrigir a resposta.')
            if 'nota' in attrs:
                nota = attrs.get('nota')
                if nota < 0 or nota > 10:
                    raise serializers.ValidationError('A nota deve estar entre 0 e 10.')
        else:
            raise serializers.ValidationError('Perfil inválido.')

        return attrs
