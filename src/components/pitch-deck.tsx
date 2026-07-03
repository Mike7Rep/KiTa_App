"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Bot, ClipboardCheck, Images, Presentation, Sparkles, WandSparkles } from "lucide-react"
import { cn } from "@/lib/utils"

const slideCount = 5

type PitchSlide = {
  eyebrow: string
  title: string
  kicker?: string
  icon: React.ElementType
  accent: string
  body: React.ReactNode
}

const developmentImages = [
  { src: "/pitch/early-dashboard.png", alt: "Früher KiTa-Kompass Dashboard-Entwurf", label: "Erste Struktur" },
  { src: "/pitch/color-concept.png", alt: "Farbkonzept der KiTa App", label: "Visuelle Sprache" },
  { src: "/pitch/current-app.png", alt: "Aktueller klickbarer KiTa App Prototyp", label: "Klickbarer Prototyp" },
]

const learningCards = [
  "KI half, sehr schnell klickbare Prototypen zu bauen.",
  "Designideen konnten direkt ausprobiert statt lange diskutiert werden.",
  "Der Stil wurde iterativ klarer: freundlich, vertrauensvoll und einfach zu bedienen.",
]

const validationCards = [
  "Usern eher große Aufgaben geben und nicht zur Lösung hinführen.",
  "Papier-Prototyping hat Nachteile bei Schriften, Klickzielen und echten Aktionen.",
  "Papier dauert länger als ein klickbarer Prototyp, wenn man mehrere Varianten testen will.",
]

const aiCards = [
  "Mit KI ist Konzept- und App-Entwicklung deutlich schneller und lustiger.",
  "Man kann gemütlich beim Bier gemeinsam prompten und die App Schritt für Schritt formen.",
  "Mehr Spaß und Kreativfaktor, ohne lange in Figma oder Papier herumzubasteln.",
]

const slides: PitchSlide[] = [
  {
    eyebrow: "Pitch / KiTa App",
    title: "KiTa Prototyp",
    kicker: "Präsentation der Entwicklung",
    icon: Presentation,
    accent: "var(--kita-blue)",
    body: (
      <div className="grid h-full min-h-0 grid-cols-[1fr_0.72fr] gap-6">
        <section className="flex min-h-0 flex-col justify-between rounded-[30px] bg-[linear-gradient(135deg,var(--kita-blue),var(--kita-petrol))] p-9 text-white shadow-sm">
          <div>
            <div className="mb-8 flex size-16 items-center justify-center rounded-3xl bg-white/18">
              <Sparkles className="size-8" aria-hidden="true" />
            </div>
            <h1 className="max-w-3xl text-7xl font-semibold leading-[0.95]">KiTa App</h1>
            <p className="mt-5 max-w-2xl text-3xl font-semibold text-white/82">Was ist die Lösung und wie hat sie sich weiterentwickelt?</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {["Daria", "David", "Michael"].map((name) => (
              <div key={name} className="rounded-3xl bg-white/16 px-5 py-4 text-center text-2xl font-semibold">{name}</div>
            ))}
          </div>
        </section>
        <section className="relative overflow-hidden rounded-[30px] bg-white p-7 ring-1 ring-[var(--kita-fog)]">
          <div className="absolute -right-10 -top-10 size-44 rounded-full bg-[var(--kita-sun)]/35" />
          <div className="absolute -bottom-12 left-10 size-48 rounded-full bg-[var(--kita-mint)]/25" />
          <Image src="/pitch/current-app.png" alt="Aktuelle KiTa App im iPad-Stil" fill loading="eager" sizes="38vw" className="object-contain p-6" />
        </section>
      </div>
    ),
  },
  {
    eyebrow: "Entwicklung",
    title: "Von Idee zu klickbarer App",
    kicker: "Bilder der Lösung mit Entwicklungsschritten",
    icon: Images,
    accent: "var(--kita-mint)",
    body: (
      <div className="grid h-full min-h-0 grid-cols-3 gap-5">
        {developmentImages.map((item, index) => (
          <article key={item.src} className="flex min-h-0 flex-col overflow-hidden rounded-[28px] bg-white ring-1 ring-[var(--kita-fog)]">
            <div className="flex items-center justify-between px-5 py-4">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-[var(--kita-cloud)] text-lg font-extrabold text-[var(--kita-ink)]">0{index + 1}</span>
              <span className="text-sm font-bold text-muted-foreground">{item.label}</span>
            </div>
            <div className="relative min-h-0 flex-1 bg-[var(--kita-cloud)]">
              <Image src={item.src} alt={item.alt} fill loading="eager" sizes="30vw" className="object-contain p-3" />
            </div>
          </article>
        ))}
      </div>
    ),
  },
  {
    eyebrow: "Learning 1",
    title: "Gestalten mit Tempo",
    kicker: "KI als schneller Weg zu ausprobierbaren Varianten",
    icon: WandSparkles,
    accent: "var(--kita-lavender)",
    body: <LearningGrid cards={learningCards} highlight="Viele Ideen wurden sofort klickbar statt nur beschrieben." imageSrc="/pitch/codex-working.png" imageAlt="Codex-Arbeitsoberfläche während der App-Entwicklung" />,
  },
  {
    eyebrow: "Learning 2",
    title: "Validierung",
    kicker: "Tests werden besser, wenn man nicht zu stark führt",
    icon: ClipboardCheck,
    accent: "var(--kita-coral)",
    body: <LearningGrid cards={validationCards} highlight="Große Aufgaben zeigen ehrlicher, ob die App wirklich verstanden wird." imageSrc="/pitch/paper-prototype.jpeg" imageAlt="Papier-Prototyp der KiTa App mit gezeichneten Listen und Karten" />,
  },
  {
    eyebrow: "Learning 3",
    title: "KI macht Entwicklung leichter",
    kicker: "Schneller, lustiger und kreativer zusammen arbeiten",
    icon: Bot,
    accent: "var(--kita-sun)",
    body: <LearningGrid cards={aiCards} highlight="Gemeinsam prompten fühlt sich direkter an als lange an statischen Mockups zu feilen." imageSrc="/pitch/ai-prompting-beer.png" imageAlt="Mehrere Personen prompten gemeinsam an Laptops, trinken Bier und lachen" imageClassName="object-cover" />,
  },
]

