# Fábrica de Retrovisores

Jogo de gerenciamento industrial em React + TypeScript, com Vite.

## Rodar localmente

```bash
npm install
npm run dev
```

## Gerar versão de produção

```bash
npm run build
npm run preview
```

## Publicar no GitHub Pages

1. Envie os arquivos deste projeto para a branch `main` do repositório.
2. No GitHub, abra **Settings → Pages**.
3. Em **Build and deployment**, selecione **GitHub Actions**.
4. Faça um `push` na branch `main` (ou execute o workflow manualmente em **Actions**).
5. Aguarde o workflow **Deploy to GitHub Pages** terminar. O endereço aparecerá no ambiente `github-pages`.

O Vite está configurado com `base: "./"` para funcionar tanto em repositórios de projeto quanto em domínios próprios.

## Estrutura

- `src/App.tsx`: ponto de montagem React.
- `src/main.tsx`: inicialização da aplicação.
- `src/game.ts`: motor e regras da simulação.
- `src/style.css`: estilos da fábrica.
- `.github/workflows/deploy.yml`: build e publicação automática.
