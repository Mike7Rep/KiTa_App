"use client"

import * as React from "react"
import * as THREE from "three"
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js"
import { AlertCircle, CalendarDays, Camera, Check, ChevronRight, Clock, FileText, Home, MessageCircle, Phone, Send, ShieldCheck, Sun, Thermometer, UserCheck, UserX, Users } from "lucide-react"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

type AttendanceStatus = "expected" | "present" | "gone" | "absent" | "sick"
type View = "today" | "children" | "reports" | "messages"
type Contact = { name: string; role: string; phone: string; photoUrl: string; canPickup?: boolean }
type Child = { id: string; name: string; group: string; initials: string; color: string; photoUrl: string; status: AttendanceStatus; expectedArrival: string; arrivalTime?: string; departureTime?: string; pickupBy?: string; sickReason?: string; sickTime?: string; pickupOptions: string[]; notes: string; allergies: string; contacts: Contact[]; monthDays: number; yearDays: number }

const contact = (name: string, role: string, phone: string, img: string, canPickup = true): Contact => ({ name, role, phone, photoUrl: `/profiles/${img}.svg`, canPickup })
const initialChildren: Child[] = [
  { id: "ben", name: "Ben Mueller", group: "Sonnengruppe", initials: "BM", color: "#66D6AE", photoUrl: "/profiles/ben.svg", status: "present", expectedArrival: "08:00", arrivalTime: "08:12", pickupOptions: ["Lisa Mueller", "Jonas Mueller", "Oma Ruth"], notes: "Eltern trennen sich gerade. Nur bestätigte Abholung.", allergies: "Haselnuss", contacts: [contact("Lisa Mueller", "Mutter", "+41 79 111 22 33", "parent-lisa"), contact("Jonas Mueller", "Vater", "+41 78 444 55 66", "parent-jonas"), contact("Oma Ruth", "Oma", "+41 76 222 33 44", "grandma-ruth")], monthDays: 16, yearDays: 101 },
  { id: "lina", name: "Lina Keller", group: "Regenbogengruppe", initials: "LK", color: "#FFD85A", photoUrl: "/profiles/lina.svg", status: "expected", expectedArrival: "09:00", pickupOptions: ["Mara Keller", "Theo Keller"], notes: "Braucht mittags Ruhe.", allergies: "Keine", contacts: [contact("Mara Keller", "Mutter", "+41 76 232 10 10", "parent-mara"), contact("Theo Keller", "Vater", "+41 77 909 18 18", "parent-theo")], monthDays: 13, yearDays: 88 },
  { id: "noah", name: "Noah Fischer", group: "Wolkengruppe", initials: "NF", color: "#4DA8F5", photoUrl: "/profiles/noah.svg", status: "present", expectedArrival: "08:30", arrivalTime: "08:28", pickupOptions: ["Laura Fischer", "Nico Fischer"], notes: "Sprachfoerderung Dienstag.", allergies: "Laktose", contacts: [contact("Laura Fischer", "Mutter", "+41 79 420 00 20", "parent-laura"), contact("Nico Fischer", "Vater", "+41 78 311 40 17", "parent-nico")], monthDays: 15, yearDays: 97 },
  { id: "mia", name: "Mia Schneider", group: "Sternengruppe", initials: "MS", color: "#A78BFA", photoUrl: "/profiles/mia.svg", status: "gone", expectedArrival: "07:45", arrivalTime: "07:51", departureTime: "12:20", pickupBy: "Sarah Schneider", pickupOptions: ["Sarah Schneider", "David Schneider"], notes: "Darf heute nach dem Mittag gehen.", allergies: "Erdbeeren", contacts: [contact("Sarah Schneider", "Mutter", "+41 79 502 44 41", "parent-sarah"), contact("David Schneider", "Vater", "+41 78 901 12 12", "parent-david")], monthDays: 12, yearDays: 74 },
  { id: "elia", name: "Elia Baumann", group: "Sonnengruppe", initials: "EB", color: "#FF7A70", photoUrl: "/profiles/elia.svg", status: "sick", expectedArrival: "08:15", sickReason: "Fieber", sickTime: "07:58", pickupOptions: ["Nora Baumann", "Marc Baumann"], notes: "Heute krank gemeldet.", allergies: "Penicillin", contacts: [contact("Nora Baumann", "Mutter", "+41 76 808 55 55", "parent-nora"), contact("Marc Baumann", "Vater", "+41 79 330 20 11", "parent-marc")], monthDays: 9, yearDays: 65 },
  ...["Ava","Leo","Sofia","Emil","Nina"].map((name, i) => ({ id: name.toLowerCase(), name: `${name} Testkind`, group: ["Sonnengruppe","Wolkengruppe","Sternengruppe"][i%3], initials: name.slice(0,2).toUpperCase(), color: ["#F6A6C8","#8BD450","#F59E0B","#38BDF8","#C084FC"][i], photoUrl: `/profiles/${name.toLowerCase()}.svg`, status: ["expected","present","expected","absent","present"][i] as AttendanceStatus, expectedArrival: `0${8+i}:00`, arrivalTime: i%2 ? `0${8+i}:11` : undefined, pickupOptions: ["Mama Test", "Papa Test"], notes: "Fiktives Testprofil mit neutralem Avatar.", allergies: i===2 ? "Kiwi" : "Keine", contacts: [contact("Mama Test", "Mutter", "+41 70 000 00 00", "parent-lisa"), contact("Papa Test", "Vater", "+41 71 000 00 00", "parent-jonas")], monthDays: 10+i, yearDays: 60+i*7 }))
]
const navItems: { value: View; label: string; icon: React.ElementType }[] = [{ value: "today", label: "Heute", icon: Home }, { value: "children", label: "Kinder", icon: Users }, { value: "reports", label: "Report", icon: FileText }, { value: "messages", label: "Chat", icon: MessageCircle }]
const sickReasons = ["Fieber", "Erkaeltung", "Bauchweh", "Arzttermin"]
const timeNow = () => new Intl.DateTimeFormat("de-CH", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date())
const formatCurrentDateLabel = () => `Heute, ${new Intl.DateTimeFormat("de-CH", { day: "2-digit", month: "long", timeZone: "Europe/Zurich", year: "numeric" }).format(new Date())}`
const statusLabel = (s: AttendanceStatus) => ({ present: "Eingecheckt", gone: "Abgeholt", absent: "Abgemeldet", sick: "Krank", expected: "Erwartet" })[s]
const statusClass = (s: AttendanceStatus) => ({ present: "status-present", gone: "status-gone", absent: "status-absent", sick: "status-sick", expected: "status-expected" })[s]
const childTimeText = (c: Child) => c.status === "sick" ? `${c.sickTime ?? c.expectedArrival} krank` : c.arrivalTime ? `${c.arrivalTime} Ankunft` : `${c.expectedArrival} erwartet`
const preferredIndianEnglishVoice = (voices: SpeechSynthesisVoice[]) => voices.map((voice, index) => {
  const id = `${voice.name} ${voice.lang}`.toLowerCase()
  let score = voice.lang.toLowerCase() === "en-in" ? 8 : voice.lang.toLowerCase().startsWith("en") ? 1 : 0
  if (id.includes("india") || id.includes("indian")) score += 5
  if (/\b(ravi|rishi|arjun|rahul|amit|raj)\b/.test(id)) score += 4
  if (id.includes("female") || /\b(aditi|heera|lekha)\b/.test(id)) score -= 6
  else if (id.includes("male")) score += 3
  return { index, score, voice }
}).filter(({ score }) => score > 0).sort((a, b) => b.score - a.score || a.index - b.index)[0]?.voice

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

