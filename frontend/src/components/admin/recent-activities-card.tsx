import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card"
import { CheckCircle, XCircle, UserPlus, Building2 } from "lucide-react"

const activities = [
  {
    id: "1",
    type: "approval",
    message: "테크스타트업 회사 등록 승인",
    time: "2시간 전",
    icon: CheckCircle,
    iconColor: "text-primary",
  },
  {
    id: "2",
    type: "user",
    message: "새 사용자 김영수가 가입",
    time: "4시간 전",
    icon: UserPlus,
    iconColor: "text-blue-500",
  },
  {
    id: "3",
    type: "rejection",
    message: "ABC회사 등록 요청 반려",
    time: "1일 전",
    icon: XCircle,
    iconColor: "text-destructive",
  },
  {
    id: "4",
    type: "company",
    message: "디자인스튜디오에서 새 프로젝트 생성",
    time: "2일 전",
    icon: Building2,
    iconColor: "text-secondary",
  },
]

export function RecentActivitiesCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>최근 활동</CardTitle>
        <CardDescription>시스템에서 발생한 최근 활동 내역</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center gap-3">
              <div className={`p-2 rounded-full bg-muted ${activity.iconColor}`}>
                <activity.icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{activity.message}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
