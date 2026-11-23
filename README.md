# Mathutando — POC de matemática interativa

Protótipo mobile-first de um tutor de Matemática A **sem IA, sem login e sem servidor**.

## Como arrancar

Requer Node.js 20.19+ ou 22.12+.

```bash
npm install
npm run dev
```

Abre o endereço indicado pelo Vite no browser. Para validar o build:

```bash
npm run build
npm run preview
npm test
```

## O que já existe

- Um módulo de **Probabilidade condicionada** (grupo de referência, casos favoráveis e cálculo).
- Resolução guiada com três passos e quatro opções em cada passo.
- Cartões escolhidos por toque/clique **ou arrastamento** com rato e touch.
- Feedback específico para erros comuns, pistas progressivas e explicações depois de acertar.
- Prática com exemplo novo e menos ajuda.
- Desafio final com resposta livre (fração, decimal ou percentagem).
- Persistência local do progresso e reinício da sessão.
- Interface responsiva em português de Portugal; navegação por teclado via escolha direta.

## Organização

- `src/content/probabilities.ts`: conteúdo pedagógico e opções tipadas.
- `src/components/ChoiceBoard.tsx`: cartões de escolha, drag-and-drop e slot.
- `src/components/ScenarioCard.tsx`: enunciado e tabela de frequências.
- `src/App.tsx`: etapas, validação e progresso.
- `src/styles/app.css`: estilos mobile-first.

## Publicar gratuitamente

O resultado de `npm run build` está em `dist/` (site estático).

- **GitHub Pages:** o workflow `.github/workflows/deploy.yml` publica a app automaticamente depois de cada push para `main`. Nas definições do repositório, em **Settings → Pages → Build and deployment**, selecionar **GitHub Actions**. O endereço previsto é `https://andrefernandes-95.github.io/mathutando/` **apenas depois do primeiro deploy concluído**. O comando `npm run build:pages` ajusta o base path para esse endereço.
- **Cloudflare Pages / Netlify:** importar o repositório e usar `npm run build` com output `dist`.

Não existem chaves, contas ou infraestrutura paga nesta fase.

## Próximos passos

1. Testar em ecrãs pequenos e com 5 alunos reais.
2. Separar um motor genérico de etapas do conteúdo de cada módulo.
3. Adicionar outros tipos de interação: seleção de regiões de Venn, ordenar etapas e completar fórmulas.
4. Guardar estatísticas por conceito/erro, sem recolher dados pessoais no início.
5. Só então considerar um backend ou IA.

## Nota

Este POC é um exemplo de produto, não uma validação científica de aprendizagem. O acerto por múltipla escolha não prova domínio; por isso o desafio final não fornece opções.

## Validação

O código TypeScript/TSX passou na verificação sintática local. O `npm run build` completo necessita de instalar as dependências (`npm install`) num ambiente com acesso ao registry npm; essa verificação ainda não foi executada aqui.