function useKitaSounds() {
  const ctx = React.useRef<AudioContext | null>(null)
  const tone = React.useCallback((freq: number, duration: number, type: OscillatorType = "sine") => { const AC = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext; if (!AC) return; ctx.current ??= new AC(); const o = ctx.current.createOscillator(); const g = ctx.current.createGain(); o.type = type; o.frequency.value = freq; g.gain.setValueAtTime(.0001, ctx.current.currentTime); g.gain.exponentialRampToValueAtTime(.12, ctx.current.currentTime+.02); g.gain.exponentialRampToValueAtTime(.0001, ctx.current.currentTime+duration); o.connect(g).connect(ctx.current.destination); o.start(); o.stop(ctx.current.currentTime+duration) }, [])
  React.useEffect(() => { if ("speechSynthesis" in window) window.speechSynthesis.getVoices() }, [])
  const speak = React.useCallback((text: string) => { if (!("speechSynthesis" in window)) return; const u = new SpeechSynthesisUtterance(text); const voice = preferredIndianEnglishVoice(window.speechSynthesis.getVoices()); u.lang = voice?.lang ?? "en-IN"; u.voice = voice ?? null; u.pitch = .72; u.rate = .86; window.speechSynthesis.cancel(); window.speechSynthesis.speak(u) }, [])
  return React.useMemo(() => ({ poing: () => tone(520, .16, "triangle"), sad: () => { tone(220,.22,"sawtooth"); setTimeout(()=>tone(155,.28,"sawtooth"),180) }, welcome: () => speak("Welcome"), goodbye: () => speak("Goodbye") }), [speak, tone])
}

