export type Option = {
  id: string;
  label: string;
  math?: string;
  /** Explanation shown only if this particular distractor is chosen. */
  feedback?: string;
};

export type Step = {
  id: string;
  eyebrow: string;
  prompt: string;
  detail: string;
  slotLabel: string;
  options: Option[];
  correctId: string;
  explanation: string;
  hints: string[];
};

export type Scenario = {
  title: string;
  introduction: string;
  condition: string;
  headers: [string, string];
  rows: { name: string; yes: number; no: number }[];
};

export const guidedScenario: Scenario = {
  title: 'Quem pratica desporto?',
  introduction: 'Numa turma existem 30 alunos: 18 raparigas e 12 rapazes. Praticam desporto 10 raparigas e 4 rapazes.',
  condition: 'Sabendo que o aluno escolhido pratica desporto, qual é a probabilidade de ser rapariga?',
  headers: ['Pratica desporto', 'Não pratica'],
  rows: [
    { name: 'Raparigas', yes: 10, no: 8 },
    { name: 'Rapazes', yes: 4, no: 8 },
  ],
};

export const guidedSteps: Step[] = [
  {
    id: 'reference', eyebrow: 'Identificar o universo',
    prompt: 'Qual é o grupo de referência?',
    detail: 'A expressão «sabendo que» diz-te que estás a olhar apenas para um subconjunto da turma.',
    slotLabel: 'Grupo de referência', correctId: 'athletes',
    options: [
      { id: 'all', label: 'Os 30 alunos da turma', feedback: 'Os 30 incluem alunos que não praticam desporto. Repara no «sabendo que».' },
      { id: 'girls', label: 'As 18 raparigas', feedback: 'Queremos raparigas, mas primeiro temos de escolher o grupo onde vamos procurar.' },
      { id: 'athletes', label: 'Os 14 alunos que praticam desporto' },
      { id: 'boys', label: 'Os 12 rapazes', feedback: 'Não estamos a restringir a escolha aos rapazes, mas sim a quem pratica desporto.' },
    ],
    explanation: 'A condição «pratica desporto» restringe o nosso universo aos 10 + 4 = 14 praticantes.',
    hints: ['Que alunos deixam de contar por causa de «sabendo que»?', 'Conta as raparigas e os rapazes que praticam desporto.'],
  },
  {
    id: 'favorable', eyebrow: 'Contar os casos favoráveis',
    prompt: 'Dentro desse grupo, quantas raparigas existem?',
    detail: 'Já sabemos que só contamos os alunos que praticam desporto.',
    slotLabel: 'Casos favoráveis', correctId: 'ten',
    options: [
      { id: 'eighteen', label: '18 raparigas', feedback: '18 é o número total de raparigas, incluindo as que não praticam desporto.' },
      { id: 'ten', label: '10 raparigas' },
      { id: 'fourteen', label: '14 alunos', feedback: '14 é o universo de referência. Quantos desses 14 são raparigas?' },
      { id: 'four', label: '4 rapazes', feedback: 'Esses são os rapazes praticantes. A pergunta é sobre raparigas.' },
    ],
    explanation: 'Há 10 raparigas entre os 14 alunos que praticam desporto.',
    hints: ['Consulta a célula «Raparigas × Pratica desporto» da tabela.', 'Os casos favoráveis são raparigas que também praticam desporto.'],
  },
  {
    id: 'calculate', eyebrow: 'Construir a probabilidade',
    prompt: 'Qual das expressões calcula a probabilidade pedida?',
    detail: 'Divide os casos favoráveis pelos casos possíveis dentro do grupo condicionado.',
    slotLabel: 'Expressão da probabilidade', correctId: 'correct',
    options: [
      { id: 'all', label: '10 / 30', math: String.raw`\frac{10}{30}`, feedback: 'Usaste toda a turma no denominador. A condição faz com que consideremos menos alunos.' },
      { id: 'girls', label: '18 / 30', math: String.raw`\frac{18}{30}`, feedback: 'Essa fração ignora a condição de que o aluno pratica desporto.' },
      { id: 'reverse', label: '14 / 30', math: String.raw`\frac{14}{30}`, feedback: 'Calculaste a probabilidade de praticar desporto, não a de ser rapariga entre os praticantes.' },
      { id: 'correct', label: '10 / 14', math: String.raw`\frac{10}{14}` },
    ],
    explanation: 'P(Rapariga | Desporto) = 10/14 = 5/7, aproximadamente 71,4%.',
    hints: ['O numerador são os casos favoráveis. O denominador é o grupo de referência.', 'Recupera os dois números descobertos nas etapas anteriores.'],
  },
];

export const practiceScenario: Scenario = {
  title: 'Quem vai de bicicleta?',
  introduction: 'Num grupo de 28 estudantes, 16 vão para a escola de bicicleta: 6 raparigas e 10 rapazes.',
  condition: 'Sabendo que um estudante vai de bicicleta, qual é a probabilidade de ser rapariga?',
  headers: ['Vai de bicicleta', 'Não vai'],
  rows: [{ name: 'Raparigas', yes: 6, no: 6 }, { name: 'Rapazes', yes: 10, no: 6 }],
};

export const practiceSteps: Step[] = [
  {
    id: 'practice-reference', eyebrow: 'Menos ajuda',
    prompt: 'Quantos alunos fazem parte do novo grupo de referência?',
    detail: 'Desta vez não mostramos a explicação antecipadamente.',
    slotLabel: 'Total condicionado', correctId: '16',
    options: [
      { id: '28', label: '28', feedback: '28 inclui alunos que não vão de bicicleta.' },
      { id: '12', label: '12', feedback: 'Este número não corresponde a quem vai de bicicleta.' },
      { id: '16', label: '16' },
      { id: '6', label: '6', feedback: '6 é o número de raparigas ciclistas, não o total.' },
    ],
    explanation: 'Entre os 28 estudantes, apenas 16 cumprem a condição.',
    hints: ['Lê novamente o que vem depois de «sabendo que».'],
  },
  {
    id: 'practice-formula', eyebrow: 'Aplicar o raciocínio',
    prompt: 'Completa a probabilidade condicionada.',
    detail: 'Agora escolhe a fração sem que te mostremos a fórmula.',
    slotLabel: 'Probabilidade', correctId: '6-16',
    options: [
      { id: '6-28', label: '6 / 28', math: String.raw`\frac{6}{28}`, feedback: 'O denominador deve refletir a condição.' },
      { id: '12-28', label: '12 / 28', math: String.raw`\frac{12}{28}`, feedback: 'Estás a usar o total de raparigas da turma.' },
      { id: '6-16', label: '6 / 16', math: String.raw`\frac{6}{16}` },
      { id: '16-6', label: '16 / 6', math: String.raw`\frac{16}{6}`, feedback: 'Inverteste os papéis do universo e dos casos favoráveis.' },
    ],
    explanation: 'P(Rapariga | Bicicleta) = 6/16 = 3/8 = 37,5%.',
    hints: ['Quantas raparigas estão entre os 16 estudantes que vão de bicicleta?'],
  },
];

export const challengeScenario: Scenario = {
  title: 'O clube de música',
  introduction: 'Numa escola há 40 alunos. No clube de música estão inscritos 16 raparigas e 9 rapazes. Os restantes 8 raparigas e 7 rapazes não estão inscritos.',
  condition: 'Sabendo que um aluno está inscrito no clube de música, qual é a probabilidade de ser rapaz?',
  headers: ['Inscrito', 'Não inscrito'],
  rows: [{ name: 'Raparigas', yes: 16, no: 8 }, { name: 'Rapazes', yes: 9, no: 7 }],
};
