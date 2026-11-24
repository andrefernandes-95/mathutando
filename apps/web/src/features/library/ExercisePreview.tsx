import { lazy, Suspense } from 'react';
import type { ExerciseDefinition } from '@mathutando/contracts';

const MathFormula = lazy(() => import('./MathFormula'));

export function ExercisePreview({ definition }: { definition: ExerciseDefinition }) {
  return (
    <>
      {definition.content.length > 0 && (
        <section className="exercise-statement" aria-labelledby="statement-title">
          <h2 id="statement-title">Enunciado</h2>
          <div className="read-blocks">
            {definition.content.map((block, index) => block.type === 'paragraph' ? (
              <p key={index}>{block.text}</p>
            ) : (
              <div key={index}>
                <Suspense fallback={<span>A carregar expressão…</span>}>
                  <MathFormula latex={block.latex} />
                </Suspense>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="exercise-steps" aria-labelledby="steps-title">
        <div className="steps-heading">
          <h2 id="steps-title">Etapas</h2>
          <p>Pré-visualização. Ainda não é possível responder.</p>
        </div>
        <ol className="step-list">
          {definition.steps.map((step, index) => (
            <li key={step.id} className="step-preview">
              <span className="step-number" aria-hidden="true">{index + 1}</span>
              <div className="step-content">
                <h3><span className="sr-only">Etapa {index + 1}: </span>{step.title}</h3>
                <p>{step.interaction.prompt}</p>
                {step.interaction.type === 'single-choice' ? (
                  <ol className="option-preview" type="A" aria-label="Opções de resposta">
                    {step.interaction.options.map(option => <li key={option.id}>{option.label}</li>)}
                  </ol>
                ) : (
                  <p className="answer-format">Resposta numérica</p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