export function KitaPrototype() {
  const [children, setChildren] = React.useState(initialChildren), [activeView, setActiveView] = React.useState<View>("today"), [selectedChildId, setSelectedChildId] = React.useState(initialChildren[0].id)
  const [profileOpen, setProfileOpen] = React.useState(false), [pickupChildId, setPickupChildId] = React.useState<string | null>(null), [photoReadyId, setPhotoReadyId] = React.useState<string | null>(null), [showSplash, setShowSplash] = React.useState(true), [lost, setLost] = React.useState(5), [sadRain, setSadRain] = React.useState(false)
  const currentDateLabel = useCurrentDateLabel()
  const sounds = useKitaSounds(); const selectedChild = children.find((c) => c.id === selectedChildId) ?? children[0]; const pickupChild = children.find((c) => c.id === pickupChildId)
  const counts = { present: children.filter(c=>c.status==="present").length, expected: children.filter(c=>c.status==="expected").length, gone: children.filter(c=>c.status==="gone").length, sick: children.filter(c=>c.status==="sick").length }
  React.useEffect(() => { const timer = setTimeout(()=>{ setSadRain(true); sounds.sad(); setLost(v=>v+1); setTimeout(()=>setSadRain(false), 3200) }, 10000); return () => { clearTimeout(timer) } }, [sounds])
  const click = <T extends unknown[]>(fn: (...args: T) => void) => (...args: T) => { sounds.poing(); fn(...args) }
  const checkInChild = (id: string) => { sounds.welcome(); setChildren(items => items.map(c => c.id===id ? { ...c, status:"present", arrivalTime:c.arrivalTime ?? timeNow(), departureTime:undefined, pickupBy:undefined, sickReason:undefined, sickTime:undefined } : c)); setSelectedChildId(id) }
  const checkOutChild = (id: string, pickupBy: string) => { sounds.goodbye(); setChildren(items => items.map(c => c.id===id ? { ...c, status:"gone", departureTime:timeNow(), pickupBy } : c)); setPickupChildId(null); setSelectedChildId(id) }
  const markSickChild = (id: string, reason: string) => { setChildren(items => items.map(c => c.id===id ? { ...c, status:"sick", arrivalTime:undefined, departureTime:undefined, pickupBy:undefined, sickReason:reason, sickTime:timeNow() } : c)); setSelectedChildId(id) }
  return <main className="flex min-h-screen items-center justify-center bg-neutral-300 p-5">{showSplash ? <WatermelonSplash onDone={()=>setShowSplash(false)} /> : null}{sadRain ? <SadSmileyRain /> : null}<div className="ipad-frame"><div className="ipad-camera"/><div className="ipad-screen"><WatermelonAnimations /><Tabs value={activeView} onValueChange={(v)=>click(setActiveView)(v as View)} orientation="vertical" className="relative h-full min-h-0 gap-4"><TabsList className="h-full w-[86px] flex-col justify-start gap-3 rounded-[24px] bg-[var(--kita-cloud)] p-3 text-[var(--kita-ink)]"><div className="mb-2 flex size-12 items-center justify-center rounded-2xl bg-[var(--kita-sun)] text-[var(--kita-ink)]"><Sun /></div>{navItems.map((item)=><TabsTrigger key={item.value} value={item.value} aria-label={item.label} className="h-16 w-full flex-col rounded-2xl px-2 py-2 text-xs data-active:bg-white data-active:text-primary data-active:shadow-sm"><item.icon data-icon="inline-start" />{item.label}</TabsTrigger>)}</TabsList><div className="min-w-0 flex-1"><TabsContent value="today" className="h-full"><TodayView kids={children} selectedChild={selectedChild} counts={counts} lost={lost} currentDateLabel={currentDateLabel} photoReadyId={photoReadyId} onCheckIn={click(checkInChild)} onOpenPickup={click(setPickupChildId)} onMarkSick={click(markSickChild)} onOpenProfile={click((id)=>{setSelectedChildId(id); setProfileOpen(true)})} onSelectChild={click(setSelectedChildId)} onPhotoReady={click(setPhotoReadyId)} onShowMessages={click(()=>setActiveView("messages"))} onShowReports={click(()=>setActiveView("reports"))}/></TabsContent><TabsContent value="children" className="h-full"><ChildrenView kids={children} onOpenProfile={click((id)=>{setSelectedChildId(id); setProfileOpen(true)})} onSelectChild={click(setSelectedChildId)} /></TabsContent><TabsContent value="reports" className="h-full"><ReportsView kids={children}/></TabsContent><TabsContent value="messages" className="h-full"><MessagesView kids={children} photoReadyId={photoReadyId} onPhotoReady={click(setPhotoReadyId)} /></TabsContent></div></Tabs></div></div><ProfileDialog child={selectedChild} open={profileOpen} onOpenChange={setProfileOpen}/><PickupDialog child={pickupChild} onClose={()=>setPickupChildId(null)} onPick={click(checkOutChild)}/></main>
}

