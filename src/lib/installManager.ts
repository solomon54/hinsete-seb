// src/lib/installManager.ts

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

class InstallManager {
  private static instance: InstallManager | null = null;
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private onInstalledCallback: (() => void) | null = null;
  private initialized = false;

  private constructor() {
    if (typeof window === "undefined") return;
    this.initialize();
  }

  public static getInstance(): InstallManager {
    if (!InstallManager.instance) {
      InstallManager.instance = new InstallManager();
    }
    return InstallManager.instance;
  }

  private initialize() {
    if (this.initialized) return;
    this.initialized = true;

    this.setupInstallPromptListener();
    this.setupAppInstalledListener();
  }

  /* =========================================
     1. SERVICE WORKER & UPDATES
  ========================================= */

  public async register() {
    if (typeof window === "undefined" || !("serviceWorker" in navigator))
      return;

    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      this.handleUpdates(reg);
    } catch (err) {
      console.error("[InstallManager] SW registration failed:", err);
    }
  }

  private handleUpdates(reg: ServiceWorkerRegistration) {
    // If a new worker is already waiting in the background
    if (reg.waiting) {
      this.dispatchUpdate();
    }

    reg.addEventListener("updatefound", () => {
      const newWorker = reg.installing;
      newWorker?.addEventListener("statechange", () => {
        // Only notify when the new worker is fully installed and ready
        if (
          newWorker.state === "installed" &&
          navigator.serviceWorker.controller
        ) {
          this.dispatchUpdate();
        }
      });
    });
  }

  private dispatchUpdate() {
    window.dispatchEvent(new CustomEvent("swUpdateAvailable"));
  }

  /* =========================================
     2. INSTALLATION LOGIC
  ========================================= */

  private setupInstallPromptListener() {
    window.addEventListener("beforeinstallprompt", (event: Event) => {
      event.preventDefault();
      this.deferredPrompt = event as BeforeInstallPromptEvent;
      console.log("✅ [InstallManager] Install prompt captured");

      // Notify UI that the 'Install' button can now be shown
      window.dispatchEvent(new CustomEvent("pwaInstallAvailable"));
    });
  }

  private setupAppInstalledListener() {
    window.addEventListener("appinstalled", () => {
      console.log("🚀 [InstallManager] App successfully installed");
      this.deferredPrompt = null;
      this.onInstalledCallback?.();
    });
  }

  public canInstall(): boolean {
    return !!this.deferredPrompt;
  }

  public async promptInstall(): Promise<boolean> {
    if (!this.deferredPrompt) return false;

    await this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;

    if (outcome === "accepted") {
      this.deferredPrompt = null;
    }

    return outcome === "accepted";
  }

  public onInstalled(callback: () => void) {
    this.onInstalledCallback = callback;
  }

  /* =========================================
     3. DEVICE CHECKS
  ========================================= */

  public isIOS(): boolean {
    if (typeof window === "undefined") return false;
    const isIOS = /iP(ad|hone|od)/.test(navigator.userAgent);
    const isStandalone = (window.navigator as any).standalone;
    return isIOS && !isStandalone;
  }
}

export const installManager = InstallManager.getInstance();
