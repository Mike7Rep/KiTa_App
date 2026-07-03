import { redirect } from "next/navigation"

export const metadata = { title: "Pitch - KiTa App" }

export default function PitchPage() {
  redirect("/pitch/1")
}
