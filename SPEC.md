# Mathutando · Resolver à mão, rever com IA

## Experiência

1. **Ecrã inicial.** O histórico permite retomar um exercício. **+ New Exercise** abre um novo a partir de uma imagem carregada ou colada, ou de texto colado como enunciado.
2. **Resolução.** O aluno desenha livremente com caneta, dedo ou rato e corrige com a borracha. O rascunho é guardado automaticamente. No telemóvel, alternar entre **Enunciado** e **Resolução** preserva a posição e a escala da folha. No PC, o enunciado pode ficar ao lado.
3. **Gestos.** Com a caneta em contacto, a folha ignora a palma. Com um dedo, desenha-se. Com dois, desloca-se a folha sem deixar traços. No PC, Espaço + arrastar desloca a vista.
4. **Pedir revisão.** Só esta ação envia à IA o enunciado original, incluindo a imagem, e uma versão imutável do desenho completo, mesmo com contas fora do ecrã. O aluno pode continuar a escrever. Na primeira revisão bem-sucedida, a IA propõe um nome para o exercício a partir do enunciado.
5. **Feedback.** Cada revisão fica na timeline do exercício, com o desenho enviado, comentários localizados que explicam o erro sem revelar a resposta. Tocar num marcador abre o comentário junto da conta. A âncora acompanha o desenho durante o pan e o zoom.

## Revisão na folha

O botão **Pedir revisão** mostra um spinner durante todo o pedido. A folha continua editável. **Ocultar revisão** esconde os marcadores e o comentário aberto. A timeline compacta por baixo do enunciado dá acesso às versões guardadas e permite voltar ao desenho atual.

O browser guarda exercícios, traços e versões em localStorage. Ao pedir revisão, uma rota no processo local envia o enunciado e os recortes à OpenAI. A chave do projeto fica nesse processo.
