# Publicar somente no GitHub Pages

O projeto funciona como um site estático. Os certificados e comprovantes acompanham a publicação; a seção de repositórios consulta diretamente o GitHub. Não é necessário configurar backend, Lambda, S3, banco de dados, credenciais AWS ou URL de API.

## 1. Conferir localmente

Na raiz do projeto, no PowerShell, com Node.js 24 instalado:

```powershell
npm ci
npm test
npm run build
npm run preview
```

Abra **http://localhost:4173/portifolio/** e confira os certificados e um PDF. Para desenvolvimento com recarga automática, use `npm run dev` e abra `http://localhost:4173`.

## 2. Habilitar o Pages

No [repositório FelipeNCampos/portifolio](https://github.com/FelipeNCampos/portifolio), abra **Settings → Pages → Build and deployment** e selecione **Source: GitHub Actions**. No plano gratuito, o Pages exige repositório público; repositórios privados precisam de um plano compatível.

O workflow já calcula `/portifolio/` pelo nome do repositório. Nenhuma variável é obrigatória. Se configurou `VITE_API_BASE_URL` no fluxo anterior, pode removê-la em **Settings → Secrets and variables → Actions → Variables**: ela não é utilizada.

## 3. Enviar as alterações

Na raiz do projeto:

```powershell
git status
git add .
git commit -m "feat: publish portfolio as a static GitHub Pages site"
git push origin main
```

Se estiver em outra branch, faça merge em `main`. Pull requests executam testes e build; apenas `main` publica.

Abra **Actions → Test and deploy GitHub Pages** e acompanhe os jobs **build** e **deploy**. Se o código já estiver em `main`, use **Run workflow** para iniciar a publicação manualmente.

## 4. Abrir e verificar

O endereço esperado é **https://felipencampos.github.io/portifolio/**. Use a URL exibida no ambiente **github-pages** para confirmar a publicação. Confira os 19 certificados, o badge e a abertura dos comprovantes; seus caminhos devem incluir `/portifolio/credentials/`.

Se faltar CSS ou houver erro 404 nos arquivos, confira o nome do repositório e `VITE_BASE_PATH`. Para este repositório, o valor correto é `/portifolio/`. O layout usa âncoras na mesma página, sem rotas que dependam de configuração de servidor.

A seção de repositórios depende da API pública do GitHub, mas sua falha não afeta os certificados e o conteúdo profissional. Se atingir um limite de consultas, aguarde ou use o link direto para o perfil; não coloque tokens no código do frontend.

## Domínio próprio

Para servir o site na raiz de um domínio próprio, configure esse domínio em **Settings → Pages** e siga as instruções DNS fornecidas pelo GitHub. Em **Settings → Secrets and variables → Actions → Variables**, crie **`VITE_BASE_PATH`** com o valor `/`. Execute o workflow novamente. O mesmo valor se aplica a um repositório `usuario.github.io`.

## Atualizar o portfólio

Edite `src/infrastructure/profile/initialProfile.ts` para alterar perfil e projetos do currículo. Edite `src/infrastructure/profile/credentials.json` para atualizar certificados e adicione comprovantes em `public/credentials/`. Cada commit enviado para `main` gera uma nova publicação.

Os arquivos publicados são públicos. `published: false` oculta o certificado na interface, mas não torna seu arquivo privado. Para remover um comprovante da nova publicação, remova também o arquivo correspondente de `public/credentials/`.

O código da antiga demonstração de backend permanece no repositório por histórico, mas não participa da publicação. Se já criou recursos AWS seguindo o plano anterior, eles não são necessários para este site; a mudança no código não exclui esses recursos da sua conta.

Referências: [Vite no GitHub Pages](https://vite.dev/guide/static-deploy#github-pages), [workflows do Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) e [repositórios públicos na API GitHub](https://docs.github.com/en/rest/repos/repos#list-repositories-for-a-user).
