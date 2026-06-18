import './RenjuHelpContent.css'

function MiniPattern({ label, forbidden }: { label: string; forbidden?: boolean }) {
  return (
    <figure className="renju-help__figure">
      <svg viewBox="0 0 80 24" className="renju-help__svg" aria-hidden>
        <rect width="80" height="24" fill="#d4a24c" rx="2" />
        <line x1="0" y1="12" x2="80" y2="12" stroke="#3e2723" strokeWidth="0.5" />
        {[16, 32, 48, 64].map((cx) => (
          <g key={cx}>
            <line x1={cx} y1="0" x2={cx} y2="24" stroke="#3e2723" strokeWidth="0.5" />
          </g>
        ))}
        <circle cx="24" cy="12" r="4" fill="#1a1a1a" />
        <circle cx="32" cy="12" r="4" fill="#1a1a1a" />
        <circle cx="40" cy="12" r="4" fill="#1a1a1a" />
        {forbidden && (
          <>
            <circle cx="48" cy="12" r="4" fill="none" stroke="#e53935" strokeWidth="1" strokeDasharray="2 1" />
            <text x="48" y="14" textAnchor="middle" fill="#e53935" fontSize="6">
              X
            </text>
          </>
        )}
      </svg>
      <figcaption>{label}</figcaption>
    </figure>
  )
}

export function RenjuHelpContent() {
  return (
    <div className="renju-help">
      <p className="renju-help__lead">렌주룰에서 <strong>흑만</strong> 금수가 적용됩니다. 백은 제한이 없습니다.</p>

      <section className="renju-help__section">
        <h4>3-3 금수</h4>
        <p>한 수로 <em>活三</em>이 두 개 이상 동시에 생기면 금수입니다.</p>
        <MiniPattern label="양쪽 열린 3이 2개 — 금수" forbidden />
      </section>

      <section className="renju-help__section">
        <h4>4-4 금수</h4>
        <p>한 수로 5목 가능한 四가 두 방향 이상 생기면 금수입니다.</p>
      </section>

      <section className="renju-help__section">
        <h4>장목 금수</h4>
        <p>6목 이상 연속은 금수입니다. 정확히 5목은 승리 수로 허용됩니다.</p>
      </section>

      <section className="renju-help__section">
        <h4>판 위 표시</h4>
        <p>빨간 × 는 흑이 둘 수 없는 칸입니다. 5목 승리 수는 금수가 아닙니다.</p>
      </section>
    </div>
  )
}
