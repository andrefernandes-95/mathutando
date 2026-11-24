import katex from 'katex';
import 'katex/dist/katex.min.css';

export default function MathFormula({ latex }: { latex: string }) {
  const html = katex.renderToString(latex, { throwOnError: false, trust: false, output: 'htmlAndMathml' });
  return <span className="math-formula" dangerouslySetInnerHTML={{ __html: html }} />;
}
