import type React from "react"
import { CompanyAdminSidebar } from "@/components/admin/company-admin-sidebar"

export default function CompanyAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-background">
      <CompanyAdminSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
