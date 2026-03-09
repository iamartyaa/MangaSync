<div align="center">

# 🔥 MangaSync

### AI-Powered Manga Localization & Narration Engine

*Translate. Narrate. Publish.*

[![Built with Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Powered by Lingo.dev](https://img.shields.io/badge/Lingo.dev-Powered-FF4444?style=for-the-badge)](https://lingo.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.0-38BDF8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)

---

**MangaSync** takes raw manga panels, translates speech bubbles with full character context using the **Lingo.dev** ecosystem, overlays the translated text in real-time, and generates AI-narrated playback — automating the entire pipeline for creating localized manga videos.

</div>

---

## ⚡ The Problem

Manga localization is painfully manual. Scanlation teams spend hours:
- Extracting text from speech bubbles
- Translating while trying to preserve character voice and tone
- Typesetting translated text back onto panels
- Creating narrated/voiced content for video platforms

Generic translation tools produce flat, lifeless output that strips away the emotional intensity of the original Japanese text. **"I will exterminate them"** just doesn't hit the same as **"I'll eradicate every last one of them from this world."**

## 🧠 The Solution

MangaSync uses the **Lingo.dev** ecosystem to solve every piece of this pipeline:

| Layer | Lingo.dev Tool | What It Does |
|---|---|---|
| 🌐 **UI Localization** | **Lingo.dev Compiler** | The entire dashboard UI is localized at build-time. No `t()` wrappers, no JSON key files — just plain English in JSX that magically works in Japanese, Spanish, and French |
| 🎯 **Context-Aware Translation** | **Lingo.dev SDK** | Manga dialogue is translated with MCP-style context prompts that tell the AI *who* is speaking, *what* the emotional tone is, and *how* the series feels. Eren's rage stays raw. Hinata's energy stays electric |
| 🔄 **Translation Pipeline** | **Lingo.dev API** | Batch translates all speech bubbles in a panel via a single `localizeObject()` call, preserving the bubble-to-text mapping |

## 🎬 How It Works

```
┌────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Raw Manga     │────▶│  MangaSync       │────▶│  Translated     │
│  Panel (JA)    │     │  Translation     │     │  Panel (EN/ES)  │
│                │     │  Engine          │     │                 │
│  + OCR Data    │     │  + Lingo.dev SDK │     │  + Bubble       │
│  + Bubble      │     │  + MCP Context   │     │    Overlays     │
│    Coordinates │     │  + Character     │     │  + Narration    │
│                │     │    Lore Prompts  │     │    Track        │
└────────────────┘     └──────────────────┘     └─────────────────┘
```

### The Magic: MCP-Style Context Prompts

This is what makes MangaSync different from a generic translator. Each panel carries a rich context prompt:

```
"Attack on Titan, Chapter 130. The scene is dark, violent, and apocalyptic.
The speaker is Eren Jaeger — once a frightened boy, now a merciless avenger
who has unlocked the power of the Founding Titan. He speaks with cold fury
and absolute conviction. His words drip with hatred toward the Titans who
devoured his mother. Preserve the raw, guttural intensity. Do not soften
the language — this is a declaration of genocide."
```

This prompt is passed alongside the Japanese text to the Lingo.dev SDK, ensuring the AI translates with the correct **tone**, **voice**, and **emotional weight**.

## 🖥️ Demo Panels

MangaSync ships with 3 demo manga panels:

| Panel | Series | Tone | Bubbles |
|---|---|---|---|
| **aot_ch130** | Attack on Titan | Dark, apocalyptic fury | 2 |
| **haikyuu_ch1** | Haikyuu!! | Electric sports energy | 1 |
| **dn_ch1** | Death Note | Cold, intellectual menace | 2 |

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router + Turbopack)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4 — Neo-brutalist design system
- **Translation**: Lingo.dev SDK (`localizeObject`, `localizeText`)
- **UI Localization**: Lingo.dev Compiler (`@lingo.dev/compiler`)
- **Narration**: Web Speech API (`SpeechSynthesis`)
- **Images**: AI-generated manga panel artwork

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A Lingo.dev API key ([sign up here](https://lingo.dev))

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/mangasync.git
cd mangasync

# Install dependencies
npm install

# Set up your API key
cp .env.example .env.local
# Edit .env.local and add your LINGODOTDEV_API_KEY

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and explore!

### Environment Variables

```env
# Required for translation API
LINGODOTDEV_API_KEY=your_api_key_here

# Alternative key name (also supported)
LINGO_API_KEY=your_api_key_here
```

## 📁 Project Structure

```
mangasync/
├── src/
│   ├── app/
│   │   ├── api/translate/      # Lingo.dev SDK translation endpoint
│   │   │   └── route.ts
│   │   ├── dashboard/          # Translation studio page
│   │   │   └── page.tsx
│   │   ├── globals.css         # Neo-brutalist design tokens
│   │   ├── layout.tsx          # Root layout with LingoProvider
│   │   └── page.tsx            # Landing page
│   ├── components/
│   │   ├── LanguageSwitcher.tsx # Lingo.dev Compiler locale toggle
│   │   ├── LingoWrapper.tsx    # Client-side LingoProvider wrapper
│   │   ├── MangaViewer.tsx     # Panel renderer with bubble overlays
│   │   ├── NarrationPlayer.tsx # Web Speech narration engine
│   │   └── PanelSelector.tsx   # Manga panel selector grid
│   ├── data/
│   │   └── mockPanels.ts       # Demo data with MCP context prompts
│   └── lib/
│       └── lingo.ts            # Lingo.dev SDK utility abstraction
├── public/demo-assets/         # AI-generated manga panels
├── next.config.ts              # Lingo.dev Compiler configuration
└── package.json
```

## 🎨 Design System

MangaSync uses a **Neo-brutalist** design language:
- 🔲 **Thick borders** (3-4px solid black)
- 🎯 **Hard shadows** (no blur, offset only)
- 🟥 **High contrast** color palette (manga-red, manga-yellow, manga-cream)
- ⚡ **Micro-animations** (skeleton pulses, text reveals, bubble glows)
- 🔤 **Bold typography** (Space Grotesk display, Inter body)

## 🏆 Hackathon Feature Highlights

1. **Lingo.dev Compiler** → Toggle UI language with zero code changes
2. **Lingo.dev SDK** → Batch translate manga with tone-preserving context
3. **Speech Bubble Overlays** → Real-time text overlay on manga panels
4. **Narration Engine** → Synchronized speech + bubble highlighting
5. **Skeleton Loaders** → Premium UX during translation wait times
6. **Neo-brutalist UI** → Eye-catching design that stands out

---

<div align="center">

**Built with ❤️ and Lingo.dev for the Lingo.dev Hackathon**

*Because manga deserves translations that hit as hard as the original.*

</div>
