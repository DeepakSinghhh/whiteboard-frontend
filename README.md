# Sketchpad — Real-time Collaborative Whiteboard

A full-stack real-time collaborative whiteboard built with Next.js 14, Socket.io, Clerk, Prisma, and Supabase.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

---

## ✨ Features

| Feature | Details |
|---|---|
| 🖊️ Drawing tools | Pen, eraser, line, rect, ellipse, arrow, text |
| ✅ Selection | Click to select, drag to move, 8 resize handles |
| 🗒️ Sticky notes | 6 colors, drag to move, double-click to edit |
| 😂 Reactions | 10 emojis, float-up animation with username |
| 👥 Real-time | Live cursors, presence bar, ghost strokes |
| 💾 Persistence | Auto-save every 2s, thumbnail on tab close |
| 🔐 Auth | Clerk (Google, GitHub, email) |
| 📱 Mobile | Full touch support, bottom toolbar |
| 🔗 Rooms | Shareable URLs, public/private toggle |
| 📊 Activity | Live feed of all board events |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- A [Clerk](https://clerk.com) account (free)
- A [Supabase](https://supabase.com) project (free)

### 1. Clone & install

```bash
git clone https://github.com/yourname/sketchpad
cd sketchpad/whiteboard
cp .env.local.example .env.local
npm install
```

### 2. Fill in environment variables

```bash
# .env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

DATABASE_URL=postgresql://postgres:...@db.xxx.supabase.co:5432/postgres

NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

### 3. Push DB schema

```bash
npm run db:push      # Creates tables in Supabase
npm run db:generate  # Generates Prisma client
```

### 4. Run both servers

```bash
# Terminal 1 — Socket.io server
cd whiteboard-server
npm install && npm run dev

# Terminal 2 — Next.js frontend
cd whiteboard
npm run dev
```

Open **http://localhost:3000** — create a board and share the URL.

---

## 📦 Deploy

### Frontend → Vercel

1. Push `whiteboard/` to a GitHub repo
2. Import to [vercel.com](https://vercel.com)
3. Add all env vars from `.env.local.example`
4. Set build command: `npx prisma generate && next build`
5. Deploy ✓

### Socket server → Railway

1. Push `whiteboard-server/` to a separate GitHub repo
   (or a subfolder — Railway supports monorepo root dirs)
2. New project → Deploy from GitHub → select the server repo
3. Add env var: `CLIENT_URL=https://your-app.vercel.app`
4. Railway auto-detects Node.js and deploys ✓
5. Copy your Railway URL (e.g. `https://sketchpad-server.railway.app`)
6. Update Vercel env: `NEXT_PUBLIC_SOCKET_URL=https://sketchpad-server.railway.app`
7. Redeploy Vercel ✓

### Post-deploy checklist

- [ ] Clerk dashboard → add your Vercel URL to allowed origins
- [ ] Supabase → connection pooling enabled for production
- [ ] Test: open two incognito tabs, draw on one, see it on the other

---

## 🗂️ Project Structure

```
sketchpad/
├── whiteboard/                        ← Next.js 14 frontend
│   ├── app/
│   │   ├── page.tsx                   ← Lobby (create / join)
│   │   ├── dashboard/                 ← Board list
│   │   ├── board/[roomId]/page.tsx    ← Collaborative board
│   │   ├── sign-in/ sign-up/          ← Clerk auth pages
│   │   └── api/
│   │       ├── user/sync/             ← Upsert user after login
│   │       └── boards/[roomId]/       ← CRUD board API
│   ├── components/
│   │   ├── canvas/Canvas.tsx          ← Drawing + touch engine
│   │   ├── toolbar/Toolbar.tsx        ← Desktop sidebar
│   │   └── ui/
│   │       ├── MobileToolbar.tsx      ← Bottom bar for phones
│   │       ├── LiveCursors.tsx        ← Remote cursors
│   │       ├── PresenceBar.tsx        ← Online users + invite
│   │       ├── StickyNote.tsx         ← Individual sticky card
│   │       ├── StickyLayer.tsx        ← Click-to-place layer
│   │       ├── ReactionLayer.tsx      ← Emoji stamps + animation
│   │       ├── ActivityFeed.tsx       ← Event log panel
│   │       ├── PermissionsPanel.tsx   ← Public/private toggle
│   │       ├── LoadingSkeleton.tsx    ← Board loading state
│   │       └── ErrorState.tsx         ← Error fallback
│   ├── hooks/
│   │   ├── useHistory.ts              ← Undo/redo stack
│   │   ├── useSelection.ts            ← Select/drag/resize state
│   │   ├── useCanvas.ts               ← drawElement() renderer
│   │   ├── useSocket.ts               ← All socket events
│   │   ├── useTouch.ts                ← Touch → pointer adapter
│   │   └── useBoardPersistence.ts     ← Debounced auto-save
│   ├── lib/
│   │   ├── prisma.ts                  ← DB client singleton
│   │   ├── socket.ts                  ← Socket.io singleton
│   │   ├── user.ts                    ← Anonymous identity
│   │   ├── geometry.ts                ← Hit-test, bounding boxes
│   │   └── utils.ts                   ← cn(), formatters
│   ├── prisma/schema.prisma           ← User, Board, BoardMember
│   ├── middleware.ts                  ← Clerk route protection
│   └── .github/workflows/ci.yml      ← TypeCheck + lint CI
│
└── whiteboard-server/                 ← Node.js Socket.io server
    ├── index.js                       ← Rooms, all events, in-memory state
    ├── railway.json                   ← Railway deploy config
    └── .github/workflows/ci.yml      ← Server smoke test CI
```

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|---|---|
| `P` | Pen tool |
| `E` | Eraser |
| `L` | Line |
| `R` | Rectangle |
| `C` | Ellipse |
| `A` | Arrow |
| `T` | Text |
| `S` | Select |
| `N` | Sticky note |
| `F` | Reaction |
| `⌘Z` | Undo |
| `⌘⇧Z` | Redo |
| `⌫` | Delete selected |
| `Esc` | Deselect |

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Auth | Clerk |
| Database | PostgreSQL via Supabase |
| ORM | Prisma |
| Real-time | Socket.io |
| Socket hosting | Railway |
| Frontend hosting | Vercel |
| CI | GitHub Actions |

---

*Built across 6 parts as a portfolio project.*
