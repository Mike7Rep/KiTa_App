"use client"

import * as React from "react"
import {
  AlertCircle,
  CalendarDays,
  Camera,
  Check,
  ChevronRight,
  Clock,
  FileText,
  Home,
  MessageCircle,
  Phone,
  Send,
  ShieldCheck,
  Sun,
  Thermometer,
  UserCheck,
  UserX,
  Users,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

type AttendanceStatus = "expected" | "present" | "gone" | "absent" | "sick"
type View = "today" | "children" | "reports" | "messages"

type Child = {
  id: string
  name: string
  group: string
  initials: string
  color: string
  status: AttendanceStatus
  expectedArrival: string
  arrivalTime?: string
  departureTime?: string
  pickupBy?: string
  sickReason?: string
  sickTime?: string
  pickupOptions: string[]
  notes: string
  allergies: string
  contacts: { name: string; role: string; phone: string }[]
  monthDays: number
  yearDays: number
}

const initialChildren: Child[] = [
  {
    id: "ben",
    name: "Ben Mueller",
    group: "Sonnengruppe",
    initials: "BM",
    color: "#66D6AE",
    status: "present",
    expectedArrival: "08:00",
    arrivalTime: "08:12",
    pickupOptions: ["Lisa Mueller", "Jonas Mueller", "Oma Ruth"],
    notes: "Eltern trennen sich gerade. Nur bestätigte Abholung.",
    allergies: "Haselnuss",
    contacts: [
      { name: "Lisa Mueller", role: "Mutter", phone: "+41 79 111 22 33" },
      { name: "Jonas Mueller", role: "Vater", phone: "+41 78 444 55 66" },
    ],
    monthDays: 16,
    yearDays: 101,
  },
  {
    id: "lina",
    name: "Lina Keller",
    group: "Regenbogengruppe",
    initials: "LK",
    color: "#FFD85A",
    status: "expected",
    expectedArrival: "09:00",
    pickupOptions: ["Mara Keller", "Theo Keller"],
    notes: "Braucht mittags Ruhe.",
    allergies: "Keine",
    contacts: [
      { name: "Mara Keller", role: "Mutter", phone: "+41 76 232 10 10" },
      { name: "Theo Keller", role: "Vater", phone: "+41 77 909 18 18" },
    ],
    monthDays: 13,
    yearDays: 88,
  },
  {
    id: "noah",
    name: "Noah Fischer",
    group: "Wolkengruppe",
    initials: "NF",
    color: "#4DA8F5",
    status: "present",
    expectedArrival: "08:30",
    arrivalTime: "08:28",
    pickupOptions: ["Laura Fischer", "Nico Fischer"],
    notes: "Sprachfoerderung Dienstag.",
    allergies: "Laktose",
    contacts: [
      { name: "Laura Fischer", role: "Mutter", phone: "+41 79 420 00 20" },
      { name: "Nico Fischer", role: "Vater", phone: "+41 78 311 40 17" },
    ],
    monthDays: 15,
    yearDays: 97,
  },
  {
    id: "mia",
    name: "Mia Schneider",
    group: "Sternengruppe",
    initials: "MS",
    color: "#A78BFA",
    status: "gone",
    expectedArrival: "07:45",
    arrivalTime: "07:51",
    departureTime: "12:20",
    pickupBy: "Sarah Schneider",
    pickupOptions: ["Sarah Schneider", "David Schneider"],
    notes: "Darf heute nach dem Mittag gehen.",
    allergies: "Erdbeeren",
    contacts: [
      { name: "Sarah Schneider", role: "Mutter", phone: "+41 79 502 44 41" },
      { name: "David Schneider", role: "Vater", phone: "+41 78 901 12 12" },
    ],
    monthDays: 12,
    yearDays: 74,
  },
  {
    id: "elia",
    name: "Elia Baumann",
    group: "Sonnengruppe",
    initials: "EB",
    color: "#FF7A70",
    status: "sick",
    expectedArrival: "08:15",
    sickReason: "Fieber",
    sickTime: "07:58",
    pickupOptions: ["Nora Baumann", "Marc Baumann"],
    notes: "Heute krank gemeldet.",
    allergies: "Penicillin",
    contacts: [
      { name: "Nora Baumann", role: "Mutter", phone: "+41 76 808 55 55" },
      { name: "Marc Baumann", role: "Vater", phone: "+41 79 330 20 11" },
    ],
    monthDays: 9,
    yearDays: 65,
  },
]

const navItems: { value: View; label: string; icon: React.ElementType }[] = [
  { value: "today", label: "Heute", icon: Home },
  { value: "children", label: "Kinder", icon: Users },
  { value: "reports", label: "Report", icon: FileText },
  { value: "messages", label: "Chat", icon: MessageCircle },
]

const sickReasons = ["Fieber", "Erkaeltung", "Bauchweh", "Arzttermin"]

function timeNow() {
  return new Intl.DateTimeFormat("de-CH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date())
}

function statusLabel(status: AttendanceStatus) {
  if (status === "present") return "Eingecheckt"
  if (status === "gone") return "Abgeholt"
  if (status === "absent") return "Abgemeldet"
  if (status === "sick") return "Krank"
  return "Erwartet"
}

function statusClass(status: AttendanceStatus) {
  if (status === "present") return "status-present"
  if (status === "gone") return "status-gone"
  if (status === "absent") return "status-absent"
  if (status === "sick") return "status-sick"
  return "status-expected"
}

function childTimeText(child: Child) {
  if (child.status === "sick") {
    return `${child.sickTime ?? child.expectedArrival} krank`
  }
  if (child.arrivalTime) {
    return `${child.arrivalTime} Ankunft`
  }
  return `${child.expectedArrival} erwartet`
}

export function KitaPrototype() {
  const [children, setChildren] = React.useState(initialChildren)
  const [activeView, setActiveView] = React.useState<View>("today")
  const [selectedChildId, setSelectedChildId] = React.useState(children[0].id)
  const [profileOpen, setProfileOpen] = React.useState(false)
  const [pickupChildId, setPickupChildId] = React.useState<string | null>(null)
  const [sickChildId, setSickChildId] = React.useState<string | null>(null)
  const [photoReadyId, setPhotoReadyId] = React.useState<string | null>(null)

  const selectedChild =
    children.find((child) => child.id === selectedChildId) ?? children[0]
  const pickupChild = children.find((child) => child.id === pickupChildId)
  const sickChild = children.find((child) => child.id === sickChildId)

  const presentCount = children.filter((child) => child.status === "present").length
  const expectedCount = children.filter((child) => child.status === "expected").length
  const goneCount = children.filter((child) => child.status === "gone").length
  const sickCount = children.filter((child) => child.status === "sick").length

  function checkInChild(childId: string) {
    setChildren((items) =>
      items.map((child) =>
        child.id === childId
          ? {
              ...child,
              status: "present",
              arrivalTime: child.arrivalTime ?? timeNow(),
              departureTime: undefined,
              pickupBy: undefined,
              sickReason: undefined,
              sickTime: undefined,
            }
          : child
      )
    )
    setSelectedChildId(childId)
  }

  function checkOutChild(childId: string, pickupBy: string) {
    setChildren((items) =>
      items.map((child) =>
        child.id === childId
          ? {
              ...child,
              status: "gone",
              departureTime: timeNow(),
              pickupBy,
            }
          : child
      )
    )
    setPickupChildId(null)
    setSelectedChildId(childId)
  }

  function markSickChild(childId: string, sickReason: string) {
    setChildren((items) =>
      items.map((child) =>
        child.id === childId
          ? {
              ...child,
              status: "sick",
              arrivalTime: undefined,
              departureTime: undefined,
              pickupBy: undefined,
              sickReason,
              sickTime: timeNow(),
            }
          : child
      )
    )
    setSickChildId(null)
    setSelectedChildId(childId)
  }

  function openProfile(childId: string) {
    setSelectedChildId(childId)
    setProfileOpen(true)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,#eef7ff_0%,#f7f9fc_48%,#f5fbf8_100%)] p-4">
      <div className="kita-device-shadow relative h-[min(1120px,calc(100vh-2rem))] min-h-[720px] w-full max-w-[1560px] overflow-hidden rounded-[36px] border border-white bg-white p-4 ring-1 ring-[var(--kita-fog)]">
        <WatermelonAnimations />
        <Tabs
          value={activeView}
          onValueChange={(value) => setActiveView(value as View)}
          orientation="vertical"
          className="relative h-full min-h-0 gap-4"
        >
          <TabsList className="h-full w-[86px] flex-col justify-start gap-3 rounded-[24px] bg-[var(--kita-cloud)] p-3 text-[var(--kita-ink)]">
            <div className="mb-2 flex size-12 items-center justify-center rounded-2xl bg-[var(--kita-sun)] text-[var(--kita-ink)]">
              <Sun aria-hidden="true" />
            </div>
            {navItems.map((item) => (
              <TabsTrigger
                key={item.value}
                value={item.value}
                aria-label={item.label}
                className="h-16 w-full flex-col rounded-2xl px-2 py-2 text-xs data-active:bg-white data-active:text-primary data-active:shadow-sm"
              >
                <item.icon data-icon="inline-start" />
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="min-w-0 flex-1">
            <TabsContent value="today" className="h-full">
              <TodayView
                kids={children}
                selectedChild={selectedChild}
                presentCount={presentCount}
                expectedCount={expectedCount}
                goneCount={goneCount}
                sickCount={sickCount}
                photoReadyId={photoReadyId}
                onCheckIn={checkInChild}
                onOpenPickup={setPickupChildId}
                onOpenSick={setSickChildId}
                onOpenProfile={openProfile}
                onSelectChild={setSelectedChildId}
                onPhotoReady={setPhotoReadyId}
                onShowMessages={() => setActiveView("messages")}
                onShowReports={() => setActiveView("reports")}
              />
            </TabsContent>

            <TabsContent value="children" className="h-full">
              <ChildrenView
                kids={children}
                onOpenProfile={openProfile}
                onSelectChild={setSelectedChildId}
              />
            </TabsContent>

            <TabsContent value="reports" className="h-full">
              <ReportsView kids={children} />
            </TabsContent>

            <TabsContent value="messages" className="h-full">
              <MessagesView
                kids={children}
                photoReadyId={photoReadyId}
                onPhotoReady={setPhotoReadyId}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      <ProfileDialog
        child={selectedChild}
        open={profileOpen}
        onOpenChange={setProfileOpen}
      />
      <PickupDialog
        child={pickupChild}
        onClose={() => setPickupChildId(null)}
        onPick={checkOutChild}
      />
      <SickDialog
        child={sickChild}
        onClose={() => setSickChildId(null)}
        onMark={markSickChild}
      />
    </main>
  )
}

function TodayView({
  kids,
  selectedChild,
  presentCount,
  expectedCount,
  goneCount,
  sickCount,
  photoReadyId,
  onCheckIn,
  onOpenPickup,
  onOpenSick,
  onOpenProfile,
  onSelectChild,
  onPhotoReady,
  onShowMessages,
  onShowReports,
}: {
  kids: Child[]
  selectedChild: Child
  presentCount: number
  expectedCount: number
  goneCount: number
  sickCount: number
  photoReadyId: string | null
  onCheckIn: (childId: string) => void
  onOpenPickup: (childId: string) => void
  onOpenSick: (childId: string) => void
  onOpenProfile: (childId: string) => void
  onSelectChild: (childId: string) => void
  onPhotoReady: (childId: string) => void
  onShowMessages: () => void
  onShowReports: () => void
}) {
  return (
    <div className="grid h-full min-h-0 grid-cols-[1fr_340px] gap-4">
      <section className="flex min-h-0 flex-col gap-4">
        <div className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,var(--kita-blue),var(--kita-petrol))] p-6 text-white shadow-sm">
          <div className="hero-watermelon-cluster" aria-hidden="true">
            <span className="hero-watermelon" />
            <span className="hero-watermelon hero-watermelon-small" />
            <span className="hero-watermelon-seed" />
          </div>
          <div className="flex items-start justify-between gap-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm font-medium opacity-90">
                <CalendarDays aria-hidden="true" />
                Heute, 26. Juni 2026
              </div>
              <h1 className="text-4xl font-semibold leading-tight">KiTa Heute</h1>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-white/16 px-4 py-3">
              <ShieldCheck aria-hidden="true" />
              <span className="text-3xl font-semibold">{presentCount}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <Metric label="Anwesend" value={presentCount} tone="mint" />
          <Metric label="Erwartet" value={expectedCount} tone="sun" />
          <Metric label="Abgeholt" value={goneCount} tone="lavender" />
          <Metric label="Krank" value={sickCount} tone="coral" />
        </div>

        <ScrollArea className="min-h-0 flex-1 rounded-[24px] bg-[var(--kita-cloud)] p-3">
          <div className="flex flex-col gap-3 pr-2">
            {kids.map((child) => (
              <ChildRow
                key={child.id}
                child={child}
                selected={selectedChild.id === child.id}
                onCheckIn={onCheckIn}
                onOpenPickup={onOpenPickup}
                onOpenSick={onOpenSick}
                onOpenProfile={onOpenProfile}
                onSelectChild={onSelectChild}
              />
            ))}
          </div>
        </ScrollArea>
      </section>

      <aside className="flex min-h-0 flex-col gap-4">
        <SelectedChildCard
          child={selectedChild}
          photoReady={photoReadyId === selectedChild.id}
          onOpenProfile={onOpenProfile}
          onOpenSick={onOpenSick}
          onPhotoReady={onPhotoReady}
          onShowMessages={onShowMessages}
          onShowReports={onShowReports}
        />
        <Card className="rounded-[24px] border-0 bg-[var(--kita-mint)]/20 ring-0">
          <CardContent className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-[var(--kita-mint)] text-white">
              <Check aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-base font-semibold">Sicher angekommen</p>
              <p className="text-sm text-muted-foreground">{presentCount} Kinder</p>
            </div>
          </CardContent>
        </Card>
      </aside>
    </div>
  )
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: "mint" | "sun" | "lavender" | "coral"
}) {
  const toneClass = {
    mint: "bg-[var(--kita-mint)]/22",
    sun: "bg-[var(--kita-sun)]/28",
    lavender: "bg-[var(--kita-lavender)]/20",
    coral: "bg-[var(--kita-coral)]/18",
  }[tone]

  return (
    <div className={cn("rounded-[22px] px-5 py-4", toneClass)}>
      <div className="text-3xl font-semibold">{value}</div>
      <div className="text-sm font-medium text-muted-foreground">{label}</div>
    </div>
  )
}

function ChildRow({
  child,
  selected,
  onCheckIn,
  onOpenPickup,
  onOpenSick,
  onOpenProfile,
  onSelectChild,
}: {
  child: Child
  selected: boolean
  onCheckIn: (childId: string) => void
  onOpenPickup: (childId: string) => void
  onOpenSick: (childId: string) => void
  onOpenProfile: (childId: string) => void
  onSelectChild: (childId: string) => void
}) {
  const canCheckIn =
    child.status === "expected" || child.status === "absent" || child.status === "sick"
  const canMarkSick = child.status !== "gone" && child.status !== "sick"

  return (
    <Card
      data-testid={`child-row-${child.id}`}
      className={cn(
        "rounded-[18px] border-0 py-3 ring-1 ring-[var(--kita-fog)] transition",
        selected && "ring-2 ring-primary"
      )}
      style={{ borderLeft: `6px solid ${child.color}` }}
      onClick={() => onSelectChild(child.id)}
    >
      <CardContent className="grid grid-cols-[58px_1fr_auto] items-center gap-4">
        <ChildAvatar child={child} />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-lg font-semibold">{child.name}</h2>
            <Badge className={cn("border-0", statusClass(child.status))}>
              {statusLabel(child.status)}
            </Badge>
          </div>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <span>{child.group}</span>
            <span>·</span>
            <span>{childTimeText(child)}</span>
            {child.sickReason ? (
              <>
                <span>·</span>
                <span>{child.sickReason}</span>
              </>
            ) : null}
            {child.departureTime ? (
              <>
                <span>·</span>
                <span>{child.departureTime} Abholung</span>
              </>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canCheckIn ? (
            <Button
              data-testid={`check-in-${child.id}`}
              onClick={() => onCheckIn(child.id)}
            >
              <UserCheck data-icon="inline-start" />
              Ankunft
            </Button>
          ) : null}
          {canMarkSick ? (
            <Button
              data-testid={`sick-${child.id}`}
              variant="outline"
              onClick={() => onOpenSick(child.id)}
            >
              <Thermometer data-icon="inline-start" />
              Krank
            </Button>
          ) : null}
          {child.status === "present" ? (
            <Button
              data-testid={`check-out-${child.id}`}
              variant="outline"
              onClick={() => onOpenPickup(child.id)}
            >
              <UserX data-icon="inline-start" />
              Abholen
            </Button>
          ) : null}
          <Button
            variant="ghost"
            size="icon"
            aria-label={`${child.name} Profil`}
            data-testid={`profile-${child.id}`}
            onClick={() => onOpenProfile(child.id)}
          >
            <ChevronRight aria-hidden="true" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function SelectedChildCard({
  child,
  photoReady,
  onOpenProfile,
  onOpenSick,
  onPhotoReady,
  onShowMessages,
  onShowReports,
}: {
  child: Child
  photoReady: boolean
  onOpenProfile: (childId: string) => void
  onOpenSick: (childId: string) => void
  onPhotoReady: (childId: string) => void
  onShowMessages: () => void
  onShowReports: () => void
}) {
  const sickInfo = child.status === "sick" ? child.sickReason ?? "Krank" : undefined

  return (
    <Card className="min-h-0 flex-1 rounded-[24px] border-0 py-5 ring-1 ring-[var(--kita-fog)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl">
          <ChildAvatar child={child} size="lg" />
          <span className="truncate">{child.name}</span>
        </CardTitle>
        <CardDescription>{child.group}</CardDescription>
        <CardAction>
          <Badge className={cn("border-0", statusClass(child.status))}>
            {statusLabel(child.status)}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <InfoTile icon={Clock} label="Ankunft" value={childTimeText(child)} />
          <InfoTile
            icon={sickInfo ? Thermometer : UserCheck}
            label={sickInfo ? "Krank" : "Abholung"}
            value={sickInfo ?? child.pickupBy ?? "-"}
          />
        </div>

        <div className="rounded-2xl bg-[var(--kita-cloud)] p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <AlertCircle aria-hidden="true" />
            Besonderheiten
          </div>
          <p className="text-sm leading-6 text-muted-foreground">{child.notes}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={() => onOpenProfile(child.id)}>
            <Users data-icon="inline-start" />
            Profil
          </Button>
          <Button variant="outline" onClick={onShowReports}>
            <FileText data-icon="inline-start" />
            Report
          </Button>
          <Button variant="outline" onClick={onShowMessages}>
            <Send data-icon="inline-start" />
            WhatsApp
          </Button>
          {child.status !== "gone" ? (
            <Button
              data-testid={`sick-selected-${child.id}`}
              variant={child.status === "sick" ? "secondary" : "outline"}
              onClick={() => onOpenSick(child.id)}
            >
              <Thermometer data-icon="inline-start" />
              Krank
            </Button>
          ) : null}
          <Button
            variant={photoReady ? "secondary" : "outline"}
            onClick={() => onPhotoReady(child.id)}
          >
            <Camera data-icon="inline-start" />
            {photoReady ? "Foto bereit" : "Foto"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function InfoTile({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl bg-[var(--kita-cloud)] p-4">
      <Icon className="mb-3 text-primary" aria-hidden="true" />
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="truncate text-base font-semibold">{value}</div>
    </div>
  )
}

function ChildrenView({
  kids,
  onOpenProfile,
  onSelectChild,
}: {
  kids: Child[]
  onOpenProfile: (childId: string) => void
  onSelectChild: (childId: string) => void
}) {
  return (
    <section className="flex h-full min-h-0 flex-col gap-4">
      <HeaderBar title="Kinder" value={kids.length} />
      <ScrollArea className="min-h-0 flex-1 rounded-[24px] bg-[var(--kita-cloud)] p-3">
        <div className="grid grid-cols-2 gap-3 pr-2">
          {kids.map((child) => (
            <Card key={child.id} className="rounded-[20px] border-0 ring-1 ring-[var(--kita-fog)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <ChildAvatar child={child} />
                  <span className="truncate">{child.name}</span>
                </CardTitle>
                <CardDescription>{child.group}</CardDescription>
                <CardAction>
                  <Badge className={cn("border-0", statusClass(child.status))}>
                    {statusLabel(child.status)}
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <MiniField label="Allergie" value={child.allergies} />
                  <MiniField label="Monat" value={`${child.monthDays} Tage`} />
                  <MiniField label="Status" value={child.sickReason ?? statusLabel(child.status)} />
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    onSelectChild(child.id)
                    onOpenProfile(child.id)
                  }}
                >
                  Profil
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </section>
  )
}

function ReportsView({ kids }: { kids: Child[] }) {
  return (
    <section className="flex h-full min-h-0 flex-col gap-4">
      <HeaderBar title="Reports" value="Juni 2026" />
      <ScrollArea className="min-h-0 flex-1 rounded-[24px] bg-[var(--kita-cloud)] p-3">
        <div className="flex flex-col gap-3 pr-2">
          {kids.map((child) => (
            <Card key={child.id} className="rounded-[20px] border-0 py-4 ring-1 ring-[var(--kita-fog)]">
              <CardContent className="grid grid-cols-[58px_1fr_120px_120px] items-center gap-4">
                <ChildAvatar child={child} />
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-semibold">{child.name}</h2>
                  <p className="text-sm text-muted-foreground">{child.group}</p>
                </div>
                <ReportNumber label="Monat" value={child.monthDays} />
                <ReportNumber label="Jahr" value={child.yearDays} />
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </section>
  )
}

function MessagesView({
  kids,
  photoReadyId,
  onPhotoReady,
}: {
  kids: Child[]
  photoReadyId: string | null
  onPhotoReady: (childId: string) => void
}) {
  return (
    <section className="flex h-full min-h-0 flex-col gap-4">
      <HeaderBar title="WhatsApp" value="Eltern" />
      <ScrollArea className="min-h-0 flex-1 rounded-[24px] bg-[var(--kita-cloud)] p-3">
        <div className="grid grid-cols-2 gap-3 pr-2">
          {kids.map((child) => {
            const message = encodeURIComponent(
              `Hallo, kurze Info aus der KiTa: ${child.name} ist ${statusLabel(child.status).toLowerCase()}.`
            )

            return (
              <Card key={child.id} className="rounded-[20px] border-0 ring-1 ring-[var(--kita-fog)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <ChildAvatar child={child} />
                    <span className="truncate">{child.name}</span>
                  </CardTitle>
                  <CardDescription>{child.contacts[0].name}</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3">
                  <Button
                    nativeButton={false}
                    render={
                      <a
                        href={`https://wa.me/?text=${message}`}
                        target="_blank"
                        rel="noreferrer"
                      />
                    }
                  >
                    <Send data-icon="inline-start" />
                    Senden
                  </Button>
                  <Button
                    variant={photoReadyId === child.id ? "secondary" : "outline"}
                    onClick={() => onPhotoReady(child.id)}
                  >
                    <Camera data-icon="inline-start" />
                    Foto
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </ScrollArea>
    </section>
  )
}

function HeaderBar({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between rounded-[28px] bg-[linear-gradient(135deg,var(--kita-blue),var(--kita-petrol))] p-6 text-white shadow-sm">
      <h1 className="text-4xl font-semibold">{title}</h1>
      <div className="rounded-2xl bg-white/16 px-5 py-3 text-2xl font-semibold">
        {value}
      </div>
    </div>
  )
}

function ProfileDialog({
  child,
  open,
  onOpenChange,
}: {
  child: Child
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <ChildAvatar child={child} />
            {child.name}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Profil, Besonderheiten, Allergien und Kontakte
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <MiniField label="Gruppe" value={child.group} />
            <MiniField label="Allergie" value={child.allergies} />
          </div>
          <div className="rounded-2xl bg-[var(--kita-cloud)] p-4">
            <div className="mb-2 text-sm font-semibold">Besonderheiten</div>
            <p className="text-sm leading-6 text-muted-foreground">{child.notes}</p>
          </div>
          <Separator />
          <div className="grid gap-2">
            {child.contacts.map((contact) => (
              <div
                key={contact.phone}
                className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-2xl bg-[var(--kita-cloud)] p-3"
              >
                <div>
                  <div className="font-semibold">{contact.name}</div>
                  <div className="text-sm text-muted-foreground">{contact.role}</div>
                </div>
                <a
                  className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-primary ring-1 ring-[var(--kita-fog)]"
                  href={`tel:${contact.phone}`}
                >
                  <Phone aria-hidden="true" />
                  {contact.phone}
                </a>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function PickupDialog({
  child,
  onClose,
  onPick,
}: {
  child?: Child
  onClose: () => void
  onPick: (childId: string, pickupBy: string) => void
}) {
  return (
    <Dialog open={Boolean(child)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{child ? `${child.name} abholen` : "Abholen"}</DialogTitle>
          <DialogDescription className="sr-only">
            Abholung mit abholender Person erfassen
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          {child?.pickupOptions.map((person) => (
            <Button key={person} variant="outline" onClick={() => onPick(child.id, person)}>
              <UserCheck data-icon="inline-start" />
              {person}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function SickDialog({
  child,
  onClose,
  onMark,
}: {
  child?: Child
  onClose: () => void
  onMark: (childId: string, sickReason: string) => void
}) {
  return (
    <Dialog open={Boolean(child)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{child ? `${child.name} krankmelden` : "Krankmelden"}</DialogTitle>
          <DialogDescription className="sr-only">
            Krankmeldung mit Grund erfassen
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2">
          {child
            ? sickReasons.map((reason) => (
                <Button
                  key={reason}
                  data-testid={`sick-reason-${child.id}-${reason.toLowerCase()}`}
                  variant="outline"
                  onClick={() => onMark(child.id, reason)}
                >
                  <Thermometer data-icon="inline-start" />
                  {reason}
                </Button>
              ))
            : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function WatermelonAnimations() {
  return (
    <div className="watermelon-layer" aria-hidden="true">
      <span className="watermelon-slice wm-1" />
      <span className="watermelon-slice wm-2" />
      <span className="watermelon-slice wm-3" />
      <span className="watermelon-slice wm-4" />
      <span className="watermelon-seed seed-1" />
      <span className="watermelon-seed seed-2" />
      <span className="watermelon-seed seed-3" />
      <span className="watermelon-seed seed-4" />
    </div>
  )
}

function ChildAvatar({ child, size = "md" }: { child: Child; size?: "md" | "lg" }) {
  return (
    <Avatar className={cn(size === "lg" ? "size-14" : "size-12")}>
      <AvatarFallback
        className="text-base font-semibold text-white"
        style={{ background: child.color }}
      >
        {child.initials}
      </AvatarFallback>
    </Avatar>
  )
}

function MiniField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[var(--kita-cloud)] p-3">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="truncate text-sm font-semibold">{value}</div>
    </div>
  )
}

function ReportNumber({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-[var(--kita-cloud)] p-3 text-center">
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
    </div>
  )
}
