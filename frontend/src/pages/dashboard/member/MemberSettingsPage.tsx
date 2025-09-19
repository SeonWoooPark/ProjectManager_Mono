import { TeamMemberSidebar } from "@components/dashboard/team-member-sidebar"
import { UserProfileSettings } from "@components/dashboard/user-profile-settings"

export default function MemberSettingsPage() {
  return (
    <div className="flex h-screen bg-background">
      <TeamMemberSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="py-6 pl-6 pr-6 max-w-9xl mx-auto">
          <UserProfileSettings />
        </div>
      </main>
    </div>
  )
}