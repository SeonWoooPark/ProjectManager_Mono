import type React from "react"
import { SystemAdminSidebar } from "@/components/admin/system-admin-sidebar"

export default function SystemAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-background">
      <SystemAdminSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
