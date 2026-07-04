"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { ArrowLeft, ArrowUpDown, CalendarDays, CheckCircle2, FileText, Home, MessageCircle, Phone, Plus, Search, Send, Thermometer, UserCheck, UserX, Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { recordLeanUxEvent, resetLeanUxSession } from "@/lib/leanux-recorder"
import { WatermelonLoadingScreen } from "@/components/watermelon-loading"

type AttendanceStatus = "expected" | "present" | "gone" | "absent" | "sick"
type MainView = "today" | "groups" | "reports" | "messages"
type View = MainView | "profile"
type SortKey = "name" | "group" | "status" | "time"
type Contact = { name: string; role: string; phone: string; photoUrl: string; canPickup?: boolean }
type Child = { id: string; name: string; group: string; initials: string; color: string; photoUrl: string; status: AttendanceStatus; expectedArrival: string; arrivalTime?: string; departureTime?: string; pickupBy?: string; sickReason?: string; sickTime?: string; pickupOptions: string[]; notes: string; allergies: string; contacts: Contact[]; monthDays: number; yearDays: number }
type ChildCounts = { present: number; expected: number; gone: number; sick: number }
type NewChildForm = { name: string; group: string; expectedArrival: string; allergies: string; notes: string; pickup: string }
type ChatMessage = { id: string; author: string; text: string; time: string; tone?: "team" | "own" }

const WatermelonSplash = dynamic(() => import("@/components/watermelon-splash").then((mod) => mod.WatermelonSplash), { ssr: false, loading: () => <WatermelonSplashFallback /> })
const childColors = ["#66D6AE", "#FFD85A", "#4DA8F5", "#A78BFA", "#FF7A70", "#F6A6C8", "#8BD450", "#F59E0B"]
const contactImgs = ["parent-lisa", "parent-jonas", "parent-mara", "parent-theo"]
const emptyChildForm: NewChildForm = { name: "", group: "Sonnengruppe", expectedArrival: "08:00", allergies: "", notes: "", pickup: "" }
const sickReasons = ["Fieber", "Erkältung", "Bauchweh", "Arzttermin"]
const navItems: { value: MainView; label: string; icon: React.ElementType }[] = [
  { value: "today", label: "Heute", icon: Home },
  { value: "groups", label: "Gruppen", icon: Users },
  { value: "reports", label: "Report", icon: FileText },
  { value: "messages", label: "Chat", icon: MessageCircle },
]

