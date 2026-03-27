from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from academic.models import Turma, Atividade, Resposta

User = get_user_model()

class Command(BaseCommand):
    help = 'Cria dados iniciais para o Ced Conecta.'

    def handle(self, *args, **options):
        turmas_seed = [
            {'codigo': '1A-2026', 'nome': '1 Ano A', 'descricao': 'Turma de exemplo'},
            {'codigo': '1B-2026', 'nome': '1 Ano B', 'descricao': 'Turma de ciencias'},
            {'codigo': '2A-2026', 'nome': '2 Ano A', 'descricao': 'Turma de humanas'},
            {'codigo': '2B-2026', 'nome': '2 Ano B', 'descricao': 'Turma de exatas'},
            {'codigo': '3A-2026', 'nome': '3 Ano A', 'descricao': 'Turma preparatoria'},
        ]

        turmas = []
        for item in turmas_seed:
            turma, _ = Turma.objects.get_or_create(
                codigo=item['codigo'],
                defaults={'nome': item['nome'], 'descricao': item['descricao']}
            )
            turmas.append(turma)

        professor, created = User.objects.get_or_create(
            email='ana@cedconecta.com',
            defaults={
                'username': 'ana.professora',
                'nome': 'Ana Professora',
                'perfil': 'PROFESSOR',
                'is_staff': True,
            }
        )
        if created or not professor.check_password('123456'):
            professor.set_password('123456')
            professor.save()

        aluno, created = User.objects.get_or_create(
            email='joao@cedconecta.com',
            defaults={
                'username': 'joao.aluno',
                'nome': 'Joao Aluno',
                'perfil': 'ALUNO',
                'turma': turmas[0],
            }
        )
        if aluno.turma_id != turmas[0].id:
            aluno.turma = turmas[0]
        if created or not aluno.check_password('123456'):
            aluno.set_password('123456')
        aluno.save()

        alunos_por_turma = 4
        for turma in turmas:
            total_alunos_turma = User.objects.filter(perfil='ALUNO', turma=turma).count()
            alunos_faltantes = max(alunos_por_turma - total_alunos_turma, 0)

            for posicao in range(1, alunos_faltantes + 1):
                sequencia = total_alunos_turma + posicao
                codigo_turma = turma.codigo.lower().replace('-', '').replace(' ', '')
                email_aluno = f'aluno.{codigo_turma}.{sequencia}@cedconecta.com'

                aluno_turma, created = User.objects.get_or_create(
                    email=email_aluno,
                    defaults={
                        'username': f'aluno.{codigo_turma}.{sequencia}',
                        'nome': f'Aluno {turma.nome} {sequencia}',
                        'perfil': 'ALUNO',
                        'turma': turma,
                    }
                )

                if aluno_turma.turma_id != turma.id:
                    aluno_turma.turma = turma
                if created or not aluno_turma.check_password('123456'):
                    aluno_turma.set_password('123456')
                aluno_turma.save()

        atividades_seed = [
            {
                'titulo': 'Redacao sobre cidadania digital',
                'descricao': 'Escreva um texto de ate 15 linhas sobre o uso responsavel da internet.',
                'dias': 5,
            },
            {
                'titulo': 'Pesquisa sobre energia renovavel',
                'descricao': 'Pesquise duas fontes de energia renovavel e explique suas vantagens.',
                'dias': 7,
            },
            {
                'titulo': 'Resumo de revolucao industrial',
                'descricao': 'Produza um resumo com as principais transformacoes sociais da revolucao industrial.',
                'dias': 6,
            },
            {
                'titulo': 'Lista de funcoes do 2 grau',
                'descricao': 'Resolva os exercicios de funcao quadratica e apresente o passo a passo.',
                'dias': 4,
            },
            {
                'titulo': 'Plano de estudo para vestibular',
                'descricao': 'Monte um plano de estudo semanal com metas e revisoes.',
                'dias': 8,
            },
        ]

        atividades = []
        for turma, atividade_seed in zip(turmas, atividades_seed):
            atividade, _ = Atividade.objects.get_or_create(
                titulo=atividade_seed['titulo'],
                professor=professor,
                turma=turma,
                defaults={
                    'descricao': atividade_seed['descricao'],
                    'data_entrega': timezone.now() + timedelta(days=atividade_seed['dias']),
                }
            )
            atividades.append(atividade)

        respostas_minimas_por_atividade = 2
        todas_atividades = Atividade.objects.select_related('turma').order_by('id')

        for index, atividade in enumerate(todas_atividades, start=1):
            alunos_turma = list(User.objects.filter(perfil='ALUNO', turma=atividade.turma).order_by('id'))
            if not alunos_turma:
                continue

            respostas_existentes = Resposta.objects.filter(atividade=atividade)
            total_respostas_existentes = respostas_existentes.count()
            alunos_que_ja_responderam = set(respostas_existentes.values_list('aluno_id', flat=True))

            alunos_disponiveis = [
                aluno_turma
                for aluno_turma in alunos_turma
                if aluno_turma.id not in alunos_que_ja_responderam and aluno_turma.email != 'joao@cedconecta.com'
            ]
            respostas_faltantes = max(respostas_minimas_por_atividade - total_respostas_existentes, 0)

            for posicao, aluno_turma in enumerate(alunos_disponiveis[:respostas_faltantes], start=1):
                Resposta.objects.get_or_create(
                    atividade=atividade,
                    aluno=aluno_turma,
                    defaults={
                        'texto_resposta': f'Resposta de exemplo {posicao} para a atividade {index}.',
                        'nota': None,
                        'feedback': '',
                    },
                )

        self.stdout.write(self.style.SUCCESS('Dados iniciais criados com sucesso (5 turmas, 4 alunos por turma, minimo de 2 respostas por atividade).'))
