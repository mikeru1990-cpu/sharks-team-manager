import type { CapacitorConfig } from "@capacitor/cli"

const serverUrl = process.env.CAPACITOR_SERVER_URL?.trim()
const appId = process.env.CAPACITOR_APP_ID?.trim() || "app.footballos.mobile"

const config: CapacitorConfig = {
  appId,
  appName: "Football OS",
  webDir: "native-shell",
  ...(serverUrl
    ? {
        server: {
          url: serverUrl,
          cleartext: false,
        },
      }
    : {}),
}

export default config