const contact = (name: string, role: string, phone: string, img: string, canPickup = true): Contact => ({ name, role, phone, photoUrl: `/profiles/${img}.jpg`, canPickup })
const initialChildren: Child[] = [
  { id: "ben", name: "Ben Mueller", group: "Sonnengruppe", initials: "BM", color: "#66D6AE", photoUrl: "/profiles/ben.jpg", status: "present", expectedArrival: "08:00", arrivalTime: "08:12", pickupOptions: ["Lisa Mueller", "Jonas Mueller", "Oma Ruth"], notes: "Eltern trennen sich gerade - Abholung nur durch Personen auf der bestätigten Liste.", allergies: "Haselnuss", contacts: [contact("Lisa Mueller", "Mutter", "+41 79 111 22 33", "parent-lisa"), contact("Jonas Mueller", "Vater", "+41 78 444 55 66", "parent-jonas"), contact("Oma Ruth", "Oma", "+41 76 222 33 44", "grandma-ruth")], monthDays: 16, yearDays: 101 },
  { id: "lina", name: "Lina Keller", group: "Regenbogengruppe", initials: "LK", color: "#FFD85A", photoUrl: "/profiles/lina.jpg", status: "expected", expectedArrival: "09:00", pickupOptions: ["Mara Keller", "Theo Keller"], notes: "Trägt links ein Hörgerät - beim Stuhlkreis bitte vorne sitzen lassen.", allergies: "Keine", contacts: [contact("Mara Keller", "Mutter", "+41 76 232 10 10", "parent-mara"), contact("Theo Keller", "Vater", "+41 77 909 18 18", "parent-theo")], monthDays: 13, yearDays: 88 },
  { id: "noah", name: "Noah Fischer", group: "Wolkengruppe", initials: "NF", color: "#4DA8F5", photoUrl: "/profiles/noah.jpg", status: "present", expectedArrival: "08:30", arrivalTime: "08:28", pickupOptions: ["Laura Fischer", "Nico Fischer"], notes: "Sprachförderung dienstags - braucht klare, kurze Sätze und Blickkontakt.", allergies: "Laktose", contacts: [contact("Laura Fischer", "Mutter", "+41 79 420 00 20", "parent-laura"), contact("Nico Fischer", "Vater", "+41 78 311 40 17", "parent-nico")], monthDays: 15, yearDays: 97 },
  { id: "mia", name: "Mia Schneider", group: "Sternengruppe", initials: "MS", color: "#A78BFA", photoUrl: "/profiles/mia.jpg", status: "gone", expectedArrival: "07:45", arrivalTime: "07:51", departureTime: "12:20", pickupBy: "Sarah Schneider", pickupOptions: ["Sarah Schneider", "David Schneider"], notes: "Sehr schüchtern bei Übergaben - das Winke-Ritual am Fenster hilft beim Abschied.", allergies: "Erdbeeren", contacts: [contact("Sarah Schneider", "Mutter", "+41 79 502 44 41", "parent-sarah"), contact("David Schneider", "Vater", "+41 78 901 12 12", "parent-david")], monthDays: 12, yearDays: 74 },
  { id: "elia", name: "Elia Baumann", group: "Sonnengruppe", initials: "EB", color: "#FF7A70", photoUrl: "/profiles/elia.jpg", status: "sick", expectedArrival: "08:15", sickReason: "Fieber", sickTime: "07:58", pickupOptions: ["Nora Baumann", "Marc Baumann"], notes: "Asthma - Inhalator im Rucksack, Notfallplan im Gruppenordner.", allergies: "Penicillin", contacts: [contact("Nora Baumann", "Mutter", "+41 76 808 55 55", "parent-nora"), contact("Marc Baumann", "Vater", "+41 79 330 20 11", "parent-marc")], monthDays: 9, yearDays: 65 },
  { id: "ava", name: "Ava Rossi", group: "Sonnengruppe", initials: "AR", color: "#F6A6C8", photoUrl: "/profiles/ava.jpg", status: "expected", expectedArrival: "08:30", pickupOptions: ["Elena Rossi"], notes: "Eltern geschieden - Abholung ausschliesslich durch die Mutter (gerichtliche Vereinbarung).", allergies: "Erdnuss", contacts: [contact("Elena Rossi", "Mutter", "+41 76 515 90 90", "parent-laura"), contact("Marco Rossi", "Vater", "+41 79 646 25 25", "parent-nico", false)], monthDays: 11, yearDays: 69 },
  { id: "leo", name: "Leo Brunner", group: "Wolkengruppe", initials: "LB", color: "#8BD450", photoUrl: "/profiles/leo.jpg", status: "present", expectedArrival: "08:00", arrivalTime: "07:58", pickupOptions: ["Julia Brunner", "Stefan Brunner"], notes: "Trägt eine Brille - beim Toben in der Turnhalle bitte das Sportband anziehen.", allergies: "Keine", contacts: [contact("Julia Brunner", "Mutter", "+41 78 737 14 14", "parent-sarah"), contact("Stefan Brunner", "Vater", "+41 79 828 36 36", "parent-david")], monthDays: 14, yearDays: 92 },
  { id: "sofia", name: "Sofia Steiner", group: "Sternengruppe", initials: "SS", color: "#F59E0B", photoUrl: "/profiles/sofia.jpg", status: "expected", expectedArrival: "09:15", pickupOptions: ["Anna Steiner", "Paul Steiner"], notes: "Isst vegetarisch auf Wunsch der Eltern - beim Znüni und Mittagessen beachten.", allergies: "Kiwi", contacts: [contact("Anna Steiner", "Mutter", "+41 76 919 47 47", "parent-nora"), contact("Paul Steiner", "Vater", "+41 78 050 58 58", "parent-marc")], monthDays: 12, yearDays: 81 },
  { id: "emil", name: "Emil Weber", group: "Sonnengruppe", initials: "EW", color: "#38BDF8", photoUrl: "/profiles/emil.jpg", status: "absent", expectedArrival: "08:45", pickupOptions: ["Petra Weber", "Karl Weber"], notes: "Diabetes Typ 1 - Blutzucker vor dem Znüni kontrollieren, Sensor am linken Arm.", allergies: "Keine", contacts: [contact("Petra Weber", "Mutter", "+41 79 161 69 69", "parent-lisa"), contact("Karl Weber", "Vater", "+41 78 272 71 71", "parent-jonas")], monthDays: 10, yearDays: 58 },
  { id: "nina", name: "Nina Huber", group: "Wolkengruppe", initials: "NH", color: "#C084FC", photoUrl: "/profiles/nina.jpg", status: "present", expectedArrival: "09:00", arrivalTime: "09:04", pickupOptions: ["Sandra Huber", "Oma Elsbeth"], notes: "Frisch in der Eingewöhnung - Mama bleibt morgens noch 15 Minuten dabei.", allergies: "Gluten", contacts: [contact("Sandra Huber", "Mutter", "+41 76 383 82 82", "parent-mara"), contact("Oma Elsbeth", "Oma", "+41 77 494 93 93", "grandma-ruth")], monthDays: 8, yearDays: 8 },
]
const initialMessages: ChatMessage[] = [
  { id: "m1", author: "Daria", text: "Lina kommt heute etwas später, die Gruppe ist informiert.", time: "08:02", tone: "team" },
  { id: "m2", author: "David", text: "Bitte beim Znüni auf Haselnuss und Erdnuss achten.", time: "08:18", tone: "team" },
  { id: "m3", author: "Michael", text: "Turnhalle ab 10:30 frei.", time: "09:04", tone: "own" },
]

