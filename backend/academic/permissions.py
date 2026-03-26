from rest_framework.permissions import BasePermission


class IsProfessor(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.perfil == 'PROFESSOR')


class IsAluno(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.perfil == 'ALUNO')
