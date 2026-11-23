import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, BookMarked, Check, CheckCircle2, ChevronRight, CircleHelp, GraduationCap, Lightbulb, LockKeyhole, RotateCcw, Sparkles, Target, Trophy, X } from 'lucide-react';
import { ChoiceBoard } from './components/ChoiceBoard';
import { ScenarioCard } from './components/ScenarioCard';
import { Math as MathFormula } from './components/Math';
import { parseNumericAnswer, matchesExpectedAnswer } from './lib/answers';
import { challengeScenario, guidedScenario, guidedSteps, practiceScenario, practiceSteps } from './content/probabilities';
import type { Option, Step } from './content/probabilities';

type Phase = 'guided' | 'practice' | 'challenge' | 'complete';
type Progress = { phase: Phase; guidedIndex: number; practiceIndex: number; mistakes: number; mistakesByConcept: Record<string, number> };
const STORAGE_KEY = 'matematica-poc-v1';
const initialProgress: Progress = { phase: 'guided', guidedIndex: 0, practiceIndex: 0, mistakes: 0, mistakesByConcept: {} };

function loadProgress(): Progress {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return initialProgress;
    const data: Partial<Progress> = JSON.parse(saved);
    if (!['guided','practice','challenge','complete'].includes(data.phase ?? '')) return initialProgress;
    return { ...initialProgress, ...data, guidedIndex: Math.min(3, Math.max(0, data.guidedIndex ?? 0)), practiceIndex: Math.min(2, Math.max(0, data.practiceIndex ?? 0)) };
  } catch { return initialProgress; }
}

const phaseLabels = { guided: 'Aprender', practice: 'Praticar', challenge: 'Demonstrar', complete: 'Concluído' };

