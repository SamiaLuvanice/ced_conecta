# Ced Conecta

Conectando professores e alunos em um fluxo simples de criação, entrega e correção de atividades.

Ced Conecta é uma plataforma web educacional para gerenciamento de atividades entre professores e alunos. O projeto foi pensado como um MVP funcional para apoiar o ciclo completo de atividades escolares: criação, envio de respostas, correção e devolutiva.

## Proposta do projeto

O sistema organiza o fluxo de trabalho acadêmico por perfil de usuário:

- Professor cria atividades por turma, acompanha envios e corrige respostas.
- Aluno visualiza apenas atividades da própria turma, envia resposta e acompanha retorno do professor.

Objetivo principal:

- centralizar em uma única interface o processo de atividade escolar com regras de acesso por perfil.

## Funcionalidades por perfil

### Professor

- autenticação por e-mail e senha
- dashboard com indicadores de pendências
- listagem de atividades criadas
- criação e edição de atividades
- listagem de respostas por atividade
- correção com nota e/ou feedback

### Aluno

- autenticação por e-mail e senha
- dashboard com progresso de respostas e correções
- listagem de atividades da própria turma
- envio de resposta por atividade
- edição da resposta antes do prazo
- visualização de nota e feedback após correção

## Arquitetura e stack

- Backend: Django + Django REST Framework + Simple JWT
- Frontend: React (Vite) + React Router + Axios
- Banco: SQLite3 (ambiente local)
- Infra: Docker com dois containers (backend e frontend) orquestrados por Docker Compose

## Decisões técnicas

- User customizado no Django com campo perfil para distinguir PROFESSOR e ALUNO.
- Autenticação stateless com JWT (access + refresh token).
- Permissões e validações de negócio no backend para proteger regras críticas.
- React Router para separar fluxo de navegação entre professor e aluno.
- Seed de dados para facilitar demonstração e testes rápidos do MVP.

## Estrutura do repositório

```text
ced_conecta/
├── backend/
├── frontend/
├── docker-compose.yml
└── README.md
```

## Variaveis de ambiente

Copie os arquivos de exemplo antes de executar:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

## Como executar sem Docker

### 1. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Linux/macOS
# .venv\Scripts\activate   # Windows (PowerShell)
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_data
python manage.py runserver
```

Backend disponível em: http://localhost:8000

### 2. Frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend disponível em: http://localhost:5173

## Como executar com Docker

Na raiz do projeto:

```bash
docker compose up --build
```

### Modo demo temporario

O `docker-compose.yml` deste repositorio esta configurado para ambiente de demonstracao (`APP_ENV=demo`).
Nesse modo, o backend reidrata dados iniciais automaticamente na subida (seed), para facilitar avaliacao funcional rapida.

Importante:

- dados excluidos ou alterados manualmente podem voltar apos reinicio/update dos containers
- este modo nao promete persistencia real de dados
- use apenas para demo temporaria

Se quiser executar sem reidratacao automatica, remova `APP_ENV=demo` do servico `backend` e rode seed manualmente quando necessario:

```bash
docker compose exec backend python manage.py seed_data
```

Serviços expostos:

- backend: http://localhost:8000
- frontend: http://localhost:5173

## Contas de teste

### Professor

- e-mail: maxwell@cedconecta.com
- senha: 123456

### Aluna

- e-mail: vagna@cedconecta.com
- senha: 123456

## Endpoints principais

Observacao: todos os endpoints (exceto /auth/login e /auth/refresh) exigem token Bearer JWT.

- POST /auth/login
- POST /auth/refresh
- GET /me/atividades
- GET /me/turmas
- GET /turmas
- POST /atividades
- GET /atividades/{id}
- PUT/PATCH /atividades/{id}
- DELETE /atividades/{id}
- POST /respostas
- GET /me/respostas
- GET /atividades/{id}/respostas/
- PATCH /respostas/{id}/

## Regras de negócio implementadas

- aluno deve estar vinculado a uma turma
- aluno só visualiza atividades da própria turma
- aluno não pode enviar mais de uma resposta por atividade
- aluno só pode editar a própria resposta antes do prazo
- aluno não pode editar a resposta após o professor enviar feedback
- professor só pode corrigir atividades que criou
- nota deve estar entre 0 e 10
- professor pode atualizar nota e/ou feedback na correção

## Próximos passos sugeridos

- substituir SQLite por PostgreSQL para ambientes de homologação e produção
- adicionar testes automatizados de API e interface
- implementar CI para lint, testes e build em pull requests
