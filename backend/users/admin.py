from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'nome', 'perfil', 'turma', 'is_staff')
    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        ('Informações pessoais', {'fields': ('nome', 'perfil', 'turma')}),
        ('Permissões', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Datas importantes', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'nome', 'perfil', 'turma', 'password1', 'password2', 'is_staff', 'is_active')
        }),
    )
    ordering = ('email',)
    search_fields = ('email', 'nome')