export function App() {
  const [progress, setProgress] = useState<Progress>(loadProgress);
  const [selectedCorrect, setSelectedCorrect] = useState<Option | null>(null);
  const [incorrect, setIncorrect] = useState('');
  const [hint, setHint] = useState(0);
  const [challengeAnswer, setChallengeAnswer] = useState('');
  const [challengeFeedback, setChallengeFeedback] = useState('');
  const [showChallengeHint, setShowChallengeHint] = useState(false);
  const [showReset, setShowReset] = useState(false);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); }, [progress]);

  const phase = progress.phase;
  const steps = phase === 'practice' ? practiceSteps : guidedSteps;
  const currentIndex = phase === 'practice' ? progress.practiceIndex : progress.guidedIndex;
  const step: Step | undefined = (phase === 'guided' || phase === 'practice') ? steps[currentIndex] : undefined;
  const scenario = phase === 'guided' ? guidedScenario : phase === 'practice' ? practiceScenario : challengeScenario;
  const completedTotal = phase === 'guided' ? progress.guidedIndex : phase === 'practice' ? 3 + progress.practiceIndex : phase === 'challenge' ? 5 : 6;

  function choose(id: string) {
    if (!step || selectedCorrect) return;
    const option = step.options.find(x => x.id === id);
    if (!option) return;
    if (id === step.correctId) {
      setSelectedCorrect(option);
      setIncorrect('');
    } else {
      setIncorrect(option.feedback ?? 'Essa resposta ainda não corresponde ao que o problema pede. Lê a condição novamente.');
      setProgress(p => ({ ...p, mistakes: p.mistakes + 1, mistakesByConcept: { ...p.mistakesByConcept, [step.id]: (p.mistakesByConcept[step.id] ?? 0) + 1 } }));
    }
  }

  function continueStep() {
    setSelectedCorrect(null); setIncorrect(''); setHint(0);
    if (phase === 'guided') {
      if (progress.guidedIndex === guidedSteps.length - 1) setProgress(p => ({ ...p, phase: 'practice', guidedIndex: guidedSteps.length }));
      else setProgress(p => ({ ...p, guidedIndex: p.guidedIndex + 1 }));
    } else if (phase === 'practice') {
      if (progress.practiceIndex === practiceSteps.length - 1) setProgress(p => ({ ...p, phase: 'challenge', practiceIndex: practiceSteps.length }));
      else setProgress(p => ({ ...p, practiceIndex: p.practiceIndex + 1 }));
    }
  }

  function submitChallenge(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const answer = parseNumericAnswer(challengeAnswer);
    if (answer === null || !Number.isFinite(answer)) { setChallengeFeedback('Escreve uma fração (por exemplo, 3/8), um decimal (0,375) ou uma percentagem (37,5%).'); return; }
    if (matchesExpectedAnswer(challengeAnswer, 9 / 25)) { setProgress(p => ({ ...p, phase: 'complete' })); setChallengeFeedback(''); return; }
    let feedback = 'Repara na condição: a escolha é feita apenas entre os alunos inscritos no clube.';
    if (Math.abs(answer - 9 / 40) < 0.0001) feedback = 'O numerador está certo, mas 40 é o total da escola. A condição restringe o denominador.';
    else if (Math.abs(answer - 16 / 25) < 0.0001) feedback = 'Esse resultado seria a probabilidade de ser rapariga, não rapaz, entre os inscritos.';
    else if (Math.abs(answer - 25 / 9) < 0.0001) feedback = 'Inverteste a fração. Os casos favoráveis ficam no numerador.';
    setChallengeFeedback(feedback);
    setProgress(p => ({ ...p, mistakes: p.mistakes + 1, mistakesByConcept: { ...p.mistakesByConcept, challenge: (p.mistakesByConcept.challenge ?? 0) + 1 } }));
  }

  function reset() {
    setProgress(initialProgress); setSelectedCorrect(null); setIncorrect(''); setHint(0); setChallengeAnswer(''); setChallengeFeedback(''); setShowChallengeHint(false); setShowReset(false);
  }

  return (
    <div className="app-shell">
      <header className="topbar"><div className="topbar-inner">
        <a href="#inicio" className="brand" aria-label="Mathutando — início"><span className="brand-mark">∑</span><span>mathutando<span className="brand-period">.</span></span></a>
        <div className="topbar-right"><span className="demo-tag"><span className="demo-dot"/> PROTÓTIPO 01</span><button className="small-reset" onClick={() => setShowReset(true)} type="button"><RotateCcw size={15}/> <span>Recomeçar</span></button></div>
      </div></header>
      <main id="inicio" className="main-layout">
        <aside className="sidebar">
          <div className="sidebar-label">A TUA APRENDIZAGEM</div>
          <div className="course-head"><span className="course-icon">%</span><div><strong>Probabilidades</strong><small>Matemática A · Módulo 01</small></div></div>
          <nav aria-label="Fases da aprendizagem" className="course-nav">
            <div className={`course-link ${phase==='guided'?'is-active':completedTotal>=3?'is-complete':''}`}><span className="nav-number">{completedTotal>=3?<Check size={15}/>: '01'}</span><span><strong>Aprender</strong><small>Resolução guiada</small></span>{phase==='guided'&&<span className="active-pip"/>}</div>
            <div className={`course-link ${phase==='practice'?'is-active':completedTotal>=5?'is-complete':''}`}><span className="nav-number">{completedTotal>=5?<Check size={15}/>:completedTotal<3?<LockKeyhole size={14}/>: '02'}</span><span><strong>Praticar</strong><small>Menos ajuda</small></span>{phase==='practice'&&<span className="active-pip"/>}</div>
            <div className={`course-link ${phase==='challenge'?'is-active':phase==='complete'?'is-complete':''}`}><span className="nav-number">{phase==='complete'?<Check size={15}/>:completedTotal<5?<LockKeyhole size={14}/>: '03'}</span><span><strong>Demonstrar</strong><small>Resolução autónoma</small></span>{phase==='challenge'&&<span className="active-pip"/>}</div>
          </nav>
          <div className="sidebar-bottom"><div className="mini-icon"><Target size={18}/></div><strong>O objetivo não é adivinhar.</strong><p>É perceber por que razão uma resposta está certa — ou errada.</p></div>
        </aside>
        <div className="workspace">
          <div className="breadcrumb">MATEMÁTICA A <ChevronRight size={13}/> PROBABILIDADES <ChevronRight size={13}/> <span>CONDICIONADA</span></div>
          <section className="intro-section"><div className="intro-copy"><div className="chapter-label"><span className="chapter-dot"/> LIÇÃO INTERATIVA · 5 MIN</div><h1>Probabilidade<br/><em>condicionada.</em></h1><p>Aprende a escolher o universo certo, uma decisão de cada vez.</p></div><div className="intro-badge" aria-hidden="true"><div className="orbit orbit-a"/><div className="orbit orbit-b"/><span>P(A|B)</span></div></section>
          <div className="progress-panel"><div className="progress-copy"><span>O TEU PROGRESSO</span><strong>{completedTotal} de 6 etapas</strong></div><div className="progress-track"><span style={{ width: `${completedTotal / 6 * 100}%` }} /></div><span className="progress-percent">{Math.round(completedTotal/6*100)}%</span></div>
          {phase==='complete' ? <section className="complete-card"><div className="complete-icon"><Trophy size={33}/></div><div className="eyebrow">MISSÃO CUMPRIDA</div><h2>Conseguiste resolver sozinho.</h2><p>Já usaste o raciocínio de probabilidades condicionadas em três contextos diferentes. A próxima etapa é repetir com problemas novos para confirmar que o conceito ficou sólido.</p><div className="complete-equation"><MathFormula value={String.raw`P(\text{Rapaz}\mid\text{Música})=\frac{9}{25}=0{,}36`} display /></div><div className="summary-metrics"><div><strong>6/6</strong><small>Etapas concluídas</small></div><div><strong>{progress.mistakes}</strong><small>Tentativas para aprender</small></div></div><button type="button" className="primary-action" onClick={reset}><RotateCcw size={17}/> Repetir experiência</button></section> : <>
            <div className="phase-section-title"><span className="phase-badge">{phase==='guided'?<BookMarked size={15}/>:phase==='practice'?<Sparkles size={15}/>:<GraduationCap size={15}/>} {phaseLabels[phase]}</span><span>{phase==='guided'?'Vamos resolver juntos':phase==='practice'?'Novo problema, menos pistas':'Sem opções. Só tu e o problema.'}</span></div>
            <ScenarioCard scenario={scenario}/>
            {step ? <section className="step-card" key={step.id}>
              <div className="step-header"><div><div className="step-number">ETAPA {currentIndex+1} DE {steps.length} <span>·</span> {step.eyebrow}</div><h2>{step.prompt}</h2><p>{step.detail}</p></div><div className="step-symbol"><CircleHelp size={23}/></div></div>
              <ChoiceBoard options={step.options} slotLabel={step.slotLabel} correct={selectedCorrect ?? undefined} disabled={Boolean(selectedCorrect)} onSelect={choose}/>
              {incorrect && !selectedCorrect && <div className="feedback feedback-wrong" role="status"><div className="feedback-heading"><Lightbulb size={18}/> Boa tentativa. Olha para isto:</div><p>{incorrect}</p></div>}
              {selectedCorrect && <div className="feedback feedback-correct" role="status"><div className="feedback-heading"><CheckCircle2 size={19}/> Boa! É isso mesmo.</div><p>{step.explanation}</p></div>}
              {hint>0 && !selectedCorrect && <div className="hint-box" role="status"><span>PISTA {hint}</span><p>{step.hints[hint-1]}</p></div>}
              <div className="step-footer"><button type="button" className="hint-button" disabled={hint >= step.hints.length || Boolean(selectedCorrect)} onClick={() => setHint(h => Math.min(step.hints.length, h+1))}><Lightbulb size={17}/>{hint===0?'Preciso de uma pista':hint>=step.hints.length?'Já viste todas as pistas':'Outra pista'}</button><button type="button" className="primary-action" disabled={!selectedCorrect} onClick={continueStep}>{currentIndex===steps.length-1?'Avançar de fase':'Continuar'}<ArrowRight size={17}/></button></div>
            </section> : <section className="step-card challenge-card"><div className="step-number">DESAFIO FINAL · SEM ESCOLHA MÚLTIPLA</div><h2>Agora és tu a resolver.</h2><p>Qual é a probabilidade de o aluno ser rapaz, sabendo que está no clube de música?</p><form className="answer-form" onSubmit={submitChallenge}><label htmlFor="challenge-answer">A tua resposta</label><div className="answer-row"><input id="challenge-answer" value={challengeAnswer} onChange={e=>{setChallengeAnswer(e.target.value);setChallengeFeedback('')}} placeholder="Ex.: 3/8, 0,375 ou 37,5%" inputMode="text" autoComplete="off"/><button className="primary-action" type="submit">Verificar <ArrowRight size={17}/></button></div></form>
              {challengeFeedback && <div className="feedback feedback-wrong" role="status"><div className="feedback-heading"><Lightbulb size={18}/> Vamos rever uma coisa</div><p>{challengeFeedback}</p></div>}
              {showChallengeHint && <div className="hint-box" role="status"><span>PISTA</span><p>Há 25 alunos inscritos. Quantos deles são rapazes? Divide esse número por 25.</p></div>}
              <div className="step-footer challenge-footer"><button className="hint-button" type="button" disabled={showChallengeHint} onClick={()=>setShowChallengeHint(true)}><Lightbulb size={17}/> {showChallengeHint?'Pista apresentada':'Pedir uma pista'}</button><span className="help-text">Aceitamos fração, decimal ou percentagem.</span></div>
            </section>}
            <div className="after-lesson"><div><Sparkles size={17}/><strong>Porque é que aprendemos assim?</strong></div><p>Em vez de te mostrar logo a resolução, pedimos-te decisões. Quando erras, explicamos o raciocínio. No fim, tens um problema novo para resolver sem alternativas.</p></div>
          </>}
          <footer className="footer"><span>mathutando <span>feito para aprender, não para decorar.</span></span><span>POC · Guardado neste dispositivo</span></footer>
        </div>
      </main>
      {showReset && <div className="modal-backdrop" role="presentation" onClick={()=>setShowReset(false)}><div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="reset-title" onClick={e=>e.stopPropagation()}><button className="modal-x" type="button" aria-label="Fechar" onClick={()=>setShowReset(false)}><X size={20}/></button><div className="modal-icon"><RotateCcw size={22}/></div><h2 id="reset-title">Recomeçar a lição?</h2><p>Vais apagar o progresso guardado neste dispositivo e voltar à primeira etapa.</p><div className="modal-buttons"><button type="button" className="secondary-action" onClick={()=>setShowReset(false)}><ArrowLeft size={16}/> Cancelar</button><button type="button" className="primary-action" onClick={reset}>Sim, recomeçar</button></div></div></div>}
    </div>
  );
}