const timeNow = () => new Intl.DateTimeFormat("de-CH", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date())
const formatCurrentDateLabel = () => `Heute, ${new Intl.DateTimeFormat("de-CH", { day: "2-digit", month: "long", timeZone: "Europe/Zurich", year: "numeric" }).format(new Date())}`
const statusLabel = (s: AttendanceStatus) => ({ present: "Angekommen", gone: "Abgeholt", absent: "Abwesend", sick: "Krank", expected: "Erwartet" })[s]
const statusColor = (s: AttendanceStatus): React.CSSProperties => s === "present"
  ? { backgroundColor: "color-mix(in oklab, var(--kita-mint) 24%, white)", color: "#157b62" }
  : s === "sick"
    ? { backgroundColor: "color-mix(in oklab, var(--kita-coral) 22%, white)", color: "#a93832" }
    : { backgroundColor: "color-mix(in oklab, var(--kita-fog) 72%, white)", color: "#5d6f83" }
const statusOrder = (s: AttendanceStatus) => ({ present: 1, expected: 2, gone: 3, absent: 4, sick: 5 })[s]
const childTimeText = (c: Child) => c.status === "sick" ? `${c.sickTime ?? c.expectedArrival} krank` : c.departureTime ? `${c.departureTime} abgeholt` : c.arrivalTime ? `${c.arrivalTime} angekommen` : `${c.expectedArrival} erwartet`
const childSortTime = (c: Child) => c.arrivalTime ?? c.sickTime ?? c.departureTime ?? c.expectedArrival
const initialsFromName = (name: string) => name.split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase()
const childIdFromName = (name: string, index: number) => {
  const slug = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "kind"
  return `kind-${index + 1}-${slug}`
}

function useCurrentDateLabel() {
  const [label, setLabel] = React.useState("Heute")
  React.useEffect(() => {
    const update = () => setLabel(formatCurrentDateLabel())
    update()
    const timer = window.setInterval(update, 60_000)
    return () => window.clearInterval(timer)
  }, [])
  return label
}

