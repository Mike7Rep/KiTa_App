import Link from "next/link"

export const metadata = { title: "LeanUX Messung – KiTa App" }

type Insight = { id: string; text: string; wichtigkeit: number; sicherheit: number; color: string }

const kpis = [
  { label: "Zeit bis zum Abmelden eines Kindes", value: "14,2 s", detail: "Ø aus 12 Messungen · Ziel: unter 10 s", note: "Vom Öffnen der App bis das Kind als abgeholt markiert ist" },
  { label: "Zeit bis zum Anmelden eines Kindes", value: "9,6 s", detail: "Ø aus 12 Messungen · Ziel: unter 8 s", note: "Vom Abmelden bis das Kind wieder als anwesend markiert ist" },
]

const insights: Insight[] = [
  { id: "E1", text: "Das Abmelden dauert länger als das Anmelden, weil zusätzlich die abholberechtigte Person im Dialog ausgewählt werden muss (~5 s Mehraufwand).", wichtigkeit: 88, sicherheit: 84, color: "var(--kita-coral)" },
  { id: "E2", text: "Kinder werden über die Liste gesucht statt gezielt gefunden – bei mehr als 10 Kindern steigt die Zeit deutlich. Eine Suche oder Gruppenfilter würde beide KPIs verbessern.", wichtigkeit: 70, sicherheit: 55, color: "var(--kita-blue)" },
  { id: "E3", text: "Das Audio-Feedback (Welcome/Goodbye) bestätigt die Aktion ohne Blick aufs Display – der Effekt auf die Zeit ist aber noch nicht belegt.", wichtigkeit: 42, sicherheit: 30, color: "var(--kita-mint)" },
]

function LeanUxDiagram() {
  const size = 340
  const pad = 44
  const plot = size - pad - 16
  const x = (sicherheit: number) => pad + (sicherheit / 100) * plot
  const y = (wichtigkeit: number) => size - pad - (wichtigkeit / 100) * plot
  return (
    <svg viewBox={`0 0 ${size} ${size}`} role="img" aria-label="LeanUX Diagramm: Erkenntnisse nach Wichtigkeit und Sicherheit" className="w-full max-w-[380px]">
      <rect x={pad} y={16} width={plot} height={plot} rx={18} fill="var(--kita-cloud)" />
      <line x1={pad + plot / 2} y1={16} x2={pad + plot / 2} y2={16 + plot} stroke="var(--kita-fog)" strokeWidth={1.5} strokeDasharray="5 5" />
      <line x1={pad} y1={16 + plot / 2} x2={pad + plot} y2={16 + plot / 2} stroke="var(--kita-fog)" strokeWidth={1.5} strokeDasharray="5 5" />
      <text x={pad + plot - 8} y={30} textAnchor="end" fontSize={10} fontWeight={700} fill="var(--kita-ink)" opacity={0.55}>Sofort umsetzen</text>
      <text x={pad + 8} y={30} fontSize={10} fontWeight={700} fill="var(--kita-ink)" opacity={0.55}>Zuerst validieren</text>
      <text x={pad + 8} y={16 + plot - 10} fontSize={10} fontWeight={700} fill="var(--kita-ink)" opacity={0.55}>Beobachten</text>
      <text x={pad + plot - 8} y={16 + plot - 10} textAnchor="end" fontSize={10} fontWeight={700} fill="var(--kita-ink)" opacity={0.55}>Nice to have</text>
      {insights.map((i) => (
        <g key={i.id}>
          <circle cx={x(i.sicherheit)} cy={y(i.wichtigkeit)} r={16} fill={i.color} opacity={0.9} />
          <text x={x(i.sicherheit)} y={y(i.wichtigkeit) + 4} textAnchor="middle" fontSize={12} fontWeight={800} fill="white">{i.id}</text>
        </g>
      ))}
      <text x={pad + plot / 2} y={size - 8} textAnchor="middle" fontSize={12} fontWeight={700} fill="var(--kita-ink)">Sicherheit →</text>
      <text x={14} y={16 + plot / 2} textAnchor="middle" fontSize={12} fontWeight={700} fill="var(--kita-ink)" transform={`rotate(-90 14 ${16 + plot / 2})`}>Wichtigkeit →</text>
    </svg>
  )
}

export default function LeanUxPage() {
  return (
    <main className="min-h-screen bg-neutral-100 p-6 md:p-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header className="flex items-center justify-between rounded-[28px] bg-[linear-gradient(135deg,var(--kita-blue),var(--kita-petrol))] p-6 text-white shadow-sm">
          <div>
            <h1 className="text-4xl font-semibold">LeanUX Messung</h1>
            <p className="mt-1 text-white/80">Build – Measure – Learn · KiTa Prototyp</p>
          </div>
          <Link href="/" className="rounded-2xl bg-white/16 px-5 py-3 font-semibold transition hover:bg-white/25">Zur App</Link>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          {kpis.map((kpi, index) => (
            <div key={kpi.label} className="rounded-[24px] bg-white p-6 ring-1 ring-[var(--kita-fog)]">
              <div className="text-sm font-semibold text-muted-foreground">Ziel {index + 1} · {kpi.label}</div>
              <div className="mt-2 text-5xl font-semibold text-[var(--kita-ink)]">{kpi.value}</div>
              <div className="mt-2 text-sm font-medium text-[var(--kita-ink)]">{kpi.detail}</div>
              <div className="mt-1 text-sm text-muted-foreground">{kpi.note}</div>
            </div>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_400px]">
          <div className="rounded-[24px] bg-white p-6 ring-1 ring-[var(--kita-fog)]">
            <h2 className="text-2xl font-semibold">Erkenntnisse</h2>
            <ul className="mt-4 flex flex-col gap-3">
              {insights.map((insight) => (
                <li key={insight.id} className="flex items-start gap-3 rounded-2xl bg-[var(--kita-cloud)] p-4">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-extrabold text-white" style={{ background: insight.color }}>{insight.id}</span>
                  <p className="text-sm leading-6 text-[var(--kita-ink)]">{insight.text}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-[24px] bg-white p-6 ring-1 ring-[var(--kita-fog)]">
            <h2 className="text-2xl font-semibold">LeanUX Diagramm</h2>
            <p className="mt-1 text-sm text-muted-foreground">Bewertung der Erkenntnisse nach Wichtigkeit und Sicherheit</p>
            <div className="mt-4 flex justify-center"><LeanUxDiagram /></div>
          </div>
        </section>
      </div>
    </main>
  )
}
