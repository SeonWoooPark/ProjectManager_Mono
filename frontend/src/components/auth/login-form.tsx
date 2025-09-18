import type React from "react"

import { useState } from "react"
import { Button } from "@components/ui/button"
import { Input } from "@components/ui/input"
import { Label } from "@components/ui/label"
import { Separator } from "@components/ui/separator"
import { Link, useNavigate } from 'react-router-dom'

import { Shield, Building2, Users } from "lucide-react"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate login logic
    setTimeout(() => {
      // Mock different user roles for demo
      if (email === "admin@system.com") {
        navigate("/admin/system")
      } else if (email === "admin@company.com") {
        navigate("/admin/company")
      } else {
        navigate("/dashboard/member")
      }
      setIsLoading(false)
    }, 1000)
  }

  const handleRoleLogin = (role: "system" | "company" | "member") => {
    setIsLoading(true)
    setTimeout(() => {
      if (role === "system") {
        navigate("/admin/system")
      } else if (role === "company") {
        navigate("/admin/company")
      } else {
        navigate("/dashboard/member")
      }
      setIsLoading(false)
    }, 500)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-sm font-medium text-center text-muted-foreground">데모 계정으로 빠른 로그인</p>
        <div className="grid gap-2">
          <Button
            variant="outline"
            className="w-full justify-start gap-2 h-12 bg-transparent"
            onClick={() => handleRoleLogin("system")}
            disabled={isLoading}
          >
            <Shield className="h-4 w-4 text-primary" />
            <div className="text-left">
              <div className="font-medium">시스템 관리자</div>
              <div className="text-xs text-muted-foreground">회사 승인 및 전체 관리</div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-2 h-12 bg-transparent"
            onClick={() => handleRoleLogin("company")}
            disabled={isLoading}
          >
            <Building2 className="h-4 w-4 text-primary" />
            <div className="text-left">
              <div className="font-medium">회사 관리자</div>
              <div className="text-xs text-muted-foreground">프로젝트 생성 및 팀 관리</div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-2 h-12 bg-transparent"
            onClick={() => handleRoleLogin("member")}
            disabled={isLoading}
          >
            <Users className="h-4 w-4 text-primary" />
            <div className="text-left">
              <div className="font-medium">팀원</div>
              <div className="text-xs text-muted-foreground">할당된 작업 관리</div>
            </div>
          </Button>
        </div>
      </div>

      <Separator />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">이메일</Label>
          <Input
            id="email"
            type="email"
            placeholder="이메일을 입력하세요"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">비밀번호</Label>
          <Input
            id="password"
            type="password"
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "로그인 중..." : "로그인"}
        </Button>

        <Separator />

        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">계정이 없으신가요?</p>
          <Link  to="/auth/signup">
            <Button variant="outline" className="w-full bg-transparent">
              회원가입
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
