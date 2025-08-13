import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { BarChart3, FileAudio, Home, Settings, TrendingUp, Upload, Users } from "lucide-react" // Added Users icon
import Link from "next/link"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Audio Analysis Platform",
  description: "Advanced audio analysis with AI-powered insights",
}

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Upload", href: "/upload", icon: Upload },
  { name: "Results", href: "/results", icon: BarChart3 },
  { name: "Analytics", href: "/analytics", icon: TrendingUp },
]

async function getUniqueAgents() {
  try {
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"
    const response = await fetch(`${baseUrl}/api/unique-agents`, {
      cache: "no-store", // Always fetch fresh data
    })

    if (!response.ok) {
      console.error("Failed to fetch unique agents:", response.status, await response.text())
      return []
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching unique agents for sidebar:", error)
    return []
  }
}

async function AppSidebar({ uniqueAgents }: { uniqueAgents: string[] }) {
  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-2 py-2">
          <FileAudio className="h-6 w-6 text-primary" />
          <span className="font-semibold">Audio Analysis</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild>
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {uniqueAgents.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Profiles</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {uniqueAgents.map((agentName) => (
                  <SidebarMenuItem key={agentName}>
                    <SidebarMenuButton asChild>
                      <Link href={`/agents/${encodeURIComponent(agentName)}`}>
                        <Users className="h-4 w-4" /> {/* Using Users icon for profiles */}
                        <span>{agentName}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/settings">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const uniqueAgents = await getUniqueAgents()

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SidebarProvider>
            <AppSidebar uniqueAgents={uniqueAgents} />
            <SidebarInset>
              <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                <SidebarTrigger className="-ml-1" />
                <div className="ml-auto">{/* Add user menu or other header content here */}</div>
              </header>
              <main className="flex-1 space-y-4 p-8 pt-6">{children}</main>
            </SidebarInset>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
