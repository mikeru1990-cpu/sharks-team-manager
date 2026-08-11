"use client"

import { useEffect, useState } from "react"
import Button from "./Button"

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
}

declare global {
  interface Navigator {
    standalone?: boolean
  }
}

const DISMISS_KEY = "football-os:install-banner-dismissed"

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true
}

function isIos() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent)
}

export default function InstallAppBanner() {
  const [mounted, setMounted] = useState(false)
  const [installed, setInstalled] = useState(false)
  const [dismissed, setDismissed] = useState(true)
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [ios, setIos] = useState(false)

  useEffect(() => {
    setMounted(true)
    setInstalled(isStandalone())
    setIos(isIos())
    setDismissed(window.localStorage.getItem(DISMISS_KEY) === "true")

    const capturePrompt = (event: Event) => {
      event.preventDefault()
      setInstallPrompt(event as BeforeInstallPromptEvent)
      setDismissed(false)
    }

    const handleInstalled = () => {
      setInstalled(true)
      setInstallPrompt(null)
      window.localStorage.removeItem(DISMISS_KEY)
    }

    window.addEventListener("beforeinstallprompt", capturePrompt)
    window.addEventListener("appinstalled", handleInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", capturePrompt)
      window.removeEventListener("appinstalled", handleInstalled)
    }
  }, [])

  async function install() {
    if (!installPrompt) return

    await installPrompt.prompt()
    const choice = await installPrompt.userChoice
    if (choice.outcome === "accepted") {
      setInstalled(true)
    }
    setInstallPrompt(null)
  }

  function dismiss() {
    window.localStorage.setItem(DISMISS_KEY, "true")
    setDismissed(true)
  }

  if (!mounted || installed || dismissed) return null

  return (
    <section className="fos-install-banner" aria-label="Install Football OS">
      <div className="fos-install-banner__mark" aria-hidden="true">⚽</div>
      <div className="fos-install-banner__copy">
        <strong>Install Football OS</strong>
        <span>
          {installPrompt
            ? "Add the private alpha to your phone for a faster, full-screen matchday experience."
            : ios
              ? "On iPhone, open Safari Share and choose Add to Home Screen for the app-style experience."
              : "Add Football OS to your home screen for quick matchday access."}
        </span>
      </div>
      <div className="fos-install-banner__actions">
        {installPrompt ? (
          <Button size="sm" onClick={install}>Install</Button>
        ) : null}
        <Button size="sm" variant="ghost" onClick={dismiss}>Not now</Button>
      </div>
    </section>
  )
}