export function KitaPrototype() {
  const [children, setChildren] = React.useState(initialChildren)
  const [activeView, setActiveView] = React.useState<View>("today")
  const [returnView, setReturnView] = React.useState<MainView>("today")
  const [selectedChildId, setSelectedChildId] = React.useState(initialChildren[0].id)
  const [showSplash, setShowSplash] = React.useState(true)
  const [addOpen, setAddOpen] = React.useState(false)
  const [messages, setMessages] = React.useState(initialMessages)
  const currentDateLabel = useCurrentDateLabel()
  const childById = React.useMemo(() => new Map(children.map((child) => [child.id, child])), [children])
  const selectedChild = childById.get(selectedChildId) ?? children[0]
  const counts = React.useMemo<ChildCounts>(() => children.reduce((total, child) => {
    if (child.status === "present") total.present += 1
    else if (child.status === "expected") total.expected += 1
    else if (child.status === "gone") total.gone += 1
    else if (child.status === "sick") total.sick += 1
    return total
  }, { present: 0, expected: 0, gone: 0, sick: 0 }), [children])

  React.useEffect(() => {
    resetLeanUxSession()
    recordLeanUxEvent("Start", "Browser-Refresh")
    const onClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null
      const interactive = target?.closest("button,a,[role='tab'],[data-testid]") as HTMLElement | null
      if (!interactive) return
      const label = (interactive.getAttribute("aria-label") || interactive.getAttribute("title") || interactive.textContent || interactive.getAttribute("data-testid") || "Interaktion").replace(/\s+/g, " ").trim()
      if (label) recordLeanUxEvent(`Klick: ${label}`)
    }
    window.addEventListener("click", onClick, true)
    return () => window.removeEventListener("click", onClick, true)
  }, [])

  const updateChild = React.useCallback((id: string, updater: (child: Child) => Child) => {
    setChildren((items) => items.map((child) => child.id === id ? updater(child) : child))
  }, [])
  const openProfile = React.useCallback((id: string, source: MainView = "today") => {
    recordLeanUxEvent("Funktion: Profil geöffnet", childById.get(id)?.name ?? id)
    setSelectedChildId(id)
    setReturnView(source)
    setActiveView("profile")
  }, [childById])
  const addChild = React.useCallback((data: NewChildForm) => {
    const name = data.name.trim()
    if (!name) return
    const pickupOptions = data.pickup.split(",").map((s) => s.trim()).filter(Boolean)
    const persons = pickupOptions.length ? pickupOptions : ["Eltern"]
    const child: Child = { id: childIdFromName(name, children.length), name, group: data.group.trim() || "Sonnengruppe", initials: initialsFromName(name), color: childColors[children.length % childColors.length], photoUrl: "", status: "expected", expectedArrival: data.expectedArrival || "08:00", pickupOptions: persons, notes: data.notes.trim() || "Noch keine Besonderheiten erfasst.", allergies: data.allergies.trim() || "Keine", contacts: persons.map((n, i) => contact(n, "Abholberechtigt", "+41 70 000 00 00", contactImgs[i % contactImgs.length])), monthDays: 0, yearDays: 0 }
    setChildren((items) => [...items, child])
    setSelectedChildId(child.id)
    setAddOpen(false)
  }, [children.length])
  const handleViewChange = React.useCallback((value: string) => {
    const next = value as MainView
    recordLeanUxEvent("Funktion: Ansicht wechseln", next)
    setActiveView(next)
    setReturnView(next)
  }, [])
  const handleSendMessage = React.useCallback((text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return
    setMessages((items) => [...items, { id: `msg-${Date.now()}`, author: "Team", text: trimmed, time: timeNow(), tone: "own" }])
    recordLeanUxEvent("Funktion: Chatnachricht gesendet", trimmed)
  }, [])
  const handleCheckIn = React.useCallback((id: string) => {
    recordLeanUxEvent("Funktion: Ankunft erfasst", childById.get(id)?.name ?? id)
    updateChild(id, (child) => ({ ...child, status: "present", arrivalTime: child.arrivalTime ?? timeNow(), departureTime: undefined, pickupBy: undefined, sickReason: undefined, sickTime: undefined }))
  }, [childById, updateChild])
  const handleCheckOut = React.useCallback((id: string, pickupBy: string) => {
    recordLeanUxEvent("Funktion: Abholung erfasst", `${childById.get(id)?.name ?? id}: ${pickupBy}`)
    updateChild(id, (child) => ({ ...child, status: "gone", departureTime: timeNow(), pickupBy }))
  }, [childById, updateChild])
  const handleMarkSick = React.useCallback((id: string, reason: string) => {
    recordLeanUxEvent("Funktion: Krankmeldung erfasst", `${childById.get(id)?.name ?? id}: ${reason}`)
    updateChild(id, (child) => ({ ...child, status: "sick", arrivalTime: undefined, departureTime: undefined, pickupBy: undefined, sickReason: reason, sickTime: timeNow() }))
  }, [childById, updateChild])
  const handleSaveNote = React.useCallback((id: string, note: string) => {
    recordLeanUxEvent("Funktion: Besonderheit gespeichert", childById.get(id)?.name ?? id)
    updateChild(id, (child) => ({ ...child, notes: note.trim() || "Keine Besonderheiten erfasst." }))
  }, [childById, updateChild])

  return (
    <main className="flex h-[100dvh] w-[100dvw] max-w-[100dvw] items-center justify-center overflow-hidden bg-neutral-300">
      {showSplash ? <WatermelonSplash onDone={() => setShowSplash(false)} /> : null}
      <div className="ipad-frame">
        <div className="ipad-camera" />
        <div className="ipad-screen">
          <WatermelonAnimations />
          <Tabs value={activeView} onValueChange={handleViewChange} orientation="vertical" className="kita-shell relative h-full min-h-0 gap-4">
            <TabsList className="h-full w-[86px] flex-col justify-start gap-3 rounded-[24px] bg-[var(--kita-cloud)] p-3 text-[var(--kita-ink)]">
              {navItems.map((item) => <TabsTrigger key={item.value} value={item.value} aria-label={item.label} className="h-16 w-full flex-col rounded-2xl px-2 py-2 text-xs data-active:bg-white data-active:text-primary data-active:shadow-sm"><item.icon data-icon="inline-start" />{item.label}</TabsTrigger>)}
            </TabsList>
            <div className="min-w-0 flex-1">
              <TabsContent value="today" className="h-full"><TodayView kids={children} counts={counts} currentDateLabel={currentDateLabel} onOpenProfile={(id) => openProfile(id, "today")} /></TabsContent>
              <TabsContent value="groups" className="h-full"><GroupsView kids={children} onOpenProfile={(id) => openProfile(id, "groups")} onAddChild={() => setAddOpen(true)} /></TabsContent>
              <TabsContent value="reports" className="h-full"><ReportsView kids={children} /></TabsContent>
              <TabsContent value="messages" className="h-full"><MessagesView messages={messages} onSend={handleSendMessage} /></TabsContent>
              <TabsContent value="profile" className="h-full"><ProfileView key={selectedChild.id} child={selectedChild} onBack={() => setActiveView(returnView)} onCheckIn={handleCheckIn} onCheckOut={handleCheckOut} onMarkSick={handleMarkSick} onSaveNote={handleSaveNote} /></TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
      {addOpen ? <AddChildDialog open={addOpen} onOpenChange={setAddOpen} onAdd={addChild} /> : null}
    </main>
  )
}

