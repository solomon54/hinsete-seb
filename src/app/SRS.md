# SOFTWARE REQUIREMENTS SPECIFICATION (SRS)

## Project: ሕንጸተ ሰብእ (Hinsete Seb) — Offline-First Formation Engine

---

### 1. Introduction

#### 1.1 Purpose

The purpose of this document is to provide a comprehensive breakdown of the functional and non-functional requirements for the **ሕንጸተ ሰብእ (Hinsete Seb)** platform. This specification is intended for the development team, project stakeholders, and QA engineers to ensure the delivery of a resilient, high-fidelity digital formation engine tailored for low-bandwidth environments.

#### 1.2 Scope of the System

ሕንጸተ ሰብእ is an **Offline-First Formation Engine** conceptualized as a digital ancient manuscript (**Biranna**). The system is a Progressive Web App (PWA) that enables students in connectivity-constrained regions (e.g., Ethiopian university campuses) to engage with structured educational content.

The system's core value proposition lies in its "Drip-Feed" logic, where content is programmatically unlocked every 7 days based on the user's initial enrollment date. Unlike standard LMS platforms, the system prioritizes a tactile, skeuomorphic 3D reading experience while maintaining a robust client-side state via IndexedDB to ensure zero-latency interaction regardless of network availability.

#### 1.3 Definitions, Acronyms, and Abbreviations

