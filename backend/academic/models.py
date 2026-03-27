from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone


class Turma(models.Model):
    nome = models.CharField(max_length=100)
    codigo = models.CharField(max_length=30, unique=True)
    descricao = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['nome']

    def __str__(self):
        return self.nome


class Atividade(models.Model):
    titulo = models.CharField(max_length=255)
    descricao = models.TextField()
    data_entrega = models.DateTimeField()
    turma = models.ForeignKey(Turma, on_delete=models.CASCADE, related_name='atividades')
    professor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='atividades_criadas')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['data_entrega', '-created_at']

    def clean(self):
        if self.professor.perfil != 'PROFESSOR':
            raise ValidationError('A atividade deve pertencer a um professor.')

    def __str__(self):
        return self.titulo


class Resposta(models.Model):
    atividade = models.ForeignKey(Atividade, on_delete=models.CASCADE, related_name='respostas')
    aluno = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='respostas_enviadas')
    texto_resposta = models.TextField()
    nota = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True)
    feedback = models.TextField(blank=True)
    enviada_em = models.DateTimeField(auto_now_add=True)
    atualizada_em = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['atividade', 'aluno'], name='unique_resposta_por_atividade_aluno')
        ]
        ordering = ['-atualizada_em']

    def clean(self):
        if self.aluno.perfil != 'ALUNO':
            raise ValidationError('A resposta deve pertencer a um aluno.')
        if self.aluno.turma_id != self.atividade.turma_id:
            raise ValidationError('O aluno só pode responder atividades da própria turma.')
        if self.nota is not None and (self.nota < 0 or self.nota > 10):
            raise ValidationError('A nota deve estar entre 0 e 10.')

    def __str__(self):
        return f'{self.aluno} - {self.atividade}'