function TodayView({ kids, counts, currentDateLabel, onOpenProfile }: { kids: Child[]; counts: ChildCounts; currentDateLabel: string; onOpenProfile: (id: string) => void }) {
  const [query, setQuery] = React.useState("")
  const [sort, setSort] = React.useState<{ key: SortKey; direction: "asc" | "desc" }>({ key: "time", direction: "asc" })
  const visibleKids = React.useMemo(() => {
    const needle = query.trim().toLowerCase()
    const filtered = needle ? kids.filter((child) => `${child.name} ${child.group} ${statusLabel(child.status)} ${childTimeText(child)}`.toLowerCase().includes(needle)) : kids
    return filtered.toSorted((a, b) => {
      const multiplier = sort.direction === "asc" ? 1 : -1
      if (sort.key === "status") return (statusOrder(a.status) - statusOrder(b.status)) * multiplier
      const av = sort.key === "time" ? childSortTime(a) : a[sort.key]
      const bv = sort.key === "time" ? childSortTime(b) : b[sort.key]
      return av.localeCompare(bv, "de-CH", { numeric: true }) * multiplier
    })
  }, [kids, query, sort])
  const changeSort = (key: SortKey) => setSort((current) => ({ key, direction: current.key === key && current.direction === "asc" ? "desc" : "asc" }))

  return (
    <section className="flex h-full min-h-0 flex-col gap-3 min-[1280px]:gap-4">
      <div className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,var(--kita-blue),var(--kita-petrol))] p-5 text-white shadow-sm min-[1280px]:p-6">
        <div className="hero-watermelon-cluster" aria-hidden="true"><span className="hero-watermelon" /><span className="hero-watermelon hero-watermelon-small" /><span className="hero-watermelon-seed" /></div>
        <div className="relative z-10 flex items-start justify-between gap-6">
          <h1 className="text-3xl font-semibold leading-tight min-[1280px]:text-4xl">KiTa Heute</h1>
          <div className="flex items-center gap-2 rounded-2xl bg-white/16 px-4 py-2 text-sm font-semibold" aria-live="polite"><CalendarDays />{currentDateLabel}</div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3">
        <Metric label="Angekommen" value={counts.present} tone="mint" />
        <Metric label="Erwartet" value={counts.expected} tone="neutral" />
        <Metric label="Abgeholt" value={counts.gone} tone="neutral" />
        <Metric label="Krank" value={counts.sick} tone="coral" />
      </div>
      <Card className="min-h-0 flex-1 rounded-[24px] border-0 bg-white ring-1 ring-[var(--kita-fog)]">
        <CardHeader className="grid grid-cols-[1fr_minmax(260px,360px)] items-center gap-4">
          <div>
            <CardTitle className="text-2xl">Kinder heute</CardTitle>
            <CardDescription>Klicken auf eine Zeile öffnet das Profil</CardDescription>
          </div>
          <label className="flex h-11 items-center gap-2 rounded-2xl bg-[var(--kita-cloud)] px-4 ring-1 ring-[var(--kita-fog)]">
            <Search className="size-4 text-muted-foreground" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Kinder suchen" className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none" />
          </label>
        </CardHeader>
        <CardContent className="min-h-0">
          <ScrollArea className="h-[calc(100dvh-390px)] min-h-[280px] pr-2">
            <table className="w-full border-separate border-spacing-y-2 text-left text-sm">
              <thead className="text-xs font-semibold uppercase text-muted-foreground">
                <tr>
                  <SortableHead label="Name" sortKey="name" active={sort.key} onSort={changeSort} />
                  <SortableHead label="Gruppe" sortKey="group" active={sort.key} onSort={changeSort} />
                  <SortableHead label="Status" sortKey="status" active={sort.key} onSort={changeSort} />
                  <SortableHead label="Zeit" sortKey="time" active={sort.key} onSort={changeSort} />
                </tr>
              </thead>
              <tbody>
                {visibleKids.map((child) => <ChildTableRow key={child.id} child={child} onOpenProfile={onOpenProfile} />)}
              </tbody>
            </table>
          </ScrollArea>
        </CardContent>
      </Card>
    </section>
  )
}

function SortableHead({ label, sortKey, active, onSort }: { label: string; sortKey: SortKey; active: SortKey; onSort: (key: SortKey) => void }) {
  return <th className="px-4 py-1"><button type="button" data-testid={`sort-${sortKey}`} onClick={() => onSort(sortKey)} className={cn("inline-flex items-center gap-1 rounded-lg px-1 py-1", active === sortKey && "text-[var(--kita-ink)]")}><span>{label}</span><ArrowUpDown className="size-3" /></button></th>
}

function ChildTableRow({ child, onOpenProfile }: { child: Child; onOpenProfile: (id: string) => void }) {
  return (
    <tr data-testid={`child-row-${child.id}`} onClick={() => onOpenProfile(child.id)} className="cursor-pointer bg-[var(--kita-cloud)] transition hover:bg-white hover:shadow-sm">
      <td className="rounded-l-2xl px-4 py-3"><div className="flex items-center gap-3"><ChildAvatar child={child} /><div><div className="font-semibold">{child.name}</div><div className="text-xs text-muted-foreground">{child.allergies === "Keine" ? "Keine Allergien" : `Allergie: ${child.allergies}`}</div></div></div></td>
      <td className="px-4 py-3 font-medium">{child.group}</td>
      <td className="px-4 py-3"><StatusBadge status={child.status} /></td>
      <td className="rounded-r-2xl px-4 py-3 font-medium">{childTimeText(child)}</td>
    </tr>
  )
}

