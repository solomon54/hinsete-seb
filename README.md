📜 ሕንጸተ ሰብእ (Hinsete Seb)
_An Offline-First Formation Engine crafted as a digital ancient manuscript (Biranna)._

📝 **Table of Contents**

- [Project Overview](#-project-overview)
- [Key Features](#✨-features)
- [Technical Architecture](#🏗️-architecture)
- [Installation & Setup](#🚀-installation)
- [Data Models & Persistence](#📊-data-models-srs-71)
- [Offline & Sync Strategy](#🔄-offline--sync-strategy)
- [Testing & Quality Assurance](#🧪-testing)
- [Security & Trust Model](#🛡️-security)
- [Roadmap](#🗺️-roadmap-srs-12)
- [License](#📜-license)

---

### 🏛️ Project Overview

**ሕንጸተ ሰብእ (Hinsete Seb)** is an **Offline-First Formation Engine** `(SRS-1.2)` designed to solve the challenge of delivering structured, high-fidelity educational content to students in low-connectivity environments, such as Ethiopian university campuses `(SRS-2.3)`.

- **The Vision:** To digitize the sacred and scholarly experience of the _Biranna_ (parchment manuscript), fostering a disciplined "formation" through time-locked content `(SRS-1.2, 2.1)`.
- **Target Audience:** Students with intermittent network access who require resilient, high-performance learning tools `(SRS-2.3)`.
- **Core Philosophy:** **Local-First / Disconnected-by-Default.** The system assumes the network is absent; the device is the primary engine, and the server is a secondary relay for backup and synchronization `(SRS-3.1, 3.4)`.

---

### ✨ Features

- **⏳ The Weekly Lock:** A deterministic "drip-feed" system where chapters unlock every 7 days based on the user's `JoinDate` `(SRS-4.2.1)`.

- **📖 Tactile Reader Engine:** A 3D page-flip interface with hardware-accelerated physics, parchment textures, and high-fidelity paper audio `(SRS-4.6.2, 5.1-01)`.
- **🖋️ Persistent Notepad:** Offline note-taking with AES-GCM-256 encryption, allowing students to reflect on manuscripts without a connection `(SRS-6.2-01)`.
- **🔏 The Wax Seal:** A skeuomorphic UI state that redirects users from locked content, maintaining the integrity of the formation cycle `(SRS-4.6.3)`.

---

### 🏗️ Architecture

#### High-Level Stack

- **Frontend:** Next.js 15+ (App Router) `(SRS-3.3)` | Tailwind CSS (Cinnabar Red Accents) `(SRS-2.5)` | Framer Motion (3D Physics) `(SRS-5.1-01)`.

- **Backend:** Next.js API Routes `(SRS-3.4)` | PostgreSQL (Managed) `(SRS-11.1)`.
- **PWA Layer:** Service Worker (Cache-First) `(SRS-3.3)` | IndexedDB (Structured Data) `(SRS-4.3.1)`.

#### System Data Flow

> **User Action** (Note/Progress) → **React State** (Optimistic UI) → **IndexedDB** (Persistence) → **Service Worker Proxy** (Background Sync) → **Next.js API** → **PostgreSQL** `(SRS-13.1)`.

---

### 🚀 Installation

#### Requirements

- **Node.js:** v20+ (LTS)

- **Database:** PostgreSQL (v14+) `(SRS-11.1)`
- **Package Manager:** pnpm

#### Steps

```bash
# Clone the repository
git clone https://github.com/solomon54/hinsete-seb.git
cd hinsete-seb

# Install dependencies
pnpm install
```

#### Environment Configuration

Create a `.env.local` file `(SRS-11.2)`:

```env
DATABASE_URL="postgres://user:password@localhost:5432/hinsete_seb"
JWT_SECRET="your_high_entropy_secret"
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
NEXT_PUBLIC_SERVICE_WORKER_VERSION="v1.0.0"
CDN_BASE_URL="https://cdn.hinseteseb.org"
```

#### Development

```bash
pnpm dev
```

---

### 📊 Data Models `(SRS-7.1)`

#### User Model

```typescript
interface User {
  id: string;
  email: string;
  joinDate: string; // ISO 8601 anchor for drip-feed
  role: "STUDENT" | "ADMIN";
  lastSyncTimestamp: string;
  version: number;
}
```

#### Content (Biranna) Model

```typescript
interface Content {
  id: string;
  weekIndex: number; // 0-based week index
  title: string;
  slug: string;
  contentJson: {
    pages: Array<{ pageNumber: number; bodyText: string; assets: string[] }>;
  };
  isLocked: boolean;
}
```

#### Note & Progress Models

```typescript
interface Note {
  id: string;
  userId: string;
  chapterId: string;
  pageIndex: number;
  contentEncrypted: string; // AES-GCM-256
  syncStatus: "synced" | "pending";
  updatedAt: string;
}

interface Progress {
  userId: string;
  chapterId: string;
  lastPageRead: number;
  isCompleted: boolean;
  updatedAt: string;
}
```

---

### 🔄 Offline & Sync Strategy

- **Offline Mode:** Users can authenticate via local cryptographic hashes, navigate cached chapters, and save notes without network `(SRS-4.1.3, 4.3)`.

- **Sync Mechanism:** The Service Worker utilizes a **Background Sync** strategy to retry failed POST requests using **Exponential Backoff** `(SRS-4.4.5, 8.1)`.
- **Conflict Resolution:** **Last-Write-Wins (LWW)** logic based on ISO `updatedAt` timestamps `(SRS-7.5)`.
- **Pre-fetching:** Assets for the _upcoming_ week are pre-cached in the background to ensure instantaneous unlocking `(SRS-4.2.3, 4.5.3)`.

---

### 🧪 Testing

- **Unit Testing:** **Vitest** | Validating "Drip-Feed" chronological math and `isChapterLocked` logic `(SRS-10.1)`.

- **Integration:** **Cypress** | Testing the bridge between React State and IndexedDB persistence `(SRS-10.2)`.
- **E2E Offline:** **Playwright** | Simulating "Airplane Mode" scenarios to verify zero-latency interactions `(SRS-10.3)`.

---

### 🛡️ Security

- **Authentication:** JWT-based online auth with "Offline-Resilient" hash validation `(SRS-4.1.3, 6.1)`.

- **Data Encryption:** User reflections are encrypted at rest in IndexedDB using **AES-GCM-256** `(SRS-6.2-01)`.
- **Integrity:** Content fragments are verified via **HMAC** to prevent local file tampering `(SRS-6.5-01)`.
- **Anti-Cheat:** **Clock-Drift Protection** uses server-signed timestamps to prevent manual system clock "time-travel" `(SRS-6.4, 13.5)`.

---

### 🗺️ Roadmap `(SRS-12)`

- **Phase 1:** Core Biranna Engine & 7-Day Unlock Logic.

- **Phase 2:** Advanced Sync Engine & Conflict Resolution.
- **Phase 3:** Interactive Widgets (Meditation Timers & Glossaries).
- **Phase 4:** Multi-Device Sync Lock & CRDT Data Structures.

---

### 📜 License

**MIT License** © 2026 **ሕንጸተ ሰብእ (Hinsete Seb)**. All rights reserved.
