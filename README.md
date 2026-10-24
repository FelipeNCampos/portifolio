# Portfólio e contratos freelancers

Frontend **React + TypeScript + Vite**, backend **Python + FastAPI** e persistência local **SQLite**. O backend é a fonte de dados dos contratos e decisões de entrega; o frontend consome `/api` pelo proxy do Vite.

## Containers Docker

Requer Docker Desktop em execução com containers Linux e Docker Compose com suporte a `develop.watch` e `initial_sync` (configuração verificada com v5.4.0). Há dois serviços na rede bridge `application`: `frontend` e `backend`. O banco fica no volume nomeado `backend-data`, sem terceiro container. A venv do Windows não é copiada para as imagens.

### Desenvolvimento

```powershell
docker compose -f compose.yaml -f compose.dev.yaml up --build --watch
```

- Frontend: http://localhost:8080 (React/Vite).
- Backend direto: http://127.0.0.1:8000/api/health; documentação em http://127.0.0.1:8000/docs.
- `src` do frontend é sincronizado para `/app/src` pelo Compose Watch, incluindo o estado inicial; o Vite detecta as alterações dentro do container e atualiza a interface sem reconstruir a imagem.
- `public`, `index.html` e `vite.config.ts` continuam montados; o backend mantém seus mounts. Dependências pertencem às imagens. O Watch deste incremento cobre apenas o `src` do frontend e não envia `node_modules`.
- O proxy do frontend usa `http://backend:8000`, resolvido pelo DNS Docker.
- `BACKEND_DEV_PORT` altera somente a porta do host no modo dev; `FRONTEND_PORT` altera a porta do frontend em ambos os modos.

Mantenha o comando com `--watch` em execução durante o desenvolvimento. Se preferir deixar os containers em segundo plano, use dois comandos:

```powershell
docker compose -f compose.yaml -f compose.dev.yaml up --build -d
docker compose -f compose.yaml -f compose.dev.yaml watch --no-up frontend
```

Não combine `--watch` com `-d` no mesmo `up`. Executar apenas `up -d` não monitora o `src`; o processo Watch precisa estar ativo. `watch --no-up` pressupõe que o container já foi criado com a configuração atual. O bind mount de `src` foi removido para não disputar o mesmo destino com a sincronização. A configuração de produção (`compose.yaml` sem o override dev) não recebe Watch.