- **Biranna**: Traditional Ethiopian parchment; used here to describe the skeuomorphic UI design language.
- **Cinnabar Red**: A specific hex-code accent (#9B2D30) traditionally used in Ge'ez manuscripts, utilized for UI emphasis.
- **PWA (Progressive Web App)**: A web application that uses modern web capabilities to deliver an app-like experience, including offline support.
- **IndexedDB**: A low-level API for client-side storage of significant amounts of structured data.
- **Service Worker**: A script that the browser runs in the background, separate from a web page, enabling features like push notifications and background sync.
- **JWT (JSON Web Token)**: An open standard used to share security information between a client and a server.
- **JoinDate**: The Unix timestamp recorded at user registration used as the anchor for the 7-day content release logic.

#### 1.4 References

- _IEEE Std 830-1998_: Recommended Practice for Software Requirements Specifications.
- _Next.js Documentation_: Performance and Caching Strategies (Vercel).
- _MDN Web Docs_: IndexedDB Key-Value Storage and Service Worker API.
- _Framer Motion Documentation_: 3D Transforms and Gesture Animations.

#### 1.5 Overview of Document Structure

This SRS is organized into thirteen sections. This specific iteration focuses on the **Introduction** and **Overall Description**, establishing the project's strategic goals and architectural constraints. Subsequent sections cover specific functional requirements, data models, and synchronization protocols required for an offline-first environment.

---

### 2. Overall Description

#### 2.1 Product Perspective

ሕንጸተ ሰብእ is designed as a standalone, resilient local-first application. It functions as a specialized "Reader Engine" that interacts with a central server only when a network connection is detected to synchronize progress or fetch new encrypted content fragments. The application is built to bypass the "spinner-centric" UX of traditional web apps, assuming a "Disconnected-by-Default" state.

**System Context Diagram**
[Diagram Placeholder – PWA Client <-> Service Worker <-> IndexedDB <-> External API Sync]

#### 2.2 Product Functions (High-Level)

- **The Weekly Lock (Drip-Feed Logic)**: A deterministic scheduling engine that calculates content availability by comparing `CurrentDate` against `User.JoinDate`. New chapters unlock in 7-day increments.
- **Tactile Reader Engine**: A high-performance 3D page-flip interface utilizing parchment textures and high-fidelity paper audio to simulate the physical experience of a _Biranna_.
- **Offline Authentication**: A persistent, JWT-based local session management system that allows users to access the "manuscript" even during prolonged internet outages.
- **Local Progress Persistence**: Real-time tracking of reading progress and user notes stored within IndexedDB, optimized for atomic writes.
- **Asset Pre-caching**: Background fetching of upcoming chapter assets (images, audio) to ensure the 7-day unlock is instantaneous.

#### 2.3 User Classes and Characteristics

- **Student User**: Primarily university students in Ethiopia. They possess modern smartphones but suffer from intermittent, expensive, or throttled data plans. They require a system that "just works" when they leave a Wi-Fi zone.
- **Admin User**: Content curators responsible for uploading new curriculum modules and monitoring aggregate cohort progress through an online management dashboard.
- **System (Background Services)**: The Service Worker acts as a proxy, intercepting network requests and serving cached assets, while the Sync Engine manages conflict resolution between local and remote DB states.

#### 2.4 Operating Environment

- **Hardware**: Standard mobile devices and low-tier laptops.
- **Platform**: Modern evergreen browsers (Chrome, Safari, Edge) with PWA support.
- **Network Conditions**: Optimized for **Offline / Intermittent (2G/3G)**. The application must provide full core functionality (reading, navigating, note-taking) without an active heartbeat to the server.

#### 2.5 Design and Implementation Constraints

- **No-Scroll UI**: The interface must adhere to a fixed-viewport, paginated model. Vertical scrolling is prohibited to maintain the "Manuscript" metaphor.
- **Quota Management**: The system must operate within browser storage limits (typically 50MB to 250MB depending on the device) to prevent IndexedDB eviction by the OS.
- **Security Limitations**: Local data encryption must be handled with care, as client-side keys are inherently more vulnerable than server-side secrets.
- **UI Branding**: All interactive elements must utilize the "Cinnabar Red" accent and authentic parchment textures to maintain formation-grade immersion.

#### 2.6 Assumptions and Dependencies

- **Assumption**: Users will connect to a network at least once every 30 days to refresh session tokens and sync progress metadata.
- **Dependency**: The client device must support `IndexedDB` and `ServiceWorker` APIs.
- **Dependency**: The `JoinDate` provided by the server upon initial registration is considered the "Source of Truth" for all chronological unlocking logic.

### 3. System Architecture

#### 3.1 Architectural Style

ሕንጸተ ሰብእ (Hinsete Seb) employs a **Local-First / Offline-First Architectural Style**. In this paradigm, the client device is the primary execution environment for all business logic, including the "Weekly Lock" chronological calculations and the 3D physics engine. The server is relegated to a secondary role, acting as a durable backup, a multi-device synchronization relay, and a secure content distribution point.

The system prioritizes **Optimistic UI Updates**, ensuring that user interactions—such as note-taking or chapter completion—are committed to the local `IndexedDB` immediately, providing a zero-latency experience regardless of the state of the network (3G, Wi-Fi, or total outage).

#### 3.2 High-Level Architecture Diagram

[Diagram Placeholder – Three-Tier Offline Architecture: [PWA Client (Next.js/Framer) <-> Service Worker Proxy <-> IndexedDB] <---(JSON/HTTPS)---> [Next.js API <-> PostgreSQL]]

#### 3.3 Frontend Architecture

The frontend is a **Client-Heavy Next.js (App Router)** application optimized for execution in the browser's sandbox.

- **UI Layer (Atomic Design)**: Utilizes a modular component hierarchy. The "Tactile Reader Engine" leverages **Framer Motion** for hardware-accelerated 3D transforms, simulating page physics. Textures (Biranna parchment), typography, and high-fidelity audio assets are decoupled from the logic to facilitate aggressive caching.
- **State Management**:
  - **Transient State**: Managed via **React Context API** for UI-specific flags (e.g., current page index, sidebar toggle).
  - **Persistent Formation State**: All domain data (User progress, JoinDate, Notepad entries) is persisted in **IndexedDB**. This layer serves as the "Source of Truth" for the UI.
- **Service Worker (Network Proxy)**:
  - Functions as a programmable network interceptor using a **Cache-First Strategy**.
  - Pre-caches critical static assets (Cinnabar Red UI assets, parchment textures, and audio samples) during the installation phase to eliminate loading states.
  - Manages **Background Sync** events to retry failed transmissions of local progress data to the server.

#### 3.4 Backend Architecture

The backend is a stateless **Next.js API Layer** providing a RESTful interface for the client.

- **API Layer**: Handles JWT validation and serves encrypted content fragments (JSON) representing the manuscript chapters.
- **Persistence Layer**: A **PostgreSQL** database stores the authoritative record of user profiles, global formation content, and synchronized progress logs.
- **Sync Engine**:
  - Implements a **Hybrid Reconciliation Logic**.
  - The engine utilizes a **"Last-Write-Wins" (LWW)** strategy for non-colliding fields (like Notepad entries) based on high-resolution `updatedAt` ISO timestamps generated on the client.
  - Validates the client-calculated "Weekly Lock" status against server-side `JoinDate` records during synchronization to prevent clock-tampering.

#### 3.5 Data Flow Overview

**Online Mode Flow (Optimistic Synchronization)**

1. **UI Trigger**: User saves a note in the manuscript.
2. **Local Commit**: The note is immediately written to the local **IndexedDB** with a `sync_status: "pending"` flag and a current `updatedAt` timestamp.
3. **UI Feedback**: UI reflects the change instantly (Optimistic Update).
4. **Network Request**: The application attempts an asynchronous POST request to the **Next.js API**.
5. **Remote Commit**: On success, the server updates the **PostgreSQL** record and returns a confirmation.
6. **Status Update**: The client updates the local record to `sync_status: "synced"`.

**Offline Mode Flow (Disconnected Persistence)**

1. **UI Trigger**: User saves a note.
2. **Local Commit**: Data is written to **IndexedDB** with `sync_status: "pending"`.
3. **Network Failure**: The request fails or is suppressed by the Service Worker due to `navigator.onLine === false`.
4. **Persistence**: The note remains in the local database. The user can continue navigating the "Biranna" reader without interruption.

**Sync Recovery (Data Reconciliation)**

1. **Connection Detection**: The Service Worker detects a transition to an online state (3G/Wi-Fi).
2. **Queue Processing**: The Service Worker triggers a sync event, querying **IndexedDB** for all entries where `sync_status: "pending"`.
3. **Batch Upload**: Pending updates are sent to the **Sync Engine**.
4. **Conflict Resolution**: If the server holds a record with a newer `updatedAt` timestamp, the server record prevails; otherwise, the client data overwrites the server.
5. **State Alignment**: The client performs a final fetch to align local state with any changes made on other devices (if applicable).

### 4. Functional Requirements

#### 4.1 Authentication & Authorization

- **FR-4.1.1-01**: The system shall allow users to register an account while online, capturing a server-side `JoinDate` that serves as the anchor for the content drip-feed.

- **FR-4.1.2-01**: The system shall authenticate users against the remote PostgreSQL database when a network connection is active, issuing a JWT for session management.
- **FR-4.1.3-01**: The system shall support "Offline Login" by validating user credentials against a salted cryptographic hash of the user’s last successful session stored securely in IndexedDB.
- **FR-4.1.4-01**: The system shall verify the local session’s expiration; if the local token is older than 30 days, it shall require a mandatory online re-authentication.
- **FR-4.1.5-01**: The system shall persist the JWT and user profile in IndexedDB, ensuring session persistence across browser restarts without network access.
- **FR-4.1.6-01**: The system shall implement Role-Based Access Control (RBAC), distinguishing between "Student" (Read/Note-taking) and "Admin" (Content Management) permissions.
- **FR-4.1.7-01**: The system shall automatically refresh the JWT when the network is restored if the token is within its expiration buffer.

#### 4.2 Content Management

- **FR-4.2.1-01**: The system shall enforce a "Drip-Feed" logic where access to content is granted only if `(CurrentDate - JoinDate) >= (ChapterIndex * 7 days)`.

- **FR-4.2.2-01**: The system shall retrieve content fragments from IndexedDB when offline and attempt an API fetch with background caching when online.
- **FR-4.2.3-01**: The system shall use the Cache API to pre-fetch and store "Biranna" assets, including high-resolution WebP parchment textures and audio files, for the subsequent week's chapter.
- **FR-4.2.4-01**: The system shall compare the local `content_version` metadata with the server version during sync to detect and pull curriculum updates.
- **FR-4.2.5-01**: The system shall allow admins to upload content in a structured JSON format that defines page-breaks for the 3D reader engine.

#### 4.3 Offline Storage System

- **FR-4.3.1-01**: The system shall utilize IndexedDB as the primary structured data store for user notes, progress metadata, and chapter text.

- **FR-4.3.2-01**: The system shall utilize the Cache API to ensure 100% of the UI (Next.js assets, CSS, Cinnabar Red SVG icons) is available without a network connection.
- **FR-4.3.3-01**: The system shall maintain an index of local notepad entries to allow for instantaneous client-side keyword searching.
- **FR-4.3.4-01**: The system shall implement a schema versioning mechanism to migrate IndexedDB stores automatically when application updates are deployed.
- **FR-4.3.5-01**: The system shall perform a data integrity checksum on stored chapters to ensure local files have not been corrupted at the browser storage level.

#### 4.4 Synchronization Engine

- **FR-4.4.1-01**: The system shall perform an "Initial Sync" upon first login to download all currently unlocked chapters and user profile metadata.

- **FR-4.4.2-01**: The system shall track "Dirty" records in IndexedDB—entries modified while offline—to be prioritized during the next sync event.
- **FR-4.4.3-01**: The system shall detect conflicts by comparing the `updatedAt` ISO timestamps of local notes against server-side records.
- **FR-4.4.4-01**: The system shall resolve conflicts using a "Last-Write-Wins" (LWW) strategy, ensuring the most recent edit is preserved.
- **FR-4.4.5-01**: The system shall utilize a Service Worker to retry failed POST requests (syncing notes/progress) immediately when `navigator.onLine` returns `true`.
- **FR-4.4.6-01**: The system shall provide a "Sync Now" button in the UI that triggers a manual reconciliation of all local and remote data.

#### 4.5 Progress Tracking

- **FR-4.5.1-01**: The system shall record the `LastPageRead` and `CompletionStatus` for every chapter locally in IndexedDB within 200ms of a page-turn.

- **FR-4.5.2-01**: The system shall allow users to mark chapters as "Complete" while offline, updating the local dashboard visualization immediately.
- **FR-4.5.3-01**: The system shall push progress metadata to the server in the background to maintain cross-device consistency.
- **FR-4.5.4-01**: The system shall restore a user’s exact reading position upon login to a new device by fetching the latest server-side progress log.
- **FR-4.5.5-01**: The system shall validate that a user has viewed at least 90% of a chapter's pages before allowing a "Complete" status transition.

#### 4.6 Dashboard & UI Features

- **FR-4.6.1-01**: The system shall display a student dashboard showing a timeline of the 7-day drip-feed cycle and the current "Formation Progress."

- **FR-4.6.2-01**: The system shall render a "No-Scroll" 3D page-flip navigation and trigger high-fidelity paper-flip audio within 50ms of a swipe gesture.
- **FR-4.6.3-01**: The system shall redirect the user to a "Sealed" UI state (featuring a Wax Seal graphic) if they attempt to access a URL route for a week that is not yet unlocked.
- **FR-4.6.4-01**: The system shall display a "Cinnabar Red" sync indicator when the Service Worker is actively communicating with the server.
- **FR-4.6.5-01**: The system shall display a "Disconnected" banner if a network-dependent action (like Initial Sync) is attempted while offline.

#### 4.7 Admin Panel

- **FR-4.7.1-01**: The system shall restrict access to the Admin Panel to users with the `ROLE_ADMIN` claim verified by the server.

- **FR-4.7.2-01**: The system shall provide a WYSIWYG editor for creating new manuscript pages with parchment-preview modes.
- **FR-4.7.3-01**: The system shall allow admins to push "Hotfix" content updates that bypass the standard sync interval.
- **FR-4.7.4-01**: The system shall display aggregate analytics on student cohort progress and unlock rates.
- **FR-4.7.5-01**: The system shall provide a "Master Unlock Key" feature that allows admins to bypass the 7-day drip-feed timer for quality assurance and testing purposes.

### 5. Non-Functional Requirements

#### 5.1 Performance Requirements

- **NFR-5.1-01**: The 3D Reader Engine shall maintain a consistent frame rate of 60 frames per second (fps) during page-flip animations on mid-tier mobile devices to ensure visual fluidity.

- **NFR-5.1-02**: The system shall trigger high-fidelity paper sound effects with a latency of less than 100 milliseconds (ms) from the moment a swipe gesture is registered.
- **NFR-5.1-03**: The PWA shell shall achieve a Time-to-Interactive (TTI) of less than 2.0 seconds when served from the local Service Worker cache, regardless of network speed.
- **NFR-5.1-04**: Local data operations (IndexedDB read/write for notes) shall complete in less than 50ms to prevent UI blocking during intensive study sessions.

#### 5.2 Reliability Requirements

- **NFR-5.2-01**: All write operations to IndexedDB shall be wrapped in atomic transactions to prevent data partiality or "ghost" notes in the event of an application crash.

- **NFR-5.2-02**: The system shall implement an auto-save mechanism that persists notepad entries every 5 seconds of inactivity or immediately upon a page-turn event.
- **NFR-5.2-03**: The system shall guarantee 100% data retention for all committed local transactions following a sudden power loss, OS-level browser termination, or hardware restart.

#### 5.3 Availability Requirements

- **NFR-5.3-01**: The core manuscript reader and previously cached chapters shall be available for use 100% of the time, even if the central server is unreachable or the device is in Airplane Mode.

- **NFR-5.3-02**: The Service Worker shall intercept 100% of requests for static assets (fonts, parchment textures, icons) once the initial application shell is installed.

#### 5.4 Scalability Requirements

- **NFR-5.4-01**: The architecture shall support a full 52-week curriculum (up to 365 individual chapters) without a degradation in UI responsiveness or navigation speed.

- **NFR-5.4-02**: Each chapter's total asset weight (JSON text + WebP textures) shall not exceed 5MB to ensure the total application footprint remains within standard mobile browser storage quotas.
- **NFR-5.4-03**: The system shall monitor browser storage quotas and provide a low-storage warning when usage reaches 80% of the allocated browser limit.

#### 5.5 Security Requirements

- **NFR-5.5-01**: JWTs shall be stored using secure client-side mechanisms with an enforced short TTL (Time-To-Live) and a 30-day "hard-logout" for offline-only sessions.

- **NFR-5.5-02**: The local `JoinDate` used for the drip-feed logic shall be stored as part of a signed cryptographic object to prevent users from bypassing the "Weekly Lock" via browser console manipulation.
- **NFR-5.5-03**: The system shall implement a strict Content Security Policy (CSP) to disable unsafe-eval and prevent cross-site scripting (XSS) attacks in the offline note-taking module.

#### 5.6 Usability Requirements

- **NFR-5.6-01**: The system shall utilize Ethiopic Unicode fonts with a minimum size of 18px on mobile devices to ensure legibility of Amharic text against parchment textures.

- **NFR-5.6-02**: The UI shall strictly enforce a fixed-viewport, "no-scroll" constraint, where all content fits within the 3D Biranna interface to maintain skeuomorphic immersion.
- **NFR-5.6-03**: The interface shall maintain a minimum contrast ratio of 4.5:1 for "Cinnabar Red" accents and primary text against the parchment background (WCAG 2.1 Level AA).

#### 5.7 Maintainability Requirements

- **NFR-5.7-01**: The system shall utilize CSS Variables for all parchment themes and accent colors, allowing for a complete visual re-brand (e.g., "Dark Mode" parchment) by updating a single configuration file.

- **NFR-5.7-02**: Curriculum updates and new chapter structures shall be defined via modular JSON schemas, allowing non-technical admins to update content without altering the core Next.js engine.

#### 5.8 Portability Requirements

- **NFR-5.8-01**: The PWA shall maintain full functional parity across iOS Safari (v15+) and Android Chrome (v90+), including support for offline caching and home-screen installation.

- **NFR-5.8-02**: The 3D reader engine shall provide a responsive scaling factor that adapts the "Biranna" manuscript aspect ratio for both 9:16 smartphone screens and 4:3 tablet displays.

### 6. Security Requirements

#### 6.1 Authentication Security

- **SR-6.1-01**: The system shall utilize asymmetric cryptographic signatures (RS256 or ES256) for all JSON Web Tokens (JWT) to ensure authenticity and non-repudiation of user sessions.

- **SR-6.1-02**: To mitigate session replay attacks, the authentication server shall include a unique `jti` (JWT ID) and a high-entropy `nonce` in every token, maintaining a server-side blacklist for revoked or re-used identifiers.
- **SR-6.1-03**: The system shall implement strict XSS mitigation strategies, including a robust Content Security Policy (CSP) and sanitization of all user-generated notepad entries prior to rendering, to prevent token theft via script injection.

#### 6.2 Local Data Encryption

- **SR-6.2-01**: The system shall provide "Privacy at Rest" by encrypting user notepad entries within IndexedDB using AES-GCM-256. The encryption key shall be derived from the user’s credentials using PBKDF2 with a minimum of 600,000 iterations and a unique salt.

- **SR-6.2-02**: Sensitive metadata, including local progress logs, shall be obfuscated within the browser storage to prevent casual inspection through standard developer tools.

#### 6.3 Token Storage Strategy

- **SR-6.3-01**: The system shall store the session Refresh Token in an `HttpOnly`, `Secure`, and `SameSite=Strict` cookie, ensuring it is inaccessible to client-side JavaScript.

- **SR-6.3-02**: The Access Token shall be held exclusively in volatile memory (within a JavaScript closure or private state) and never persisted to `localStorage` or `sessionStorage` to minimize the window of exposure.

#### 6.4 Offline Trust Model

- **SR-6.4-01**: To prevent bypass of the "Weekly Lock" via system clock manipulation, the system shall validate the 7-day drip-feed logic using a server-signed timestamp (`SyncTime`) issued during the last successful connection.

- **SR-6.4-02**: The client shall maintain a monotonic counter for session duration; if the local clock skew relative to the `SyncTime` exceeds a predefined drift threshold, the system shall lock further content access until a network-based time-attestation is performed.

#### 6.5 Data Tampering Protection

- **SR-6.5-01**: Every chapter content fragment (JSON) shall be delivered with an associated HMAC (Hash-based Message Authentication Code). The client shall verify this signature before rendering any chapter to ensure the local Biranna content has not been tampered with to unlock restricted sections.

- **SR-6.5-02**: The system shall perform periodic background audits of the IndexedDB schema integrity; if unauthorized modifications to the "Unlocked" status flags are detected, the system shall trigger a mandatory state-resynchronization from the server.

#### 6.6 Secure Sync Protocol

- **SR-6.6-01**: All data transmission between the PWA and the Next.js API shall be conducted over TLS 1.3 to ensure perfect forward secrecy and protection against man-in-the-middle (MITM) attacks.

- **SR-6.6-02**: The Sync Engine shall enforce "Identity-Bound Synchronization," where the server rejects any incoming data packets (notes, progress) if the `UserID` embedded in the encrypted payload does not match the `sub` claim of the authenticated JWT.

#### 6.7 Backup and Recovery

- **SR-6.7-01**: The system shall maintain an authoritative, versioned state of the user’s formation progress in the PostgreSQL database, enabling full recovery of notes and "Weekly Lock" status if the user clears their browser cache or migrates to a new device.

- **SR-6.7-02**: Upon re-authentication after data loss, the system shall perform a "Reconciliation Fetch" to rebuild the local IndexedDB state from the server-side backup using the most recent cryptographic checkpoints.

### 7. Data Requirements

#### 7.1 Data Models

The system utilizes a dual-persistence strategy. Local data structures in IndexedDB are mapped to relational tables in PostgreSQL. All models include synchronization metadata to support the "Last-Write-Wins" reconciliation logic.

**User Model**

```typescript
interface User {
  id: string; // UUID Primary Key
  email: string;
  joinDate: string; // ISO 8601 - Anchor for 7-day drip-feed logic
  role: "STUDENT" | "ADMIN";
  lastSyncTimestamp: string; // ISO 8601 - Last successful reconciliation
  version: number; // Optimistic concurrency control
}
```

**Content Model (The "Biranna" Structure)**

```typescript
interface Content {
  id: string; // UUID Primary Key
  weekIndex: number; // 0-based index for (weekIndex * 7 days) unlock logic
  title: string;
  slug: string; // URL-friendly identifier
  contentJson: {
    pages: Array<{
      pageNumber: number;
      bodyText: string; // Supports Markdown/HTML fragments
      assets: string[]; // Array of cached WebP URLs
    }>;
  };
  isLocked: boolean; // Calculated field based on JoinDate
  createdAt: string; // ISO 8601
  version: number;
}
```

**Progress Model**

```typescript
interface Progress {
  userId: string; // Composite Foreign Key
  chapterId: string; // Composite Foreign Key
  lastPageRead: number;
  isCompleted: boolean;
  timeSpentSeconds: number;
  updatedAt: string; // ISO 8601 - Used for LWW sync
  version: number;
}
```

**Note/Diary Model**

```typescript
interface Note {
  id: string; // Client-generated UUID
  userId: string;
  chapterId: string;
  pageIndex: number;
  contentEncrypted: string; // AES-GCM-256 result
  updatedAt: string; // ISO 8601
  syncStatus: "synced" | "pending"; // Local-only flag
  version: number;
}
```

#### 7.2 Data Retention Policy

- **Local Persistence**: To ensure zero-latency offline access, all data written to IndexedDB and the Cache API shall be retained indefinitely until the user explicitly triggers a "Clear Local Storage" action or the browser enforces a storage quota purge.

- **Server Persistence**: All synchronized progress logs, notes, and user profile data shall be retained in the PostgreSQL database for the lifetime of the user’s account.
- **Deletion**: Upon account termination, the system shall implement a 30-day "Soft-Delete" buffer before executing a permanent "Hard-Delete" of all PII (Personally Identifiable Information).

#### 7.3 Data Backup Strategy

- **Immediate Synchronization**: The system shall trigger an asynchronous background sync to the server on every Note "Save" event or change in chapter completion status.

- **Session-Based Recovery**: To mitigate data loss from browser crashes, the Sync Engine shall automatically attempt a reconciliation whenever the PWA regains focus (`visibilitychange` event) or the `navigator.onLine` state transitions to `true`.
- **Server Side**: The PostgreSQL database shall utilize Daily Automated Snapshots with a Point-in-Time Recovery (PITR) window of 7 days.

#### 7.4 Data Migration Strategy

- **Client-Side Schema Evolution**: The system shall utilize the `onupgradeneeded` lifecycle hook of IndexedDB to manage local schema versions. Migration scripts shall be idempotent, ensuring that adding new fields (e.g., to the `Note` model) does not corrupt existing offline entries.

- **API Versioning**: The Next.js API shall utilize header-based versioning (`X-API-Version`) to ensure that older PWA installations can still synchronize data even if the server-side PostgreSQL schema has advanced.

#### 7.5 Data Consistency Rules

The system operates under an **Eventually Consistent** model, governed by the following constraints:

1. **Source of Truth (Static)**: The **Server** is the absolute source of truth for Chapter Content and the `JoinDate` anchor. Local modifications to these fields shall be overwritten during sync.
2. **Source of Truth (Dynamic)**: The **Client** is the primary source of truth for User Notes. The server acts as a durable mirror.
3. **Conflict Resolution**: In the event of a conflict between local and remote dynamic state, the system shall apply a **Last-Write-Wins (LWW)** rule based on the `updatedAt` ISO timestamp.
4. **Referential Integrity**: Notes cannot be persisted unless they are associated with a valid `chapterId` existing in the local Content store.

### 8. Error Handling & Recovery

#### 8.1 Network Failure

The system is designed to operate under "Disconnected-by-Default" conditions. Network failures are treated as expected states rather than exceptional errors.

- **Detection**: If `navigator.onLine` returns `false` or a fetch request to the Next.js API results in a `NetworkError` or timeout.
- **UI Response**: The system shall display a persistent but non-intrusive "Offline Mode" banner using Cinnabar Red accents.
- **Retry Logic**: The Sync Engine shall implement an **Exponential Backoff** strategy for failed background synchronization attempts. Retries shall occur at intervals of 2s, 4s, 8s, 16s, and 30s, thereafter capping at 1-minute intervals until connectivity is restored.
- **Persistence**: All user-generated notes and progress updates shall remain queued in IndexedDB with `sync_status: "pending"` until a successful 200 OK response is received from the server.

#### 8.2 Storage Corruption

In the event that the browser's IndexedDB instance becomes unreadable or inconsistent due to OS-level interruptions or storage hardware failure:

- **Detection**: Triggered if the `request.onerror` event is fired during database initialization or if a cryptographic integrity check on a chapter fragment fails.
- **Recovery (Nuclear Reset)**:
  1. **Integrity Check**: The system shall attempt to verify the database version and object store structure.
  2. **Clear State**: If corrupted, the system shall programmatically execute `indexedDB.deleteDatabase()` and clear the Cache API storage.
  3. **Full Re-sync**: The user shall be prompted to re-authenticate online. Upon login, the system shall force a full "Reconciliation Fetch" to restore all notes, progress metadata, and the `JoinDate` anchor from the authoritative PostgreSQL database.
- **Priority**: User notes must be prioritized; the system shall attempt to export corrupted data to a plain-text "Emergency Log" before clearing the database if the read-only mode is still functional.

#### 8.3 Sync Failure

Defined as a scenario where the network is active, but the server rejects a data packet (e.g., 400 Bad Request, 422 Unprocessable Entity).

- **Handling**: If the server returns a validation error, the system **shall not** delete the local data.
- **Error Flagging**: The specific record in IndexedDB shall be updated with `sync_status: "error"` and a `last_error_log` field detailing the server's rejection reason.
- **User Notification**: A "Sync Conflict" indicator shall appear on the dashboard. The system shall preserve the local version to allow the user to manually copy their notes before the system attempts a forced overwrite from the server's state.

#### 8.4 Authentication Failure

If a JWT expires or is invalidated while the user is in an offline state:

- **State Transition**: The system shall transition into **"Read-Only Offline Mode."**
- **Locking Logic**:
  - **IF** session is invalid **AND** network is offline:
    - **THEN** Allow 3D Reader Engine to display previously cached Biranna chapters.
    - **THEN** Disable "Save" and "Edit" functionality for Notepad entries.
    - **THEN** Display a "Session Expired: Re-connect to Save Progress" notification.
- **Re-auth**: Full write-access and background sync shall only be restored once the user successfully completes an online login.

#### 8.5 Partial Data Recovery (Deep Clean)

If the browser’s Quota Management API executes a "Deep Clean" (purging Cache API assets like parchment textures to reclaim disk space):

- **Detection**: On every route change or page-turn, the Reader Engine shall verify the presence of the required WebP textures and flip-audio files in the cache.
- **Restoration Flow**:
  1. **IF** assets are missing:
     - **THEN** Render the page using a lightweight CSS-only "Loading Parchment" placeholder.
     - **THEN** Trigger an immediate background fetch for the missing assets from the CDN/Next.js server.
  2. **UI Feedback**: Display a "Restoring Manuscript Details..." progress indicator until high-fidelity assets are re-cached.
- **Optimization**: The system shall prioritize the current chapter's assets over future "drip-feed" weeks during a partial recovery.

### 9. Logging & Monitoring

#### 9.1 Client-Side Logging

In a "Disconnected-by-Default" environment, the client acts as the primary logger. The system shall maintain a dedicated `logs` object store in IndexedDB to capture telemetry during offline sessions.

- **Performance Metrics**: The system shall log the execution time of 3D page-flip animations and the latency of IndexedDB read/write operations.
- **Lifecycle Events**: The system shall log critical local events including Service Worker installation, `onupgradeneeded` database migrations, and "Weekly Lock" trigger evaluations.
- **Privacy-First Constraint**: Client-side logs shall capture metadata only (e.g., `event_type`, `timestamp`, `error_code`). Under no circumstances shall the content of user-generated notes or PII (Personally Identifiable Information) be recorded in the logs.
- **Log Rotation**: To prevent local storage bloat, the client shall implement a rotating log strategy, retaining only the most recent 200 telemetry entries.

#### 9.2 Server Logging

The server-side logging architecture shall focus on the health of the Next.js API routes and the PostgreSQL persistence layer.

- **Authentication Auditing**: The system shall log all login attempts, token refresh requests, and failed authentication events with associated IP addresses (anonymized per GDPR/local regulations).
- **API Latency Monitoring**: The system shall monitor the response times of the Sync Engine endpoints, specifically tracking the duration of data reconciliation queries.
- **Resource Utilization**: Monitoring shall include database connection pool saturation and server-side memory consumption during high-concurrency sync windows.

#### 9.3 Sync Logs (Sync Audit Trails)

The system shall generate a structured "Sync Audit Trail" for every reconciliation event to ensure data lineage and facilitate troubleshooting of conflict resolution.

- **Log Structure**: Each sync entry shall be stored as a JSON object containing:
  - `userId`: The unique identifier of the student.
  - `syncId`: A unique UUID for the specific session.
  - `itemsSynced`: The count of notepad entries and progress updates processed.
  - `conflictsResolved`: The number of instances where the "Last-Write-Wins" logic was applied.
  - `duration`: The total time in milliseconds from request receipt to response delivery.
  - `status`: One of `SUCCESS`, `PARTIAL_FAILURE`, or `REJECTED`.

#### 9.4 Error Reporting

The system shall implement an "Offline-Queue-and-Forward" mechanism for crash reporting and unhandled exception tracking.

- **Exception Capture**: The system shall intercept unhandled JavaScript errors, Promise rejections, and Service Worker failures.
- **Offline Queuing**: If an error occurs while the device is offline, the system shall serialize the stack trace and state metadata into the IndexedDB error queue.
- **Batch Uploading**: Upon detection of a stable network connection (`navigator.onLine === true`), the system shall batch-upload all queued error reports to the `/api/logs/error` endpoint or a configured observability platform (e.g., Sentry).
- **Priority Level**: Errors involving data corruption or sync failure shall be flagged with `CRITICAL` priority to trigger immediate developer alerts via the server-side monitoring dashboard.

### 10. Testing Requirements

#### 10.1 Unit Testing

The system shall utilize **Vitest** for isolated testing of core business logic, ensuring that the fundamental mathematical rules of the formation engine are infallible.

- **Drip-Feed Logic Validation**: The system shall test the `isChapterLocked(joinDate, chapterIndex, currentDate)` function against high-variance edge cases:
  - **Boundary Testing**: Exact 7-day (604,800,000ms) intervals.
  - **Temporal Edge Cases**: Leap years (Feb 29), Daylight Savings transitions, and Unix Epoch zero-values.
  - **Logic Integrity**: Ensuring that `Chapter 0` is unlocked at $T+0$ and `Chapter 1` is strictly inaccessible at $T+6.99$ days.
- **Cryptographic Utility Testing**: Unit tests shall verify the AES-GCM encryption/decryption wrappers to ensure that data remains retrievable post-migration.

#### 10.2 Integration Testing

Integration tests shall focus on the data persistence bridge between the Next.js React state and the browser’s IndexedDB.

- **State-to-Storage Pipeline**: Using **Cypress**, the system shall verify that a note entered into a React component is successfully written to the IndexedDB `notes` store and retrieved upon a page refresh.
- **Service Worker Lifecycle**: Tests shall validate that the Service Worker correctly intercepts asset requests and serves cached "Biranna" textures when the network is throttled to 0kbps.
- **Hydration Checks**: Ensure that the 3D Reader Engine correctly hydrates with local progress data before the first render to prevent "Layout Shift" or progress loss.

#### 10.3 Offline Mode Testing

**Playwright** shall be the primary tool for simulating intermittent and zero-connectivity environments.

- **Network Severance Simulation**: Tests shall use `browserContext.setOffline(true)` mid-session during a note-taking event to verify that the UI remains responsive and the Sync Engine correctly flags the record as `pending`.
- **Cache Resilience**: Verify that the application shell (Next.js assets) and manuscript assets (WebP/MP3) are accessible via the Cache API in a "Clean Profile" state without initial network access.
- **Zero-Latency Interactions**: Ensure that page-turns and local searches function with $0$ network requests.

#### 10.4 Sync Testing

Testing shall validate the "Eventually Consistent" model using multi-context simulations in **Playwright**.

- **Conflict Resolution (LWW)**:
  1. User edits Note A on **Device 1** while offline at $T+10s$.
  2. User edits Note A on **Device 2** while online at $T+20s$.
  3. User brings **Device 1** online.
  4. **Requirement**: The system must verify that Device 1’s local state is updated to match Device 2’s $T+20s$ version, as it holds the most recent timestamp.
- **Atomic Batching**: Test that a sync involving 50+ pending notes either completes entirely or fails gracefully without duplicating entries.

#### 10.5 Security Testing

The system shall undergo rigorous testing to ensure the "Weekly Lock" cannot be bypassed through client-side manipulation.

- **Time-Travel Attack Mitigation**: Tests shall attempt to bypass the drip-feed lock by manually changing the browser's system clock. The test fails if the system grants access, as it should detect the drift against the server-signed `SyncTime` timestamp.
- **JWT Tampering**: Verify that the Next.js API rejects requests if a user manually modifies the `role` or `joinDate` claims within the local JWT stored in IndexedDB.
- **Storage Injection**: Attempt to inject raw JSON into IndexedDB stores to verify that the 3D Engine sanitizes content before rendering to prevent XSS.

#### 10.6 Load Testing

Performance benchmarks shall be enforced to maintain the "Tactile Reader" experience.

- **Scale Benchmarking**: The system shall be populated with a mock dataset of 1,000+ notepad entries and 52 weeks of curriculum content.
- **Rendering Performance**: Using Chrome DevTools / Playwright Trace, the system must maintain a consistent 60fps during 3D page-flip animations under full data load.
- **Memory Leak Detection**: Monitor the "Heap" size during a continuous 30-minute reading session to ensure the `Framer Motion` engine and `IndexedDB` cursors are correctly disposed of.

### 11. Deployment Requirements

#### 11.1 Hosting Requirements

- **Frontend & API**: The **Next.js 15+** application and associated API routes shall be hosted on **Vercel**, utilizing its Edge Network to ensure low-latency delivery of the application shell globally.

- **Database**: The production PostgreSQL instance shall be hosted on a managed serverless provider (e.g., **Neon**, **Supabase**, or **Railway**) to support automatic scaling and 7-day **Point-in-Time Recovery (PITR)** for critical user progress data.
- **Content Delivery Network (CDN)**: All high-fidelity "Biranna" assets—including WebP parchment textures and MP3 page-flip audio—shall be served via a global CDN with aggressive `Cache-Control` headers to minimize origin fetch latency during the initial "Drip-Feed" download.

#### 11.2 Environment Configuration

- **Secret Management**: All sensitive credentials shall be managed via **Vercel Environment Variables** or a dedicated Secret Manager. Hard-coding of secrets in the source code is strictly prohibited.

- **Required Variables**: The system shall require the following configurations at a minimum:
  - `DATABASE_URL`: Connection string for the managed PostgreSQL instance.
  - `JWT_SECRET`: High-entropy string for signing authentication tokens.
  - `NEXT_PUBLIC_API_URL`: The base URL for client-side fetch requests.
  - `NEXT_PUBLIC_SERVICE_WORKER_VERSION`: A unique string used to trigger Service Worker updates.
  - `CDN_BASE_URL`: The origin for manuscript assets.

#### 11.3 Build Process

- **Compilation**: The build process shall execute `next build`, transforming the Next.js 15+ source into an optimized production bundle.

- **PWA Manifest Generation**: The build pipeline shall generate a valid `manifest.json` defining the application name, "Cinnabar Red" theme colors, and icons for Home Screen installation.
- **Service Worker Synthesis**:
  1. The build shall trigger a post-compilation script (via Workbox or custom CLI) to generate `sw.js`.
  2. This script shall programmatically inject a **Precache Manifest** containing hashes for all static assets (fonts, parchment textures, audio) to ensure the Service Worker can perform atomic asset versioning.
- **Optimization**: Images shall be optimized for WebP format during the build phase to reduce the storage footprint in the client-side Cache API.

#### 11.4 CI/CD Pipeline

- **Workflow Automation**: The system shall utilize **GitHub Actions** for the continuous integration and deployment pipeline.

- **Validation Gating**: Every push to the `main` branch shall trigger the following sequence:
  1. **Linting & Type Checking**: Execution of `next lint` and `tsc`.
  2. **Unit Testing**: Execution of **Vitest** suites for drip-feed and cryptographic logic.
  3. **End-to-End Testing**: Execution of **Playwright** suites specifically targeting "Offline Mode" functionality and IndexedDB persistence.
- **Automated Deployment**: Deployment to the Vercel production environment shall only proceed if all 100% of tests pass.

#### 11.5 Rollback Strategy

- **Instant Reversion**: The system shall support instant version rollbacks via Vercel’s deployment history, allowing for sub-60-second restoration of the previous production state.

- **Service Worker Kill-Switch**: To mitigate "Cache Loops" or the "White Screen of Death" caused by corrupted Service Worker logic:
  1. The system shall maintain a `CLEAR_CACHE_VERSION` flag.
  2. Updating this flag shall force the Service Worker to unregister itself and clear the Cache API/IndexedDB state on the next client-side check-in.
- **Database Migrations**: All PostgreSQL schema changes must be backward-compatible (using "Expand and Contract" pattern) to allow the frontend to roll back without requiring a database revert.

### 12. Future Extensibility Considerations

#### 12.1 Modular Design: The Biranna Platform Core

The architecture shall evolve toward a "Headless Manuscript Engine" model, where the 3D Tactile Reader is entirely decoupled from the "ሕንጸተ ሰብእ" (Hinsete Seb) curriculum.

- **Agnostic Content Loading**: The UI Layer shall be refactored to consume a standardized **Biranna JSON Schema**. This allows the engine to render any formation content—be it historical, theological, or academic—provided the input follows the page-break and asset-mapping specification.
- **Themed Styling Engine**: The current "Cinnabar Red" and parchment aesthetics shall be abstracted into a theme provider, enabling the injection of different visual identities (e.g., "Stone Tablet" or "Modern Paper") without altering the core Next.js navigation logic.

#### 12.2 Plugin Support: Interactive Widgets

To enhance the formation experience, the system shall support a plugin-based architecture for "In-Page Widgets."

- **Component Registry**: The reader shall implement a registry for sandboxed, offline-first widgets that can be embedded directly within chapter pages.
- **Initial Plugin Candidates**:
  - **Offline-First Meditation Timer**: A local-state-driven timer with pre-cached ambient audio.
  - **Dynamic Glossary**: A pop-over utility that maps Ge'ez or specialized academic terms to local definitions stored in IndexedDB.
- **Standardized Hooks**: Plugins shall utilize a unified API to access the local storage layer and the user’s progress state without compromising the security of the core engine.

#### 12.3 Multi-Device Sync: Cross-Platform State Harmonization

As the user base expands to multiple devices per student, the system must transition from a simple "Last-Write-Wins" model to a more robust **Global Sync Lock**.

- **Server-Authoritative Attestation**: To prevent the 7-day drip-feed timer from being exploited via multiple local clocks, the system shall implement a server-side "Release Gate."
- **Clock Skew Compensation**: The Sync Engine shall calculate the offset between the device's local clock and the Server-Signed `SyncTime`. If a device’s drift exceeds a 1-hour threshold, the system shall disable content unlocking until a mandatory online time-attestation is performed.
- **State Merging**: Future iterations shall investigate CRDT (Conflict-free Replicated Data Type) structures for notepad entries to allow concurrent editing on phone and laptop without data loss.

#### 12.4 Versioning Strategy: Data Migration Path

The platform shall adopt a strict **Semantic Versioning (SemVer)** approach for both the API (`v1.2.0`) and the local Database Schema (`db_v4`).

- **Backward-Compatible Migrations**: Every change to the "Note" or "Progress" schema must include an automated migration script within the IndexedDB `onupgradeneeded` lifecycle.
- **Data Sovereignty**: The system shall prioritize the preservation of user-generated content during upgrades. If a schema change is destructive, the application shall automatically export a JSON backup of the user’s notes to a local "Archive" store before the migration commences.
- **API Deprecation Policy**: The Next.js backend shall support "N-1" version compatibility, ensuring that students who haven't updated their PWA installation in several months can still synchronize their progress securely.

### 13. Appendices

#### 13.1 System Context & Data Flow Overview

The system architecture follows a "Local-First" loop where the user interface never waits for a network round-trip.

**The Life of a Note:**

1. **User Interaction**: The student inputs a reflection into the `<BirannaNotepad />` component.
2. **React State (Transient)**: The change is captured in a local React state to ensure 0ms input latency (Optimistic UI).
3. **IndexedDB (Persistent)**: An asynchronous write is committed to the `notes` object store using an **Atomic Transaction**. The record is marked with `syncStatus: "pending"`.
4. **Service Worker (Intercept)**: The Service Worker detects the write or a network "online" event. It intercepts the outgoing request and attempts to proxy the payload to the server.
5. **Next.js API (Transport)**: The server receives the POST request, validates the JWT, and extracts the encrypted note payload.
6. **PostgreSQL (Authoritative Truth)**: The database performs an `UPSERT` operation. Upon success, the server returns the updated `version` and `timestamp`.
7. **Final Reconciliation**: The client receives the 200 OK, updates the local record to `syncStatus: "synced"`, and aligns the local version number.

#### 13.2 Data Flow Diagrams (DFD)

[Description of DFD: Highlighting the isolation of the Reader Engine. Content flows from the Cache API to the UI, while user data flows through a unidirectional pipe from IndexedDB to the API.]

#### 13.3 Sequence Diagram: The 7-Day Unlock Sequence

This sequence ensures chronological formation integrity even without a heartbeat to the server.

1. **Navigation**: User attempts to open "Week 2."
2. **Local Check**: The Client retrieves the `JoinDate` and the last server-signed `SyncTime` from IndexedDB.
3. **Validation**:
   - **IF** `(SystemClock - JoinDate)` is less than 7 days, access is denied.
   - **IF** `(SystemClock)` shows significant drift compared to the monotonic `SyncTime` counter, the system triggers a "Time-Skew" warning.
4. **Decryption**: If valid, the engine retrieves the Week 2 JSON fragment.
5. **Asset Mounting**: The Service Worker pulls WebP parchment textures from the **Cache API**.
6. **Rendering**: The 3D engine hydrates the view and the "Wax Seal" UI element is removed.

#### 13.4 Glossary

- **Skeuomorphism**: A UI design philosophy where digital elements mimic the aesthetics and physical behaviors of real-world objects (e.g., parchment textures and paper sounds).

- **100dvh**: Dynamic Viewport Height; a CSS unit ensuring the "No-Scroll" UI perfectly fits mobile screens despite browser address bar resizing.
- **LWW (Last-Write-Wins)**: A conflict resolution strategy where the record with the most recent `updatedAt` timestamp overwrites previous versions.
- **Hydration**: The process of mapping stored data from IndexedDB into React components to make the UI interactive.
- **PWA Manifest**: A JSON file that allows the web app to be installed on a mobile home screen with a dedicated icon and splash screen.
- **Atomic Transaction**: A database operation that ensures a series of reads/writes either all succeed or all fail, preventing partial data corruption.

#### 13.5 Risk Analysis & Mitigation

| Risk                                 | Impact                                                                                                       | Mitigation Strategy                                                                                                                                                                                                                                                     |
| :----------------------------------- | :----------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Risk 1: Browser Storage Eviction** | High: The OS may delete IndexedDB data if the device runs low on space, causing loss of unsynced notes.      | **Mitigation**: The app shall call `navigator.storage.persist()` to request "persistent-storage" status. Additionally, the UI shall display a "Sync Pending" count to encourage users to find a signal when local data is high.                                         |
| **Risk 2: Clock Tampering**          | Medium: Students might change their device's system date to "Time-Travel" and unlock chapters early.         | **Mitigation**: The system relies on a server-signed `SyncTime` anchor. If the local date is earlier than the last known `SyncTime`, or if the gap between local time and `SyncTime` is suspiciously large, the "Weekly Lock" remains engaged until an online check-in. |
| **Risk 3: Service Worker Stalling**  | Medium: A buggy Service Worker can "trap" a user in an old version of the app (the "White Screen of Death"). | **Mitigation**: Implement a "Version Fail-safe." The app shall check a small, uncacheable `version.json` on the server. If a mismatch persists, a "Clear Cache & Update" button will appear in the footer to force-unregister the Service Worker.                       |
| **Risk 4: Low-End Device Latency**   | Low: Older phones may struggle to render 3D page-flips at 60fps.                                             | **Mitigation**: The engine shall detect frame-drops and automatically disable advanced shaders or reduce texture resolution to maintain usability.                                                                                                                      |

---

**END OF DOCUMENT**
