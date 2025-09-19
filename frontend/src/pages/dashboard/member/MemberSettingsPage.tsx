import { TeamMemberSidebar } from "@components/dashboard/team-member-sidebar"
import { UserProfileSettings } from "@components/dashboard/user-profile-settings"

export default function MemberSettingsPage() {
  return (
    <div className="flex h-screen bg-background">
      <TeamMemberSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container py-8 max-w-7xl">
          <UserProfileSettings />
        </div>
      </main>
    </div>
  )
}