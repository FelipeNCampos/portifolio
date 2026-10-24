# Portfólio de Felipe Nunes Campos

Site estático em **React + TypeScript + Vite**, pronto para **GitHub Pages**. Perfil, experiências, projetos do currículo, certificados e comprovantes acompanham o frontend. A publicação não usa backend, banco de dados ou serviços AWS.

## Executar localmente

Requer Node.js 24 e npm:

```powershell
npm ci
npm run dev
```

Abra `http://localhost:4173`. Não é necessário iniciar Python ou Docker nem configurar `.env`.

## Publicar no GitHub Pages

1. No repositório, abra **Settings → Pages → Build and deployment** e escolha **Source: GitHub Actions**.
2. Faça commit das alterações e push para `main`.
3. Acompanhe **Actions → Test and deploy GitHub Pages**. O workflow testa, gera `dist` e publica o site.
4. Abra a URL do ambiente `github-pages`, esperada como **https://felipencampos.github.io/portifolio/**.

O [guia de publicação](docs/deploy-github-pages.md) explica o processo e a configuração de domínio próprio. O deploy não exige secrets, tokens pessoais ou variável de API. A configuração anterior `VITE_API_BASE_URL` pode ser removida das variáveis do repositório; o frontend não a usa.

O build local usa `/portifolio/`. No Actions, o caminho é calculado pelo nome do repositório. Para domínio próprio ou um repositório `usuario.github.io`, defina **`VITE_BASE_PATH=/`** em **Settings → Secrets and variables → Actions → Variables**. Mudanças de configuração exigem nova execução do workflow.

## Verificar o build

```powershell
npm test
npm run build
npm run preview
```

Abra `http://localhost:4173/portifolio/` para conferir o build local. `dist` contém todos os arquivos necessários à hospedagem estática e não é versionado. O preview serve apenas para conferir o build no computador.

## Atualizar o conteúdo

- **Perfil, contato e projetos do currículo:** `src/infrastructure/profile/initialProfile.ts`.
- **Certificados:** `src/infrastructure/profile/credentials.json`.
- **PDFs e imagens de comprovantes:** `public/credentials/`.

Para adicionar um certificado, copie o comprovante para `public/credentials`, crie um registro com ID único no JSON e use um caminho como `/credentials/meu-certificado.pdf`. A interface aplica o prefixo do Pages automaticamente. `published: false` oculta o registro na interface; os arquivos estáticos enviados ao Pages continuam acessíveis por URL. Altere o conteúdo pelo código e publique um novo commit.

Os 19 registros incluem treinamentos AWS, Harvard CS50 e cursos Python, com os 18 arquivos fornecidos. Treinamentos e questões de prática AWS não representam aprovação em exame de certificação. Datas, carga horária ou links não fornecidos não são inventados.

A logo de Harvard no destaque CS50 é uma cópia local da [imagem do site oficial da universidade](https://www.harvard.edu/wp-content/uploads/2020/10/cropped-logo-branding-compressed.png?w=192), servida junto ao frontend.

## Repositórios GitHub

O navegador consulta diretamente a API pública do GitHub para o perfil configurado em `initialProfile.github`, sem autenticação e sem gravar dados. São considerados até os 100 repositórios mais recentemente atualizados por push, excluindo forks, privados, arquivados e o README do próprio perfil. Os projetos do currículo permanecem independentes dessa lista.

A consulta está sujeita à disponibilidade e aos limites anônimos do GitHub. Em caso de falha, a página mantém o perfil, os projetos do currículo e os certificados e oferece um link para abrir o GitHub diretamente.

## Organização

- `src/presentation/`: interface React, estilos e animações.
- `src/domain/`: tipos dos dados públicos.
- `src/infrastructure/`: conteúdo estático, caminhos públicos e consulta ao GitHub.
- `public/`: arquivos publicados junto ao site.
- `.github/workflows/deploy-pages.yml`: testes, build e deploy do Pages.
- `tests/`: verificação de conteúdo, links e integração GitHub.

As pastas `backend/` e `legacy/`, os arquivos Compose e as imagens Docker existentes preservam a demonstração anterior. Não são utilizados pelo site estático, pelo build npm ou pelo workflow do Pages. A versão publicada não oferece login, gestão de contratos ou armazenamento de dados de visitantes.
