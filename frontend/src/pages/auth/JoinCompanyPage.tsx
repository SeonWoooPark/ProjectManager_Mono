import { JoinCompanyForm } from "@components/auth/join-company-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card"

export default function JoinCompanyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">회사 참여</CardTitle>
          <CardDescription>초대 코드를 입력하여 회사에 참여하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <JoinCompanyForm />
        </CardContent>
      </Card>
    </div>
  )
}