function LearningGrid({ cards, highlight, imageSrc, imageAlt, imageClassName = "object-contain" }: { cards: string[]; highlight: string; imageSrc: string; imageAlt: string; imageClassName?: string }) {
  return (
    <div className="grid h-full min-h-0 grid-cols-[0.82fr_1fr] gap-6">
      <section className="flex min-h-0 flex-col justify-between rounded-[30px] bg-white p-7 ring-1 ring-[var(--kita-fog)]">
        <div className="rounded-[28px] bg-[linear-gradient(135deg,var(--kita-blue),var(--kita-petrol))] p-6 text-white">
          <p className="text-3xl font-semibold leading-tight">{highlight}</p>
        </div>
        <div className="relative mt-6 min-h-0 flex-1 overflow-hidden rounded-[28px] bg-[var(--kita-cloud)]">
          <Image src={imageSrc} alt={imageAlt} fill loading="eager" sizes="36vw" className={cn(imageClassName, "p-5")} />
        </div>
      </section>
      <section className="grid min-h-0 grid-rows-3 gap-4">
        {cards.map((card, index) => (
          <div key={card} className="flex items-center gap-5 rounded-[28px] bg-white p-6 text-[var(--kita-ink)] ring-1 ring-[var(--kita-fog)]">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--kita-mint)]/22 text-2xl font-extrabold">{index + 1}</span>
            <p className="text-3xl font-semibold leading-tight">{card}</p>
          </div>
        ))}
      </section>
    </div>
  )
}

export function PitchDeck({ slide }: { slide: number }) {
  const router = useRouter()
  const current = slides[slide - 1] ?? slides[0]
  const Icon = current.icon
  const previous = slide === 1 ? slideCount : slide - 1
  const next = slide === slideCount ? 1 : slide + 1

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") router.push(`/pitch/${previous}`)
      if (event.key === "ArrowRight") router.push(`/pitch/${next}`)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [next, previous, router])

  return (
    <main className="h-[100dvh] w-[100dvw] overflow-hidden bg-[#eef3f6] p-5 text-[var(--kita-ink)]">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(#dfe7ee_1px,transparent_1px),linear-gradient(90deg,#dfe7ee_1px,transparent_1px)] bg-[size:64px_64px] opacity-65" aria-hidden="true" />
      <div className="relative mx-auto flex h-full max-w-[1600px] flex-col rounded-[38px] bg-white/78 p-5 shadow-[0_28px_90px_rgb(38_65_94_/_16%)] ring-1 ring-white">
        <header className="mb-5 flex items-center justify-between rounded-[28px] bg-[linear-gradient(135deg,var(--kita-blue),var(--kita-petrol))] px-7 py-5 text-white shadow-sm">
          <div className="flex items-center gap-5">
            <div className="flex size-15 items-center justify-center rounded-3xl bg-white/18">
              <Icon className="size-8" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-white/70">{current.eyebrow}</p>
              <h1 className="text-5xl font-semibold leading-tight">{current.title}</h1>
            </div>
          </div>
          <div className="rounded-3xl bg-white/16 px-5 py-3 text-right">
            <p className="text-sm font-bold text-white/70">Slide</p>
            <p className="text-3xl font-semibold">{slide}/{slideCount}</p>
          </div>
        </header>

        <section className="min-h-0 flex-1">
          <div className="mb-4 flex items-center gap-3">
            <span className="h-3 w-16 rounded-full" style={{ background: current.accent }} />
            <p className="text-2xl font-semibold text-muted-foreground">{current.kicker}</p>
          </div>
          <div className="h-[calc(100%-3rem)] min-h-0">{current.body}</div>
        </section>

        <nav className="mt-5 flex items-center justify-between rounded-[26px] bg-[var(--kita-cloud)] px-5 py-4 ring-1 ring-[var(--kita-fog)]" aria-label="Pitch Navigation">
          <Link href={`/pitch/${previous}`} className="flex size-12 items-center justify-center rounded-2xl bg-white text-[var(--kita-ink)] shadow-sm ring-1 ring-[var(--kita-fog)]" aria-label="Vorherige Slide">
            <ArrowLeft aria-hidden="true" />
          </Link>
          <div className="flex items-center gap-4">
            {Array.from({ length: slideCount }, (_, index) => {
              const step = index + 1
              const active = step === slide
              return (
                <Link
                  key={step}
                  href={`/pitch/${step}`}
                  aria-label={`Zu Slide ${step}`}
                  aria-current={active ? "step" : undefined}
                  className={cn("flex size-12 items-center justify-center rounded-full text-base font-extrabold transition", active ? "bg-[var(--kita-blue)] text-white shadow-md" : "bg-white text-muted-foreground ring-1 ring-[var(--kita-fog)] hover:text-[var(--kita-ink)]")}
                >
                  {step}
                </Link>
              )
            })}
          </div>
          <Link href={`/pitch/${next}`} className="flex size-12 items-center justify-center rounded-2xl bg-white text-[var(--kita-ink)] shadow-sm ring-1 ring-[var(--kita-fog)]" aria-label="Nächste Slide">
            <ArrowRight aria-hidden="true" />
          </Link>
        </nav>
      </div>
    </main>
  )
}
