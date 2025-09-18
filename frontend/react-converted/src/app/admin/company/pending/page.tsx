import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, Mail, RefreshCw } from "lucide-react"
import { Link } from 'react-router-dom'

export default function PendingApprovalPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Clock className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">승인 대기 중</CardTitle>
          <CardDescription className="text-base">
            시스템 관리자의 승인을 기다리고 있습니다. 승인이 완료되면 이메일로 알려드립니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg bg-muted p-4 text-left">
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              다음 단계
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 시스템 관리자가 회사 정보를 검토합니다</li>
              <li>• 승인 완료 시 이메일 알림을 받게 됩니다</li>
              <li>• 승인 후 프로젝트 관리 기능을 사용할 수 있습니다</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <Button className="w-full" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              상태 새로고침
            </Button>
            <Link  to="/auth/login">
              <Button variant="outline" className="w-full bg-transparent">
                로그인 페이지로 돌아가기
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
