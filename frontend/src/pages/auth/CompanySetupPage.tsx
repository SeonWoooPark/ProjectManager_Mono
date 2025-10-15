import { CompanySetupForm } from "@components/auth/company-setup-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card"

export default function CompanySetupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">회사 정보 설정</CardTitle>
          <CardDescription>회사 정보를 입력하여 프로젝트 관리를 시작하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <CompanySetupForm />
        </CardContent>
      </Card>
    </div>
  )
}