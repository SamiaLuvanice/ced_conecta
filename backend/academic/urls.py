from django.urls import path
from .views import (
    MyAtividadesView,
    AtividadeCreateView,
    AtividadeDetailView,
    TurmaListView,
    MyTurmasView,
    RespostaCreateView,
    MinhasRespostasView,
    AtividadeRespostasView,
    RespostaPatchView,
)

urlpatterns = [
    path('me/atividades', MyAtividadesView.as_view(), name='me-atividades'),
    path('me/turmas', MyTurmasView.as_view(), name='me-turmas'),
    path('turmas', TurmaListView.as_view(), name='turmas-list'),
    path('atividades', AtividadeCreateView.as_view(), name='atividade-create'),
    path('atividades/<int:pk>', AtividadeDetailView.as_view(), name='atividade-detail'),
    path('respostas', RespostaCreateView.as_view(), name='resposta-create'),
    path('me/respostas', MinhasRespostasView.as_view(), name='minhas-respostas'),
    path('atividades/<int:pk>/respostas/', AtividadeRespostasView.as_view(), name='atividade-respostas'),
    path('respostas/<int:pk>/', RespostaPatchView.as_view(), name='resposta-patch'),
]