function TodayView({ kids, selectedChild, counts, lost, currentDateLabel, photoReadyId, onCheckIn, onOpenPickup, onMarkSick, onOpenProfile, onSelectChild, onPhotoReady, onShowMessages, onShowReports }: { kids: Child[]; selectedChild: Child; counts: {present:number; expected:number; gone:number; sick:number}; lost:number; currentDateLabel:string; photoReadyId: string | null; onCheckIn:(id:string)=>void; onOpenPickup:(id:string)=>void; onMarkSick:(id:string,r:string)=>void; onOpenProfile:(id:string)=>void; onSelectChild:(id:string)=>void; onPhotoReady:(id:string)=>void; onShowMessages:()=>void; onShowReports:()=>void }) { return <div className="grid h-full min-h-0 grid-cols-[1fr_360px] gap-4"><section className="flex min-h-0 flex-col gap-4"><div className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,var(--kita-blue),var(--kita-petrol))] p-6 text-white shadow-sm"><div className="hero-watermelon-cluster" aria-hidden="true"><span className="hero-watermelon"/><span className="hero-watermelon hero-watermelon-small"/><span className="hero-watermelon-seed"/></div><div className="flex items-start justify-between gap-6"><div><h1 className="text-4xl font-semibold leading-tight">KiTa Heute</h1><div className="lost-goal">Ziel 2026: weniger als 10 verlorene Kinder -- Stand <b>{lost}/10</b></div></div><div className="relative z-10 flex flex-col items-end gap-3"><div className="flex items-center gap-2 rounded-2xl bg-white/16 px-4 py-2 text-sm font-semibold" aria-live="polite"><CalendarDays />{currentDateLabel}</div><div className="flex items-center gap-3 rounded-2xl bg-white/16 px-4 py-3"><ShieldCheck /><span className="text-3xl font-semibold">{counts.present}</span></div></div></div></div><div className="grid grid-cols-4 gap-3"><Metric label="Anwesend" value={counts.present} tone="mint"/><Metric label="Erwartet" value={counts.expected} tone="sun"/><Metric label="Abgeholt" value={counts.gone} tone="lavender"/><Metric label="Krank" value={counts.sick} tone="coral"/></div><ScrollArea className="min-h-0 flex-1 rounded-[24px] bg-[var(--kita-cloud)] p-3"><div className="flex flex-col gap-3 pr-2">{kids.map(child=><ChildRow key={child.id} child={child} selected={selectedChild.id===child.id} onCheckIn={onCheckIn} onOpenPickup={onOpenPickup} onOpenProfile={onOpenProfile} onSelectChild={onSelectChild}/>)}</div></ScrollArea></section><aside className="flex min-h-0 flex-col gap-4"><SelectedChildCard child={selectedChild} photoReady={photoReadyId===selectedChild.id} onOpenProfile={onOpenProfile} onMarkSick={onMarkSick} onPhotoReady={onPhotoReady} onShowMessages={onShowMessages} onShowReports={onShowReports}/><Card className="rounded-[24px] border-0 bg-[var(--kita-mint)]/20 ring-0"><CardContent className="flex items-center gap-4"><div className="flex size-14 items-center justify-center rounded-2xl bg-[var(--kita-mint)] text-white"><Check /></div><div><p className="text-base font-semibold">Sicher angekommen</p><p className="text-sm text-muted-foreground">{counts.present} Kinder</p></div></CardContent></Card></aside></div> }
function Metric({label,value,tone}:{label:string; value:number; tone:"mint"|"sun"|"lavender"|"coral"}) { const toneClass={mint:"bg-[var(--kita-mint)]/22",sun:"bg-[var(--kita-sun)]/28",lavender:"bg-[var(--kita-lavender)]/20",coral:"bg-[var(--kita-coral)]/18"}[tone]; return <div className={cn("rounded-[22px] px-5 py-4", toneClass)}><div className="text-3xl font-semibold">{value}</div><div className="text-sm font-medium text-muted-foreground">{label}</div></div> }
function ChildRow({child, selected, onCheckIn, onOpenPickup, onOpenProfile, onSelectChild}:{child:Child; selected:boolean; onCheckIn:(id:string)=>void; onOpenPickup:(id:string)=>void; onOpenProfile:(id:string)=>void; onSelectChild:(id:string)=>void}) { const canCheckIn=child.status==="expected"||child.status==="absent"||child.status==="sick"; return <Card data-testid={`child-row-${child.id}`} className={cn("rounded-[18px] border-0 py-3 ring-1 ring-[var(--kita-fog)] transition hover:-translate-y-0.5", selected && "ring-2 ring-primary")} style={{borderLeft:`6px solid ${child.color}`}} onClick={()=>onSelectChild(child.id)}><CardContent className="grid grid-cols-[58px_1fr_auto] items-center gap-4"><ChildAvatar child={child}/><div className="min-w-0"><div className="flex items-center gap-2"><h2 className="truncate text-lg font-semibold">{child.name}</h2><Badge className={cn("border-0", statusClass(child.status))}>{statusLabel(child.status)}</Badge></div><div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground"><span>{child.group}</span><span>·</span><span>{childTimeText(child)}</span>{child.sickReason?<><span>·</span><span>{child.sickReason}</span></>:null}</div></div><div className="flex items-center gap-2">{canCheckIn?<Button data-testid={`check-in-${child.id}`} onClick={(e)=>{e.stopPropagation(); onCheckIn(child.id)}}><UserCheck data-icon="inline-start"/>Ankunft</Button>:null}{child.status==="present"?<Button data-testid={`check-out-${child.id}`} variant="outline" onClick={(e)=>{e.stopPropagation(); onOpenPickup(child.id)}}><UserX data-icon="inline-start"/>Abholen</Button>:null}<Button variant="ghost" size="icon" aria-label={`${child.name} Profil`} onClick={(e)=>{e.stopPropagation(); onOpenProfile(child.id)}}><ChevronRight /></Button></div></CardContent></Card> }
function SelectedChildCard({child, photoReady, onOpenProfile, onMarkSick, onPhotoReady, onShowMessages, onShowReports}:{child:Child; photoReady:boolean; onOpenProfile:(id:string)=>void; onMarkSick:(id:string,r:string)=>void; onPhotoReady:(id:string)=>void; onShowMessages:()=>void; onShowReports:()=>void}) { const sickInfo = child.status==="sick" ? child.sickReason ?? "Krank" : undefined; return <Card className="min-h-0 flex-1 rounded-[24px] border-0 py-5 ring-1 ring-[var(--kita-fog)]"><CardHeader><CardTitle className="flex items-center gap-3 text-2xl"><ChildAvatar child={child} size="lg"/><span className="truncate">{child.name}</span></CardTitle><CardDescription>{child.group}</CardDescription><CardAction><Badge className={cn("border-0", statusClass(child.status))}>{statusLabel(child.status)}</Badge></CardAction></CardHeader><CardContent className="flex flex-col gap-4"><div className="grid grid-cols-2 gap-3"><InfoTile icon={Clock} label="Ankunft" value={childTimeText(child)}/><InfoTile icon={sickInfo?Thermometer:UserCheck} label={sickInfo?"Krank":"Abholung"} value={sickInfo ?? child.pickupBy ?? "-"}/></div><div className="rounded-2xl bg-[var(--kita-cloud)] p-4"><div className="mb-2 flex items-center gap-2 text-sm font-semibold"><AlertCircle />Besonderheiten</div><p className="text-sm leading-6 text-muted-foreground">{child.notes}</p></div><div className="rounded-2xl bg-[var(--kita-coral)]/10 p-3"><div className="mb-2 text-sm font-semibold">Krankmeldung direkt erfassen</div><div className="grid grid-cols-2 gap-2">{sickReasons.map(r=><Button key={r} size="sm" variant={child.sickReason===r?"secondary":"outline"} onClick={()=>onMarkSick(child.id,r)}><Thermometer data-icon="inline-start"/>{r}</Button>)}</div></div><div className="grid grid-cols-2 gap-3"><Button variant="outline" onClick={()=>onOpenProfile(child.id)}><Users data-icon="inline-start"/>Profil</Button><Button variant="outline" onClick={onShowReports}><FileText data-icon="inline-start"/>Report</Button><Button variant="outline" onClick={onShowMessages}><Send data-icon="inline-start"/>WhatsApp</Button><Button variant={photoReady?"secondary":"outline"} onClick={()=>onPhotoReady(child.id)}><Camera data-icon="inline-start"/>{photoReady?"Foto bereit":"Foto"}</Button></div></CardContent></Card> }
function InfoTile({icon:Icon,label,value}:{icon:React.ElementType; label:string; value:string}) { return <div className="rounded-2xl bg-[var(--kita-cloud)] p-4"><Icon className="mb-3 text-primary"/><div className="text-xs font-medium text-muted-foreground">{label}</div><div className="truncate text-base font-semibold">{value}</div></div> }
function ChildrenView({kids,onOpenProfile,onSelectChild}:{kids:Child[]; onOpenProfile:(id:string)=>void; onSelectChild:(id:string)=>void}) { return <section className="flex h-full min-h-0 flex-col gap-4"><HeaderBar title="Kinder" value={kids.length}/><ScrollArea className="min-h-0 flex-1 rounded-[24px] bg-[var(--kita-cloud)] p-3"><div className="grid grid-cols-2 gap-3 pr-2">{kids.map(child=><Card key={child.id} className="rounded-[20px] border-0 ring-1 ring-[var(--kita-fog)]"><CardHeader><CardTitle className="flex items-center gap-3 text-xl"><ChildAvatar child={child}/><span className="truncate">{child.name}</span></CardTitle><CardDescription>{child.group}</CardDescription><CardAction><Badge className={cn("border-0", statusClass(child.status))}>{statusLabel(child.status)}</Badge></CardAction></CardHeader><CardContent className="flex flex-col gap-3"><div className="grid grid-cols-3 gap-2 text-sm"><MiniField label="Allergie" value={child.allergies}/><MiniField label="Monat" value={`${child.monthDays} Tage`}/><MiniField label="Status" value={child.sickReason ?? statusLabel(child.status)}/></div><Button variant="outline" onClick={()=>{onSelectChild(child.id); onOpenProfile(child.id)}}>Profil</Button></CardContent></Card>)}</div></ScrollArea></section> }
function ReportsView({kids}:{kids:Child[]}) { return <section className="flex h-full min-h-0 flex-col gap-4"><HeaderBar title="Reports" value="Juni 2026"/><ScrollArea className="min-h-0 flex-1 rounded-[24px] bg-[var(--kita-cloud)] p-3"><div className="flex flex-col gap-3 pr-2">{kids.map(child=><Card key={child.id} className="rounded-[20px] border-0 py-4 ring-1 ring-[var(--kita-fog)]"><CardContent className="grid grid-cols-[58px_1fr_120px_120px] items-center gap-4"><ChildAvatar child={child}/><div><h2 className="truncate text-lg font-semibold">{child.name}</h2><p className="text-sm text-muted-foreground">{child.group}</p></div><ReportNumber label="Monat" value={child.monthDays}/><ReportNumber label="Jahr" value={child.yearDays}/></CardContent></Card>)}</div></ScrollArea></section> }
function MessagesView({kids,photoReadyId,onPhotoReady}:{kids:Child[]; photoReadyId:string|null; onPhotoReady:(id:string)=>void}) { return <section className="flex h-full min-h-0 flex-col gap-4"><HeaderBar title="WhatsApp" value="Eltern"/><ScrollArea className="min-h-0 flex-1 rounded-[24px] bg-[var(--kita-cloud)] p-3"><div className="grid grid-cols-2 gap-3 pr-2">{kids.map(child=>{ const message=encodeURIComponent(`Hallo, kurze Info aus der KiTa: ${child.name} ist ${statusLabel(child.status).toLowerCase()}.`); return <Card key={child.id} className="rounded-[20px] border-0 ring-1 ring-[var(--kita-fog)]"><CardHeader><CardTitle className="flex items-center gap-3 text-xl"><ChildAvatar child={child}/><span className="truncate">{child.name}</span></CardTitle><CardDescription>{child.contacts[0].name}</CardDescription></CardHeader><CardContent className="grid grid-cols-2 gap-3"><Button nativeButton={false} render={<a href={`https://wa.me/?text=${message}`} target="_blank" rel="noreferrer"/>}><Send data-icon="inline-start"/>Senden</Button><Button variant={photoReadyId===child.id?"secondary":"outline"} onClick={()=>onPhotoReady(child.id)}><Camera data-icon="inline-start"/>Foto</Button></CardContent></Card>})}</div></ScrollArea></section> }
function HeaderBar({title,value}:{title:string; value:string|number}) { return <div className="flex items-center justify-between rounded-[28px] bg-[linear-gradient(135deg,var(--kita-blue),var(--kita-petrol))] p-6 text-white shadow-sm"><h1 className="text-4xl font-semibold">{title}</h1><div className="rounded-2xl bg-white/16 px-5 py-3 text-2xl font-semibold">{value}</div></div> }
function ProfileDialog({child,open,onOpenChange}:{child:Child; open:boolean; onOpenChange:(open:boolean)=>void}) { return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="sm:max-w-2xl"><DialogHeader><DialogTitle className="flex items-center gap-3 text-2xl"><ChildAvatar child={child}/>{child.name}</DialogTitle><DialogDescription className="sr-only">Profil, Besonderheiten, Allergien und Kontakte</DialogDescription></DialogHeader><div className="grid gap-4"><div className="grid grid-cols-2 gap-3"><MiniField label="Gruppe" value={child.group}/><MiniField label="Allergie" value={child.allergies}/></div><div className="rounded-2xl bg-[var(--kita-cloud)] p-4"><div className="mb-2 text-sm font-semibold">Besonderheiten</div><p className="text-sm leading-6 text-muted-foreground">{child.notes}</p></div><Separator/><div className="grid gap-2">{child.contacts.map(contact=><div key={contact.phone} className="grid grid-cols-[52px_1fr_auto] items-center gap-3 rounded-2xl bg-[var(--kita-cloud)] p-3"><img src={contact.photoUrl} alt="" className="size-12 rounded-2xl object-cover"/><div><div className="font-semibold">{contact.name}</div><div className="text-sm text-muted-foreground">{contact.role}{contact.canPickup ? " · darf abholen" : ""}</div></div><a className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-primary ring-1 ring-[var(--kita-fog)]" href={`tel:${contact.phone}`}><Phone />{contact.phone}</a></div>)}</div></div></DialogContent></Dialog> }
function PickupDialog({child,onClose,onPick}:{child?:Child; onClose:()=>void; onPick:(id:string,pickupBy:string)=>void}) { return <Dialog open={Boolean(child)} onOpenChange={(open)=>!open&&onClose()}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>{child?`${child.name} abholen`:"Abholen"}</DialogTitle><DialogDescription className="sr-only">Abholung mit abholender Person erfassen</DialogDescription></DialogHeader><div className="flex flex-col gap-2">{child?.pickupOptions.map(person=><Button key={person} variant="outline" onClick={()=>onPick(child.id,person)}><UserCheck data-icon="inline-start"/>{person}</Button>)}</div></DialogContent></Dialog> }
function WatermelonAnimations() { return <div className="watermelon-layer" aria-hidden="true"><span className="watermelon-slice wm-1"/><span className="watermelon-slice wm-2"/><span className="watermelon-slice wm-3"/><span className="watermelon-slice wm-4"/><span className="watermelon-seed seed-1"/><span className="watermelon-seed seed-2"/><span className="watermelon-seed seed-3"/><span className="watermelon-seed seed-4"/></div> }
const makeRindTexture = () => {
  const canvas = document.createElement("canvas")
  canvas.width = 2048
  canvas.height = 1024
  const g = canvas.getContext("2d")!
  const base = g.createLinearGradient(0, 0, 0, canvas.height)
  base.addColorStop(0, "#14602f")
  base.addColorStop(0.5, "#238747")
  base.addColorStop(1, "#11552a")
  g.fillStyle = base
  g.fillRect(0, 0, canvas.width, canvas.height)
  for (let i = 0; i < 2400; i++) { g.fillStyle = `rgba(255,255,255,${Math.random() * 0.04})`; g.beginPath(); g.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1 + Math.random() * 7, 0, Math.PI * 2); g.fill() }
  const stripes = 14
  g.strokeStyle = "rgb(5 54 29)"
  g.lineCap = "round"
  for (let s = 0; s < stripes; s++) {
    const cx = (s + 0.5) * (canvas.width / stripes)
    for (let k = 0; k < 26; k++) {
      g.lineWidth = 30 + Math.random() * 40
      g.globalAlpha = 0.3 + Math.random() * 0.28
      g.beginPath()
      g.moveTo(cx + (Math.random() - 0.5) * 44, -30)
      for (let y = 0; y <= canvas.height + 60; y += 60) g.lineTo(cx + Math.sin(y * 0.012 + s * 2.1 + k * 0.7) * 26 + (Math.random() - 0.5) * 26, y)
      g.stroke()
    }
  }
  g.globalAlpha = 1
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = THREE.RepeatWrapping
  tex.anisotropy = 8
  return tex
}
const smoothstep = (a: number, b: number, x: number) => { const k = Math.min(Math.max((x - a) / (b - a), 0), 1); return k * k * (3 - 2 * k) }
const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3)
const easeOutBack = (x: number) => { const c1 = 1.70158; const c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2) }

function WatermelonSplash({ onDone }: { onDone: () => void }) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)
  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 0.95
    const scene = new THREE.Scene()
    const pmrem = new THREE.PMREMGenerator(renderer)
    const envMap = pmrem.fromScene(new RoomEnvironment(), 0.06).texture
    scene.environment = envMap
    const camera = new THREE.PerspectiveCamera(34, window.innerWidth / window.innerHeight, 0.1, 100)
    camera.position.set(0, 0.12, 7.6)
    const fitCamera = () => { const vFov = (34 * Math.PI) / 180; const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect); camera.position.z = Math.max(7.2, 2.3 / Math.tan(Math.min(vFov, hFov) / 2)) }
    fitCamera()
    const key = new THREE.DirectionalLight(0xffffff, 1.6)
    key.position.set(3.5, 4.5, 5)
    scene.add(key)
    const rim = new THREE.PointLight(0xbfffe0, 40, 14)
    rim.position.set(-4.5, 1.6, 3.5)
    scene.add(rim)

    const group = new THREE.Group()
    scene.add(group)
    const rindTex = makeRindTexture()
    const rind = new THREE.MeshPhysicalMaterial({ map: rindTex, roughness: 0.28, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.14, sheen: 0.25, sheenColor: new THREE.Color(0xa7f3c9), envMapIntensity: 0.45 })
    const geo = new THREE.SphereGeometry(1.5, 150, 100)
    const posAttr = geo.getAttribute("position") as THREE.BufferAttribute
    const vertexCount = posAttr.count
    const dirs = new Float32Array(vertexCount * 3)
    for (let i = 0; i < vertexCount; i++) { dirs[i * 3] = posAttr.getX(i) / 1.5; dirs[i * 3 + 1] = posAttr.getY(i) / 1.5; dirs[i * 3 + 2] = posAttr.getZ(i) / 1.5 }
    const deform = (t: number, amp: number) => {
      for (let i = 0; i < vertexCount; i++) {
        const nx = dirs[i * 3], ny = dirs[i * 3 + 1], nz = dirs[i * 3 + 2]
        const w = Math.sin(nx * 3.2 + t * 1.3) * 0.5 + Math.sin(ny * 4.1 - t * 1.1) * 0.34 + Math.sin(nz * 2.6 + nx * 2.2 + t * 1.6) * 0.42 + Math.sin((nx + ny + nz) * 4.6 - t * 0.8) * 0.22
        const r = 1.5 * (1 + w * amp)
        posAttr.setXYZ(i, nx * r, ny * r, nz * r)
      }
      posAttr.needsUpdate = true
      geo.computeVertexNormals()
    }
    const melon = new THREE.Mesh(geo, rind)
    group.add(melon)

    const faceMat = new THREE.MeshPhysicalMaterial({ color: 0x131313, roughness: 0.14, clearcoat: 1, clearcoatRoughness: 0.08, transparent: true, opacity: 0 })
    const cheekMat = new THREE.MeshPhysicalMaterial({ color: 0xff8fa0, roughness: 0.5, transparent: true, opacity: 0 })
    const faceRadius = 1.66
    const surfacePoint = (x: number, y: number) => new THREE.Vector3(x, y, Math.sqrt(Math.max(faceRadius * faceRadius - x * x - y * y, 0.3)))
    const eyes: THREE.Mesh[] = []
    ;[[-0.52, 0.46], [0.52, 0.46]].forEach(([x, y]) => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.13, 32, 24), faceMat)
      eye.position.copy(surfacePoint(x, y).setLength(faceRadius))
      eye.lookAt(eye.position.clone().multiplyScalar(2))
      eye.scale.set(0.9, 1.2, 0.45)
      group.add(eye)
      eyes.push(eye)
    })
    ;[[-0.86, -0.02], [0.86, -0.02]].forEach(([x, y]) => {
      const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.17, 24, 16), cheekMat)
      cheek.position.copy(surfacePoint(x, y).setLength(faceRadius - 0.03))
      cheek.lookAt(cheek.position.clone().multiplyScalar(2))
      cheek.scale.set(1, 0.72, 0.3)
      group.add(cheek)
    })
    const smileAnchor = new THREE.Vector3(0, -0.1, faceRadius - 0.04)
    const smilePoints: THREE.Vector3[] = []
    for (let i = 0; i <= 24; i++) {
      const s = i / 24
      const x = (s - 0.5) * 1.14
      const y = -0.2 + Math.pow((s - 0.5) * 2, 2) * 0.36
      smilePoints.push(surfacePoint(x, y).setLength(faceRadius + 0.015).sub(smileAnchor))
    }
    const smileGroup = new THREE.Group()
    smileGroup.position.copy(smileAnchor)
    const smileCurve = new THREE.CatmullRomCurve3(smilePoints)
    smileGroup.add(new THREE.Mesh(new THREE.TubeGeometry(smileCurve, 48, 0.055, 16), faceMat))
    ;[smilePoints[0], smilePoints[smilePoints.length - 1]].forEach((p) => {
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 12), faceMat)
      cap.position.copy(p)
      smileGroup.add(cap)
    })
    group.add(smileGroup)

    let raf = 0
    const start = performance.now()
    const loadedTimer = window.setTimeout(onDone, 5000)
    const onResize = () => { renderer.setSize(window.innerWidth, window.innerHeight); camera.aspect = window.innerWidth / window.innerHeight; fitCamera(); camera.updateProjectionMatrix() }
    window.addEventListener("resize", onResize)
    const animate = () => {
      const t = (performance.now() - start) / 1000
      const spin = easeOutCubic(Math.min(t / 2.6, 1))
      group.rotation.y = spin * Math.PI * 4
      group.rotation.x = Math.sin(t * 2) * 0.06 * (1 - spin * 0.5)
      group.rotation.z = Math.sin(t * 1.7) * 0.05 * (1 - spin * 0.6)
      group.position.y = Math.sin(t * 2.2) * 0.09 * (1 - spin * 0.5)
      deform(t, 0.2 - 0.13 * smoothstep(1.6, 2.6, t))
      const faceIn = smoothstep(2.35, 2.85, t)
      faceMat.opacity = faceIn
      cheekMat.opacity = faceIn * 0.85
      const grin = easeOutBack(smoothstep(2.9, 3.7, t))
      smileGroup.scale.set(0.45 + 0.55 * grin, 0.2 + 0.8 * grin, 0.6 + 0.4 * grin)
      const blink = Math.max(0, 1 - Math.abs((t - 4.15) / 0.12))
      eyes.forEach((eye) => { eye.scale.y = 1.2 * (1 - 0.88 * blink) })
      group.scale.setScalar(1 + Math.sin(t * 3.1) * 0.02 + faceIn * 0.05)
      renderer.render(scene, camera)
      raf = requestAnimationFrame(animate)
    }
    animate()
    return () => {
      window.clearTimeout(loadedTimer)
      window.removeEventListener("resize", onResize)
      cancelAnimationFrame(raf)
      scene.traverse((obj) => { if (obj instanceof THREE.Mesh) { obj.geometry.dispose(); const mat = obj.material; if (Array.isArray(mat)) mat.forEach((m) => m.dispose()); else mat.dispose() } })
      rindTex.dispose()
      envMap.dispose()
      pmrem.dispose()
      renderer.dispose()
    }
  }, [onDone])
  return <div className="watermelon-splash" aria-label="Three.js Wassermelonen-Blob Intro"><canvas ref={canvasRef} className="watermelon-three-canvas" /><p>Award Winning KiTa</p></div>
}
function SadSmileyRain() { return <div className="sad-smiley-rain" aria-hidden="true">{Array.from({length:38},(_,i)=>{ const angle = (i / 38) * Math.PI * 2; const distance = 18 + (i % 7) * 7; const style = { "--burst-rotate": `${(i % 2 ? 1 : -1) * (160 + i * 19)}deg`, "--burst-scale": `${.72 + (i % 5) * .12}`, "--burst-x": `${Math.cos(angle) * distance}vw`, "--burst-y": `${Math.sin(angle) * distance}vh`, animationDelay: `${(i % 9) * .025}s` } as React.CSSProperties; return <span key={i} className="sad-smiley" style={style}/> })}</div> }
function ChildAvatar({child,size="md"}:{child:Child; size?:"md"|"lg"}) { return <Avatar className={cn(size==="lg"?"size-14":"size-12", "overflow-hidden rounded-2xl")}><AvatarImage src={child.photoUrl} alt={`${child.name} Profilbild`} className="rounded-2xl" /></Avatar> }
function MiniField({label,value}:{label:string; value:string}) { return <div className="rounded-2xl bg-[var(--kita-cloud)] p-3"><div className="text-xs font-medium text-muted-foreground">{label}</div><div className="truncate text-sm font-semibold">{value}</div></div> }
function ReportNumber({label,value}:{label:string; value:number}) { return <div className="rounded-2xl bg-[var(--kita-cloud)] p-3 text-center"><div className="text-2xl font-semibold">{value}</div><div className="text-xs font-medium text-muted-foreground">{label}</div></div> }
