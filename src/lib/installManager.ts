// src/lib/installManager.ts

// TypeScript type for Android beforeinstallprompt
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export class InstallManager {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private swRegistration: ServiceWorkerRegistration | null = null;
  private onInstalledCallback: (() => void) | null = null;

  constructor() {
    // Service Worker ready + update listener
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready
        .then((reg) => {
          this.swRegistration = reg;
          this.listenForUpdate(reg);
        })
        .catch(() => console.warn("[InstallManager] SW not ready"));
    }

    // Capture beforeinstallprompt for Android
    this.listenBeforeInstallPrompt();
  }

  /** Listen for Android install prompt event */
  private listenBeforeInstallPrompt() {
    window.addEventListener("beforeinstallprompt", (e: Event) => {
      e.preventDefault(); // prevent auto-prompt
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      console.log("[InstallManager] Android install prompt captured");
    });
  }

  /** Trigger install prompt */
  public promptInstall() {
    if (!this.deferredPrompt) return;
    this.deferredPrompt.prompt();
    this.deferredPrompt.userChoice.then((choice) => {
      if (choice.outcome === "accepted") {
        console.log("[InstallManager] PWA installed on Android");
        this.onInstalledCallback?.();
      } else {
        console.log("[InstallManager] User dismissed install prompt");
      }
      this.deferredPrompt = null;
    });
  }

  /** Optional callback when install completes */
  public onInstalled(callback: () => void) {
    this.onInstalledCallback = callback;
  }

  /** Listen for new SW version and prompt user */
  private listenForUpdate(registration: ServiceWorkerRegistration) {
    const notifyUpdate = () => {
      if (confirm("Hinsete update available. Refresh to update?")) {
        window.location.reload();
      }
    };

    if (registration.waiting) notifyUpdate();

    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing;
      newWorker?.addEventListener("statechange", () => {
        if (
          newWorker.state === "installed" &&
          navigator.serviceWorker.controller
        ) {
          notifyUpdate();
        }
      });
    });
  }

  /** iOS install instructions fallback */
  public showIOSInstallInstructions() {
    const isIOS = /iP(ad|hone|od)/.test(navigator.userAgent);
    const isStandalone = (window.navigator as any).standalone;
    if (isIOS && !isStandalone) {
      setTimeout(() => {
        alert("Install Hinsete on iOS:\n\nTap 'Share' → 'Add to Home Screen'.");
      }, 800);
    }
  }
}