function ProfileView({ child, onBack, onCheckIn, onCheckOut, onMarkSick, onSaveNote }: { child: Child; onBack: () => void; onCheckIn: (id: string) => void; onCheckOut: (id: string, pickupBy: string) => void; onMarkSick: (id: string, reason: string) => void; onSaveNote: (id: string, note: string) => void }) {
  const [note, setNote] = React.useState(child.notes)
  return (
    <section className="flex h-full min-h-0 flex-col gap-4">
      <div className="rounded-[28px] bg-[linear-gradient(135deg,var(--kita-blue),var(--kita-petrol))] p-5 text-white shadow-sm min-[1280px]:p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <Button data-testid="profile-back" variant="secondary" size="icon" className="rounded-2xl bg-white/18 text-white hover:bg-white/28" aria-label="Zurück" onClick={onBack}><ArrowLeft /></Button>
            <ChildAvatar child={child} size="lg" />
            <div className="min-w-0">
              <h1 className="truncate text-3xl font-semibold min-[1280px]:text-4xl">{child.name}</h1>
              <p className="mt-1 text-sm font-medium text-white/80">{child.group}</p>
            </div>
          </div>
          <StatusBadge status={child.status} className="px-4 py-2 text-sm" />
        </div>
      </div>
      <ScrollArea className="min-h-0 flex-1 rounded-[24px] bg-[var(--kita-cloud)] p-4">
        <div className="grid gap-4 pr-2 min-[1180px]:grid-cols-[1fr_1fr]">
          <div className="grid content-start gap-4">
            <div className="grid grid-cols-2 gap-3 min-[1180px]:grid-cols-4">
              <MiniField label="Ankunft" value={child.arrivalTime ?? child.expectedArrival} />
              <MiniField label="Abholung" value={child.departureTime ?? child.pickupBy ?? "-"} />
              <MiniField label="Allergien" value={child.allergies} />
              <MiniField label="Anwesend im Monat" value={`${child.monthDays} Tage`} />
            </div>
            <Card className="rounded-[20px] border-0 ring-1 ring-[var(--kita-fog)]">
              <CardHeader><CardTitle>Besonderheiten</CardTitle><CardDescription>Lokale Notiz für das Team</CardDescription></CardHeader>
              <CardContent className="grid gap-3">
                <textarea data-testid="profile-note" value={note} onChange={(event) => setNote(event.target.value)} rows={5} className="w-full resize-none rounded-2xl bg-[var(--kita-cloud)] px-4 py-3 text-sm font-medium outline-none ring-1 ring-[var(--kita-fog)] transition focus:ring-2 focus:ring-primary" />
                <Button data-testid="save-note" className="justify-self-start" onClick={() => onSaveNote(child.id, note)}><CheckCircle2 data-icon="inline-start" />Notiz speichern</Button>
              </CardContent>
            </Card>
            <Card className="rounded-[20px] border-0 ring-1 ring-[var(--kita-fog)]">
              <CardHeader><CardTitle>Aktionen</CardTitle><CardDescription>Ankunft, Krankheit und Abholung werden hier erfasst</CardDescription></CardHeader>
              <CardContent className="grid gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={() => onCheckIn(child.id)}><UserCheck data-icon="inline-start" />Ankunft erfassen</Button>
                  <Button variant="outline" onClick={() => onMarkSick(child.id, "Krank gemeldet")}><Thermometer data-icon="inline-start" />Krank melden</Button>
                </div>
                <div className="grid grid-cols-2 gap-2 min-[1180px]:grid-cols-4">
                  {sickReasons.map((reason) => <Button key={reason} variant={child.sickReason === reason ? "secondary" : "outline"} onClick={() => onMarkSick(child.id, reason)}><Thermometer data-icon="inline-start" />{reason}</Button>)}
                </div>
                <div className="grid gap-2">
                  {child.pickupOptions.map((person) => <Button key={person} variant="outline" onClick={() => onCheckOut(child.id, person)}><UserX data-icon="inline-start" />Abholung: {person}</Button>)}
                </div>
              </CardContent>
            </Card>
          </div>
          <Card className="content-start rounded-[20px] border-0 ring-1 ring-[var(--kita-fog)]">
            <CardHeader><CardTitle>Kontakte und Abholberechtigte</CardTitle><CardDescription>Wer darf das Kind abholen?</CardDescription></CardHeader>
            <CardContent className="grid gap-3">
              {child.contacts.map((person) => <ContactRow key={person.phone} contact={person} />)}
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </section>
  )
}

function GroupsView({ kids, onOpenProfile, onAddChild }: { kids: Child[]; onOpenProfile: (id: string) => void; onAddChild: () => void }) {
  const groups = React.useMemo(() => Object.entries(kids.reduce<Record<string, Child[]>>((acc, child) => {
    acc[child.group] ??= []
    acc[child.group].push(child)
    return acc
  }, {})).sort(([a], [b]) => a.localeCompare(b, "de-CH")), [kids])
  return (
    <section className="flex h-full min-h-0 flex-col gap-4">
      <HeaderBar title="Gruppen" value={kids.length} action={<Button size="icon" className="size-14 rounded-2xl bg-white text-primary hover:bg-white/90" aria-label="Neues Kind anlegen" title="Neues Kind anlegen" onClick={onAddChild}><Plus aria-hidden="true" /></Button>} />
      <ScrollArea className="min-h-0 flex-1 rounded-[24px] bg-[var(--kita-cloud)] p-3">
        <div className="grid gap-4 pr-2">
          {groups.map(([group, children]) => <Card key={group} className="rounded-[20px] border-0 ring-1 ring-[var(--kita-fog)]"><CardHeader><CardTitle>{group}</CardTitle><CardDescription>{children.length} Kinder</CardDescription></CardHeader><CardContent><table className="w-full border-separate border-spacing-y-2 text-sm"><tbody>{children.toSorted((a, b) => a.name.localeCompare(b.name, "de-CH")).map((child) => <ChildTableRow key={child.id} child={child} onOpenProfile={onOpenProfile} />)}</tbody></table></CardContent></Card>)}
        </div>
      </ScrollArea>
    </section>
  )
}

