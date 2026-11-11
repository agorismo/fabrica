# Fábrica de Retrovisores

Versão atualizada migrada para uma estrutura React + TypeScript + Vite.

## Desenvolvimento
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
npm run preview
```

## GitHub Pages
Envie o conteúdo para a branch `main` e configure **Settings → Pages → Source → GitHub Actions**. O workflow em `.github/workflows/deploy.yml` compila o Vite e publica `dist`.

O motor original foi preservado em `src/game.ts` e inicializado depois que o HTML da interface é montado. Essa etapa prioriza manter a simulação atualizada funcionando; a refatoração completa dos sistemas em componentes React nativos pode ser feita gradualmente.
