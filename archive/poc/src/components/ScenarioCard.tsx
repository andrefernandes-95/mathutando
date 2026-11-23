import { BookOpen, Sparkles } from 'lucide-react';
import type { Scenario } from '../content/probabilities';

export function ScenarioCard({ scenario }: { scenario: Scenario }) {
  const totals = scenario.rows.reduce((s, row) => ({ yes: s.yes + row.yes, no: s.no + row.no }), { yes: 0, no: 0 });
  return (
    <section className="scenario-card" aria-labelledby="scenario-title">
      <div className="scenario-top"><span className="eyebrow"><BookOpen size={15} /> ENUNCIADO</span><span className="scenario-tag"><Sparkles size={12} /> Lê com atenção</span></div>
      <h2 id="scenario-title">{scenario.title}</h2>
      <p>{scenario.introduction}</p>
      <div className="table-wrapper"><table className="data-table"><thead><tr><th scope="col">Turma</th>{scenario.headers.map(x=><th scope="col" key={x}>{x}</th>)}<th scope="col">Total</th></tr></thead><tbody>
        {scenario.rows.map(row=><tr key={row.name}><th scope="row">{row.name}</th><td className="focus-cell">{row.yes}</td><td>{row.no}</td><td>{row.yes+row.no}</td></tr>)}
        <tr className="totals"><th scope="row">Total</th><td>{totals.yes}</td><td>{totals.no}</td><td>{totals.yes+totals.no}</td></tr>
      </tbody></table></div>
      <div className="scenario-question"><span className="question-dot">?</span><strong>{scenario.condition}</strong></div>
    </section>
  );
}