function ReportsView({ kids }: { kids: Child[] }) {
  return <section className="flex h-full min-h-0 flex-col gap-4"><HeaderBar title="Report" value="Juli 2026" /><ScrollArea className="min-h-0 flex-1 rounded-[24px] bg-[var(--kita-cloud)] p-3"><div className="flex flex-col gap-3 pr-2">{kids.toSorted((a, b) => b.monthDays - a.monthDays).map((child) => <Card key={child.id} className="rounded-[20px] border-0 py-4 ring-1 ring-[var(--kita-fog)]"><CardContent className="grid grid-cols-[58px_1fr_150px_120px] items-center gap-4"><ChildAvatar child={child} /><div><h2 className="truncate text-lg font-semibold">{child.name}</h2><p className="text-sm text-muted-foreground">{child.group}</p></div><ReportNumber label="Anwesend im Monat" value={child.monthDays} /><ReportNumber label="Anwesend im Jahr" value={child.yearDays} /></CardContent></Card>)}</div></ScrollArea></section>
}

function MessagesView({ messages, onSend }: { messages: ChatMessage[]; onSend: (text: string) => void }) {
  const [text, setText] = React.useState("")
  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    onSend(text)
    setText("")
  }
  return (
    <section className="flex h-full min-h-0 flex-col gap-4">
      <HeaderBar title="Chat" value="Intern" />
      <Card className="min-h-0 flex-1 rounded-[24px] border-0 ring-1 ring-[var(--kita-fog)]">
        <CardContent className="flex h-full min-h-0 flex-col gap-4 p-4">
          <ScrollArea className="min-h-0 flex-1 rounded-[20px] bg-[var(--kita-cloud)] p-4">
            <div className="grid gap-3 pr-2">{messages.map((message) => <div key={message.id} className={cn("max-w-[72%] rounded-2xl px-4 py-3", message.tone === "own" ? "justify-self-end bg-[var(--kita-blue)] text-white" : "justify-self-start bg-white text-[var(--kita-ink)] ring-1 ring-[var(--kita-fog)]")}><div className="text-xs font-semibold opacity-75">{message.author} · {message.time}</div><p className="mt-1 text-sm font-medium leading-5">{message.text}</p></div>)}</div>
          </ScrollArea>
          <form onSubmit={submit} className="grid grid-cols-[1fr_auto] gap-3">
            <input data-testid="chat-input" value={text} onChange={(event) => setText(event.target.value)} placeholder="Nachricht an das Team" className="h-12 rounded-2xl bg-[var(--kita-cloud)] px-4 text-sm font-medium outline-none ring-1 ring-[var(--kita-fog)] transition focus:ring-2 focus:ring-primary" />
            <Button data-testid="chat-submit" type="submit" className="h-12 rounded-2xl"><Send data-icon="inline-start" />Senden</Button>
          </form>
        </CardContent>
      </Card>
    </section>
  )
}

function HeaderBar({ title, value, action }: { title: string; value: string | number; action?: React.ReactNode }) {
  return <div className="flex items-center justify-between rounded-[28px] bg-[linear-gradient(135deg,var(--kita-blue),var(--kita-petrol))] p-5 text-white shadow-sm min-[1280px]:p-6"><h1 className="text-3xl font-semibold min-[1280px]:text-4xl">{title}</h1><div className="flex items-center gap-3"><div className="rounded-2xl bg-white/16 px-5 py-3 text-xl font-semibold min-[1280px]:text-2xl">{value}</div>{action}</div></div>
}

function Metric({ label, value, tone }: { label: string; value: number; tone: "mint" | "neutral" | "coral" }) {
  const toneClass = { mint: "bg-[var(--kita-mint)]/22", neutral: "bg-slate-200/70", coral: "bg-[var(--kita-coral)]/18" }[tone]
  return <div className={cn("rounded-[22px] px-4 py-3 transition hover:-translate-y-0.5 min-[1280px]:px-5 min-[1280px]:py-4", toneClass)}><div className="text-2xl font-semibold min-[1280px]:text-3xl">{value}</div><div className="text-sm font-medium text-muted-foreground">{label}</div></div>
}

function StatusBadge({ status, className }: { status: AttendanceStatus; className?: string }) {
  return <Badge className={cn("border-0", className)} style={statusColor(status)}>{statusLabel(status)}</Badge>
}

