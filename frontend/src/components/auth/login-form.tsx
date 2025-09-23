import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Link } from 'react-router-dom'
import { Shield, Building2, Users, Eye, EyeOff } from "lucide-react"
import { useLogin } from "@/services/auth/authMutations"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import type { LoginRequestDto } from "@/types/auth.types"

// 유효성 검증 스키마
const loginSchema = z.object({
  email: z.string().email('올바른 이메일을 입력해주세요'),
  password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isDemoMode] = useState(true)
  const loginMutation = useLogin()
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const handleSubmit = async (values: LoginFormValues) => {
    loginMutation.mutate(values as LoginRequestDto)
  }

  const handleDemoLogin = (role: "system" | "company" | "member") => {
    // 데모 모드용 테스트 계정
    const demoAccounts = {
      system: { email: "admin@system.com", password: "admin123!" },
      company: { email: "admin@company.com", password: "admin123!" },
      member: { email: "member@company.com", password: "member123!" },
    }
    
    const account = demoAccounts[role]
    form.setValue('email', account.email)
    form.setValue('password', account.password)
    handleSubmit(account)
  }

  return (
    <div className="space-y-6">
      {isDemoMode && (
        <>
          <div className="space-y-3">
            <p className="text-sm font-medium text-center text-muted-foreground">데모 계정으로 빠른 로그인</p>
            <div className="grid gap-2">
              <Button
                variant="outline"
                className="w-full justify-start gap-2 h-12 bg-transparent"
                onClick={() => handleDemoLogin("system")}
                disabled={loginMutation.isPending}
                type="button"
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
                onClick={() => handleDemoLogin("company")}
                disabled={loginMutation.isPending}
                type="button"
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
                onClick={() => handleDemoLogin("member")}
                disabled={loginMutation.isPending}
                type="button"
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
        </>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>이메일</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="이메일을 입력하세요"
                    {...field}
                    disabled={loginMutation.isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>비밀번호</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="비밀번호를 입력하세요"
                      {...field}
                      disabled={loginMutation.isPending}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loginMutation.isPending}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-end">
            <Link to="/auth/forgot-password" className="text-sm text-primary hover:underline">
              비밀번호를 잊으셨나요?
            </Link>
          </div>

          <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? "로그인 중..." : "로그인"}
          </Button>
        </form>
      </Form>

      <Separator />

      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">계정이 없으신가요?</p>
        <Link to="/auth/signup">
          <Button variant="outline" className="w-full bg-transparent">
            회원가입
          </Button>
        </Link>
      </div>
    </div>
  )
}
