export function LibraryMasthead() {
  return (
    <header className="library-masthead">
      <div className="masthead-copy">
        <p className="subject-label">Matemática A</p>
        <h1 tabIndex={-1}>Biblioteca de exercícios</h1>
      </div>

      <figure className="math-figure">
        <svg viewBox="0 0 292 151" fill="none" role="img" aria-label="De zero a um, a curva y igual a x ao quadrado fica abaixo da reta y igual a x e coincide com ela nos extremos.">
          <g className="figure-grid">
            <path d="M32 18V126M58 18V126M84 18V126M110 18V126M136 18V126M162 18V126M188 18V126M214 18V126M240 18V126" />
            <path d="M32 18H240M32 45H240M32 72H240M32 99H240M32 126H240" />
          </g>
          <path className="figure-fill" d="M32 126L240 18Q136 126 32 126Z" />
          <path className="figure-axes" d="M24 126H252M32 133V11M240 126V131M27 18H32" />
          <path className="figure-line" d="M32 126L240 18" />
          <path className="figure-parabola" d="M32 126Q136 126 240 18" />
          <circle className="figure-point" cx="240" cy="18" r="3.5" />
          <text x="26" y="143">0</text>
          <text x="237" y="143">1</text>
          <text x="15" y="22">1</text>
          <text className="figure-line-label" x="135" y="54">y = x</text>
          <text className="figure-parabola-label" x="190" y="102">y = x²</text>
        </svg>
      </figure>
    </header>
  );
}
