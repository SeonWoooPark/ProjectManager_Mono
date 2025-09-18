import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock } from "lucide-react"
import { Link } from 'react-router-dom'

export default function PendingApprovalPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Clock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl font-bold">승인 대기 중</CardTitle>
          <CardDescription>요청이 성공적으로 제출되었습니다. 승인을 기다려주세요.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 text-sm">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span className="font-medium">요청 제출 완료</span>
            </div>
            <p className="text-muted-foreground">관리자가 요청을 검토한 후 이메일로 결과를 알려드립니다.</p>
          </div>

          <Link  to="/auth/login">
            <Button variant="outline" className="w-full bg-transparent">
              로그인 페이지로 돌아가기
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
