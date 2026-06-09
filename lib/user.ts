import type { BoardUser } from "@/types"

// A palette of distinct cursor colors
const CURSOR_COLORS = [
  "#7c6aff", "#f87171", "#34d399", "#fbbf24",
  "#60a5fa", "#f472b6", "#a78bfa", "#2dd4bf",
]

function randomColor() {
  return CURSOR_COLORS[Math.floor(Math.random() * CURSOR_COLORS.length)]
}

function randomId() {
  return Math.random().toString(36).slice(2, 10)
}

const ADJECTIVES = ["Quick", "Lazy", "Bold", "Calm", "Witty", "Swift", "Bright", "Keen"]
const ANIMALS    = ["Fox", "Bear", "Wolf", "Hawk", "Lynx", "Deer", "Crow", "Seal"]

function randomName() {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const ani = ANIMALS[Math.floor(Math.random() * ANIMALS.length)]
  return `${adj} ${ani}`
}

let _user: BoardUser | null = null

export function getLocalUser(): BoardUser {
  if (_user) return _user
  // Persist in sessionStorage so refreshing keeps same identity
  if (typeof window !== "undefined") {
    const stored = sessionStorage.getItem("wb_user")
    if (stored) { _user = JSON.parse(stored); return _user! }
  }
  _user = { id: randomId(), name: randomName(), color: randomColor() }
  if (typeof window !== "undefined") {
    sessionStorage.setItem("wb_user", JSON.stringify(_user))
  }
  return _user
}
