import type React from "react"
import { TeamMemberSidebar } from "@/components/dashboard/team-member-sidebar"

export default function TeamMemberLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-background">
      <TeamMemberSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
