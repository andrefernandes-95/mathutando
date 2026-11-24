# Instruções de engenharia

A [especificação do produto](SPEC.md) orienta as decisões de produto. Consultar as [regras de design](docs/design-rules.md) nas alterações à experiência do aluno.

- Separar edição, gestão de exercícios, revisão pedagógica e persistência pelas respetivas responsabilidades. Manter o ponto de entrada da interface dedicado à composição.
- Modelar as regras e transições como lógica de domínio testável de forma independente. Colocar rede, base de dados, relógio e fornecedor de IA nas fronteiras que os usam.
- Preservar os contratos de leitura das versões existentes. Testar os efeitos de repetição, falha a meio, reinício e respostas fora de ordem.
- Validar entradas externas na fronteira. Guardar o trabalho em localStorage e manter as credenciais da OpenAI exclusivamente no processo local, fora do browser e dos ficheiros publicados. Garantir que os exemplos de teste e os logs preservam a privacidade dos exercícios.
- Preferir funções com uma responsabilidade, interfaces pequenas e nomes do domínio. Introduzir abstrações quando sustentarem uma necessidade concreta.
- Usar português de Portugal na interface. Verificar fluxos de escrita e revisão através da entrada normal do produto e testar a interação tátil no dispositivo de referência.
