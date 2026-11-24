# Mathutando

Importa o enunciado e resolve à mão. **Pedir revisão** envia o original e os recortes do desenho à OpenAI. As pistas aparecem junto das contas e cada versão fica disponível na timeline.

## Correr

Com Node.js 22.16 ou superior, executa `npm ci` e `npm start`. Abre `http://127.0.0.1:5173`. Para testar o build, usa `npm run build` e `npm run preview`.

A aplicação guarda enunciados, traços e revisões no **localStorage** do perfil e endereço em uso. As alterações a cada exercício são gravadas em conjunto. Quando falta espaço, o editor assinala a falha e conserva a última gravação. Na primeira abertura, o histórico existente em IndexedDB é copiado para localStorage. Arquivos JSON anteriores continuam a poder ser importados no ecrã inicial.

O processo local que serve a interface também trata de `POST /api/review`. A chave do projeto vem de `OPENAI_API_KEY` no ambiente ou em `.env.local` na raiz, excluído do Git. A revisão usa a Responses API com `store: false` e a faturação da API do projeto. Uma cópia puramente estática de `dist/` oferece o editor, mas as revisões exigem a rota local.

A [spec](SPEC.md) descreve o percurso. Verificação com `npm test` e `npm run build`.

## GitHub Pages

O comando `npm run build:pages` gera o site em `dist-pages/` para o caminho `/mathutando/`. Publica-se o conteúdo dessa pasta na raiz da branch `gh-pages`. O editor público guarda o histórico no browser. As revisões com IA estão disponíveis na aplicação local.
