from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Atividade, Resposta, Turma
from .permissions import IsProfessor, IsAluno
from .serializers import (
    AtividadeSerializer,
    TurmaSerializer,
    TurmaProfessorSerializer,
    RespostaCreateSerializer,
    RespostaListSerializer,
    RespostaPatchSerializer,
)


class MyAtividadesView(APIView):
    def get(self, request):
        if request.user.perfil == 'PROFESSOR':
            queryset = Atividade.objects.filter(professor=request.user).select_related('turma').prefetch_related('respostas')
        else:
            queryset = Atividade.objects.filter(turma=request.user.turma).select_related('turma').prefetch_related('respostas')
        serializer = AtividadeSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)


class AtividadeCreateView(generics.CreateAPIView):
    serializer_class = AtividadeSerializer
    permission_classes = [IsProfessor]


class AtividadeDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AtividadeSerializer
    permission_classes = [IsProfessor]

    def get_queryset(self):
        return Atividade.objects.filter(professor=self.request.user).select_related('turma').prefetch_related('respostas')


class TurmaListView(generics.ListAPIView):
    serializer_class = TurmaSerializer
    permission_classes = [IsProfessor]
    queryset = Turma.objects.all()


class MyTurmasView(generics.ListAPIView):
    serializer_class = TurmaProfessorSerializer
    permission_classes = [IsProfessor]

    def get_queryset(self):
        return (
            Turma.objects
            .filter(atividades__professor=self.request.user)
            .prefetch_related('alunos')
            .distinct()
            .order_by('nome')
        )


class MinhasRespostasView(generics.ListAPIView):
    serializer_class = RespostaListSerializer
    permission_classes = [IsAluno]

    def get_queryset(self):
        return Resposta.objects.filter(aluno=self.request.user).select_related('atividade', 'aluno')


class RespostaCreateView(generics.CreateAPIView):
    serializer_class = RespostaCreateSerializer
    permission_classes = [IsAluno]


class AtividadeRespostasView(generics.ListAPIView):
    serializer_class = RespostaListSerializer
    permission_classes = [IsProfessor]

    def get_queryset(self):
        atividade_id = self.kwargs['pk']
        return Resposta.objects.filter(
            atividade_id=atividade_id,
            atividade__professor=self.request.user,
        ).select_related('atividade', 'aluno')


class RespostaPatchView(generics.UpdateAPIView):
    queryset = Resposta.objects.select_related('atividade', 'aluno', 'atividade__professor')
    serializer_class = RespostaPatchSerializer

    def patch(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(RespostaListSerializer(instance, context={'request': request}).data, status=status.HTTP_200_OK)