Referência: [Compose Watch](https://docs.docker.com/compose/how-tos/file-watch/).

### Execução com a topologia de produção

```powershell
# Necessário enquanto a aplicação ainda exige seus dados fictícios.
$env:APP_DEMO_MODE = 'true'
docker compose -f compose.yaml up --build -d --remove-orphans
```

O frontend serve o build React via Nginx em http://localhost:8080 e encaminha `/api/` para `backend:8000` pela rede Docker. O backend não tem `ports` publicado: `localhost:8000` não é disponibilizado por esta configuração. A API continua acessível pelo proxy `/api`, necessário ao React. OpenAPI e interfaces de documentação estão desativados com `APP_ENV=production`.

`APP_ENV` seleciona o comportamento da aplicação; a publicação de portas é uma configuração do Docker, definida exclusivamente em `compose.dev.yaml`. Para sair de dev, use apenas `compose.yaml` no comando acima; o Compose recria os serviços removendo a publicação direta do backend. Não basta trocar uma variável de ambiente dentro do container.

A configuração padrão deixa o frontend acessível somente pelo host (`127.0.0.1`). A aplicação tem autenticação de gestor, mas os contratos ainda são demonstrativos e as demais entregas descritas abaixo estão em desenvolvimento. Sem `APP_DEMO_MODE=true`, o backend atual recusa inicialização.

### Verificação e encerramento

```powershell
docker compose -f compose.yaml config
docker compose -f compose.yaml -f compose.dev.yaml config
docker compose ps
docker compose logs backend
# Em execução: deve responder pelo proxy do frontend.
Invoke-RestMethod http://localhost:8080/api/health
# Na configuração padrão: nenhuma publicação deve ser exibida.
docker compose port backend 8000
docker compose down
```

Em dev, use os mesmos dois argumentos `-f` nos comandos de gerenciamento. `down` preserva o volume do banco. Evite `down -v` se quiser manter os contratos e arquivos.

O Nginx e a API limitam o upload a 10 MiB. A rede bridge compartilhada permite comunicação interna; não é uma barreira contra administradores do Docker ou outros containers que sejam conectados explicitamente a ela. A restrição implementada é a ausência de publicação direta da porta do backend fora do modo dev.

Referências: [redes no Compose](https://docs.docker.com/compose/how-tos/networking/) e [combinação de arquivos Compose](https://docs.docker.com/compose/how-tos/multiple-compose-files/merge/).

## Executar localmente (PowerShell)

Na raiz do projeto, prepare o backend:

```powershell
python -m venv .venv
.\.venv\Scripts\python -m pip install -r backend/requirements-dev.txt
$env:APP_DEMO_MODE = 'true'
.\.venv\Scripts\python -m uvicorn backend.config.main:create_app --factory --reload --host 127.0.0.1 --port 8000
```

Em outro terminal, também na raiz:

```powershell
npm ci
npm run dev
```

Acesse http://localhost:4173. OpenAPI interativo: http://127.0.0.1:8000/docs.

## Verificar

```powershell
$env:APP_DEMO_MODE = 'true'
.\.venv\Scripts\python -m unittest discover -s backend/tests -v
npm run build
npm test
```

## Página principal

A interface atual mantém o banner escuro e o grafo animado, com áreas independentes de trabalhos, certificados, apresentação profissional e contato. Os três estudos de caso, experiências, formação em andamento na UFG, idiomas e habilidades vêm do currículo fornecido. Repositórios vêm do perfil GitHub informado pelo proprietário, sem presumir que correspondam aos projetos comerciais do currículo.

A seção de contato apresenta e-mail centralizado e um card de WhatsApp para +55 (62) 99456-6196, configurado no perfil inicial. O card abre `https://wa.me/5562994566196` em nova aba, sem enviar mensagens automaticamente nem carregar scripts externos.

- Perfil inicial: `src/infrastructure/profile/initialProfile.ts`.
- Certificados publicados: `GET /api/credentials`, com comprovantes estáticos em `public/credentials/`.
- A lista de cursos e comprovantes começa expandida. Os três destaques, nesta ordem, são AWS SimuLearn Cloud Practitioner, Harvard CS50 e o bootcamp Python. Os 18 arquivos fornecidos correspondem a 19 registros (13 AWS SimuLearn, um conjunto de questões DVA-C02, um bootcamp, três Mundos Python e um documento CS50); o badge AWS acompanha Cloud Practitioner, sem criar um curso duplicado.
- Repositórios: `GET /api/projects/github`; `GITHUB_USERNAME` configura o usuário no backend (padrão: `FelipeNCampos`). Não exige token GitHub e o navegador consulta somente a API local.

O endpoint GitHub retorna `{ status, profileUrl, updatedAt, repositories }`; cada repositório contém `{ name, description, language, updatedAt, url }`. `status` é `live`, `cached`, `stale` ou `unavailable`; a lista vazia não é usada para esconder falhas. O adaptador consulta até os 100 repositórios mais recentemente atualizados, ordenados por push, e o caso de uso exclui forks, privados, arquivados e o repositório README do próprio perfil. O link para o perfil permite explorar a listagem completa no GitHub.

Cache em memória por processo: 15 minutos após sucesso; falhas preservam a última resposta e suspendem novas consultas por 5 minutos. O cache não persiste após reinício. Há timeout de 4 segundos, limite de resposta de 2 MiB, validação de payload e usuário, host fixo e redirecionamentos desabilitados. O frontend trata carregamento, erro com nova tentativa e ausência de registros sem interromper o conteúdo do currículo. Limites anônimos do GitHub continuam aplicáveis.

## API de login e gestão de certificados

A área de gestão exige autenticação. Não há senha padrão nem cadastro público. Com o mesmo ambiente/banco do backend, crie o primeiro administrador no terminal:

```powershell
# Python local (ou use o python.exe da sua venv):
python -m backend.config.create_admin --email felipe.n.cmp@gmail.com
# Docker, com os serviços em execução:
docker compose exec backend python -m backend.config.create_admin --email felipe.n.cmp@gmail.com
```

O comando solicita e confirma uma senha de 12 a 128 caracteres sem exibi-la. Para dev Docker, use também `-f compose.yaml -f compose.dev.yaml`. A autenticação e a edição de certificados continuam disponíveis na API. A interface anterior de gestão está preservada em `legacy/frontend/`; não foi reintegrada à nova página principal neste incremento. A API permite cadastrar e editar título, emissor, conclusão, horas, links e publicação. Links aceitam HTTP(S) ou arquivos já disponíveis em `/credentials/`; upload de novos comprovantes pelo painel ainda não foi implementado. Ocultar remove o item da listagem pública, mas arquivos estáticos já existentes continuam públicos por URL.

A sessão fica em cookie HttpOnly/SameSite=Strict, expira em 8 horas e é revogada ao sair. Senhas usam scrypt e tokens de sessão são persistidos como hash. Alterações exigem token CSRF e papel `manager` no backend. Login tem limite de 5 tentativas por origem em 15 minutos. Para hospedagem HTTPS, configure `SESSION_COOKIE_SECURE=true`; o padrão `false` permite o ambiente local HTTP.

`GET /api/credentials` é público; `/api/admin/credentials` e as rotas de contratos exigem sessão. Mudanças de publicação são persistidas no SQLite e aparecem ao recarregar o portfólio. O seed `backend/infrastructure/credential_seed.json` inicializa apenas itens ausentes, preservando as edições.

Depois de atualizar o seed com o backend em execução, reinicie o serviço para adicionar os registros ausentes ao banco em uso. Em Docker dev: `docker compose -f compose.yaml -f compose.dev.yaml restart backend`. Alterar somente o JSON não dispara a carga de novos registros. O banco do volume Docker é independente de `backend/data/demo.sqlite3` no host.

## Organização

O conteúdo inicial do perfil está em `src/infrastructure/profile/initialProfile.ts`, transcrito do currículo de Felipe Nunes Campos. Datas ou links de credencial não informados não são inventados; o item ambíguo “Beautiful” foi omitido das habilidades até confirmação do nome. O perfil GitHub fornecido é `https://github.com/FelipeNCampos`. Os contratos fictícios da demonstração continuam separados dos dados profissionais reais. O PDF original do currículo não é copiado para a pasta pública do site.

O seed `backend/infrastructure/credential_seed.json` contém 13 treinamentos AWS SimuLearn, o bootcamp Python Udemy (57h), os três Mundos Python (40h cada), o Official Practice Question Set DVA-C02 (concluído em 23/10/2026) e Harvard CS50. Os títulos AWS seguem o conteúdo dos PDFs, inclusive “Core Security Concepts” e “Databases in Practice”, cujos nomes de arquivo são abreviados. A captura dos Mundos não fornece emissor ou datas. SimuLearn e o conjunto de questões DVA-C02 não são apresentados como aprovação em exame AWS Certified. CS50 aparece com nome do curso, instituição e link ao PDF original, sem adicionar data, carga horária ou validação externa não fornecidas. Os 16 PDFs e as duas imagens fornecidos estão em `public/credentials`, com links na interface; são arquivos estáticos públicos do frontend quando ele é servido. PDFs só são carregados quando o visitante abre seus links; a imagem do badge usa carregamento tardio. Docker inclui esses arquivos no build e monta `public` no modo dev. O seed adiciona registros ausentes sem sobrescrever edições ou ocultações feitas pelo gestor.

O banner atual usa o grafo SVG `src/presentation/NetworkPulse.tsx` com pulsos de conexões e suporte a `prefers-reduced-motion`. Dos 22 vértices, apenas seis são ícones SVG locais: usuários e WhatsApp na entrada, duas engrenagens de processamento e dois bancos de dados. Os outros 16 continuam como pontos. A topologia e os atrasos ficam em `src/presentation/networkGraph.ts`, com fluxo direcionado e testado para que armazenamento ocorra após processamento. Os ícones pulsam de forma discreta, sem girar, e não adicionam dependências nem requisições externas. Não há botão de repetição. As novas seções seguem a tipografia e as cores existentes; usam listas, detalhes expansíveis nativos, foco visível e layout responsivo. O frontend anterior está preservado em `legacy/frontend/`.

Os títulos principais de Projetos, Certificados, Sobre e Contato reutilizam `src/presentation/SectionIntro.tsx`, com um grafo espelhado em cada lateral do conteúdo. O primeiro vértice desses grafos usa um ícone de Wi-Fi, com margem para não ser cortado nas bordas; o banner mantém seu ponto de origem original. As ondas radiais podem ultrapassar as caixas dos grafos e são exibidas em uma camada acima do conteúdo, sem interceptar cliques (`pointer-events: none`). Em telas estreitas, os grafos passam para a linha abaixo do título e da descrição. A propagação usa os mesmos pulsos CSS e respeita movimento reduzido; cada cabeçalho possui um observador de interseção que, junto da visibilidade da aba, pausa suas animações quando não estão visíveis. As nove instâncias do grafo (incluindo o banner) usam identificadores SVG independentes. Informações profissionais e links de contato permanecem no conteúdo central, fora dos elementos decorativos.

- `src/`: apresentação React, modelos tipados e adaptador HTTP do frontend.
- `backend/domain/`: regras puras de documentos e decisões, tipos e porta de consulta de repositórios.
- `backend/application/`: casos de uso e porta de persistência.
- `backend/presentation/`: rotas HTTP e DTOs FastAPI.
- `backend/infrastructure/`: SQLite, dados fictícios, versões dos documentos e adaptador GitHub com cache.
- `backend/config/`: composição de dependências e inicialização.

## Estado do incremento

Contratos e decisões são persistidos em `backend/data/demo.sqlite3`. O envio transmite os bytes do PDF à API, cria uma versão documental imutável e registra SHA-256. PDFs/PDF-A de até 10 MiB (10 × 1024 × 1024 bytes) passam por validação inicial de extensão, tipo, cabeçalho e finalização. Isso não valida conformidade PDF/A, assinatura, estrutura completa ou ausência de malware.

O ambiente exige `APP_DEMO_MODE=true` para os contratos fictícios e deve permanecer local. Login de gestor e controle de certificados estão implementados no backend; a nova interface pública ainda não oferece painel de gestão. Personalização do perfil, reintegração do painel, acesso individual de contratantes, SMTP Gmail, recuperação de senha, antimalware, download autorizado, auditoria completa e execução da retenção ainda são próximas entregas. A prévia do contratante da interface anterior não cria uma sessão de contratante. Não envie contratos reais nesta versão.

O build produz os arquivos do frontend em `dist`; a imagem de produção configura o proxy `/api` no Nginx. O proxy de desenvolvimento pertence ao Vite.
