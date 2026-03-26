from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.db import models


class User(AbstractUser):
    class Perfil(models.TextChoices):
        PROFESSOR = 'PROFESSOR', 'Professor'
        ALUNO = 'ALUNO', 'Aluno'

    first_name = None
    last_name = None
    email = models.EmailField(unique=True)
    nome = models.CharField(max_length=150)
    perfil = models.CharField(max_length=20, choices=Perfil.choices)
    turma = models.ForeignKey(
        'academic.Turma',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='alunos'
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'nome']

    def clean(self):
        if self.perfil == self.Perfil.ALUNO and not self.turma:
            raise ValidationError('Aluno deve estar vinculado a uma turma.')
        if self.perfil == self.Perfil.PROFESSOR and self.turma:
            raise ValidationError('Professor não deve estar vinculado a uma turma.')

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.nome or self.email
