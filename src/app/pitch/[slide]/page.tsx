import { notFound } from "next/navigation"
import { PitchDeck } from "@/components/pitch-deck"

const slides = ["1", "2", "3", "4", "5"] as const

export const metadata = { title: "Pitch - KiTa App" }

export function generateStaticParams() {
  return slides.map((slide) => ({ slide }))
}

export default async function PitchSlidePage({
  params,
}: {
  params: Promise<{ slide: string }>
}) {
  const { slide } = await params
  if (!slides.includes(slide as (typeof slides)[number])) notFound()

  return <PitchDeck slide={Number(slide)} />
}