function ContactRow({ contact }: { contact: Contact }) {
  return <div className="grid grid-cols-[52px_1fr_auto] items-center gap-3 rounded-2xl bg-[var(--kita-cloud)] p-3"><ContactAvatar contact={contact} /><div><div className="font-semibold">{contact.name}</div><div className="text-sm text-muted-foreground">{contact.role}{contact.canPickup ? " · darf abholen" : " · nicht abholberechtigt"}</div></div><a className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-primary ring-1 ring-[var(--kita-fog)]" href={`tel:${contact.phone}`}><Phone />{contact.phone}</a></div>
}

function AddChildDialog({ open, onOpenChange, onAdd }: { open: boolean; onOpenChange: (open: boolean) => void; onAdd: (data: NewChildForm) => void }) {
  const [form, setForm] = React.useState<NewChildForm>(emptyChildForm)
  const field = (key: keyof NewChildForm) => ({ value: form[key], onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((current) => ({ ...current, [key]: event.target.value })) })
  const inputClass = "h-11 w-full rounded-xl bg-[var(--kita-cloud)] px-4 text-sm font-medium outline-none ring-1 ring-[var(--kita-fog)] transition focus:ring-2 focus:ring-primary"
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-h-[86vh] overflow-y-auto sm:max-w-lg"><DialogHeader><DialogTitle className="flex items-center gap-3 text-2xl"><span className="flex size-11 items-center justify-center rounded-2xl bg-[var(--kita-mint)] text-white"><Plus /></span>Neues Kind anlegen</DialogTitle><DialogDescription>Wird lokal im Prototyp gespeichert.</DialogDescription></DialogHeader><form className="grid gap-3" onSubmit={(event) => { event.preventDefault(); onAdd(form) }}><label className="grid gap-1.5 text-sm font-semibold">Name<input required placeholder="z. B. Mila Muster" className={inputClass} {...field("name")} /></label><div className="grid grid-cols-2 gap-3"><label className="grid gap-1.5 text-sm font-semibold">Gruppe<input placeholder="Sonnengruppe" className={inputClass} {...field("group")} /></label><label className="grid gap-1.5 text-sm font-semibold">Erwartet um<input type="time" className={inputClass} {...field("expectedArrival")} /></label></div><label className="grid gap-1.5 text-sm font-semibold">Allergien<input placeholder="z. B. Erdnuss, Laktose" className={inputClass} {...field("allergies")} /></label><label className="grid gap-1.5 text-sm font-semibold">Besonderheiten<textarea rows={3} placeholder="z. B. braucht Mittagsruhe" className="w-full rounded-xl bg-[var(--kita-cloud)] px-4 py-3 text-sm font-medium outline-none ring-1 ring-[var(--kita-fog)] transition focus:ring-2 focus:ring-primary" {...field("notes")} /></label><label className="grid gap-1.5 text-sm font-semibold">Abholberechtigte (mit Komma trennen)<input placeholder="z. B. Mama Muster, Papa Muster" className={inputClass} {...field("pickup")} /></label><Button type="submit" className="mt-1 h-12 rounded-xl text-base"><UserCheck data-icon="inline-start" />Kind anlegen</Button></form></DialogContent></Dialog>
}

function WatermelonAnimations() {
  return <div className="watermelon-layer" aria-hidden="true"><span className="watermelon-slice wm-1" /><span className="watermelon-slice wm-2" /><span className="watermelon-slice wm-3" /><span className="watermelon-slice wm-4" /><span className="watermelon-seed seed-1" /><span className="watermelon-seed seed-2" /><span className="watermelon-seed seed-3" /><span className="watermelon-seed seed-4" /></div>
}

function WatermelonSplashFallback() { return <WatermelonLoadingScreen /> }
function ChildAvatar({ child, size = "md" }: { child: Child; size?: "md" | "lg" }) { return <Avatar className={cn(size === "lg" ? "size-14" : "size-12", "overflow-hidden rounded-2xl shadow-sm ring-2 ring-white")}>{child.photoUrl ? <AvatarImage src={child.photoUrl} alt={`${child.name} Profilbild`} className="rounded-2xl" /> : null}<AvatarFallback className="rounded-2xl text-base font-bold text-white" style={{ background: child.color }}>{child.initials}</AvatarFallback></Avatar> }
function ContactAvatar({ contact }: { contact: Contact }) { return <Avatar className="size-12 overflow-hidden rounded-2xl"><AvatarImage src={contact.photoUrl} alt={`${contact.name} Profilbild`} className="rounded-2xl" /><AvatarFallback className="rounded-2xl text-xs font-bold">{initialsFromName(contact.name)}</AvatarFallback></Avatar> }
function MiniField({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl bg-white p-3 ring-1 ring-[var(--kita-fog)]"><div className="text-xs font-medium text-muted-foreground">{label}</div><div className="truncate text-sm font-semibold">{value}</div></div> }
function ReportNumber({ label, value }: { label: string; value: number }) { return <div className="rounded-2xl bg-[var(--kita-cloud)] p-3 text-center"><div className="text-2xl font-semibold">{value}</div><div className="text-xs font-medium text-muted-foreground">{label}</div></div> }
