import katex from 'katex';
import 'katex/dist/katex.min.css';

export function Math({ value, display = false }: { value: string; display?: boolean }) {
  const html = katex.renderToString(value, { throwOnError: false, displayMode: display });
  return <span className={display ? 'math-display' : 'math-inline'} dangerouslySetInnerHTML={{ __html: html }} />;
}
