import { useEffect, useState } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { useResetPassword } from "@/services/auth/authMutations"
import { useResetTokenValidation } from "@/services/auth/authQueries"
import { Eye, EyeOff, ShieldCheck, AlertCircle } from "lucide-react"

// 유효성 검증 스키마
const resetPasswordSchema = z.object({
  new_password: z.string()
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
    .regex(/(?=.*[a-z])/, '소문자를 포함해야 합니다')
    .regex(/(?=.*[A-Z])/, '대문자를 포함해야 합니다')
    .regex(/(?=.*[0-9])/, '숫자를 포함해야 합니다')
    .regex(/(?=.*[!@#$%^&*])/, '특수문자를 포함해야 합니다'),
  confirmPassword: z.string(),
}).refine((data) => data.new_password === data.confirmPassword, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['confirmPassword'],
})

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

export function ResetPasswordForm() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const token = searchParams.get('token')
  const resetPasswordMutation = useResetPassword()
  
  // 토큰 유효성 검증
  const { data: tokenValidation, isLoading: isValidating, isError: isTokenError } = useResetTokenValidation(token || '')
  
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      new_password: '',
      confirmPassword: '',
    },
  })

  const handleSubmit = async (values: ResetPasswordFormValues) => {
    if (!token) return
    
    resetPasswordMutation.mutate({
      token,
      new_password: values.new_password,
    })
  }

  // 토큰이 없으면 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!token) {
      navigate('/auth/login')
    }
  }, [token, navigate])

  // 토큰 검증 중
  if (isValidating) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">토큰 확인 중...</p>
      </div>
    )
  }

  // 토큰 검증 실패
  if (isTokenError || (tokenValidation && !tokenValidation.valid)) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-semibold mb-1">유효하지 않은 링크입니다</div>
            <p className="text-sm">
              비밀번호 재설정 링크가 만료되었거나 유효하지 않습니다.
              <br />
              새로운 재설정 링크를 요청해주세요.
            </p>
          </AlertDescription>
        </Alert>
        <Button
          variant="default"
          className="w-full"
          onClick={() => navigate('/auth/forgot-password')}
        >
          새 재설정 링크 요청
        </Button>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="text-center mb-6">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">새 비밀번호 설정</h2>
          <p className="text-sm text-muted-foreground">
            {tokenValidation?.email && (
              <>
                <span className="font-medium">{tokenValidation.email}</span> 계정의<br />
              </>
            )}
            새로운 비밀번호를 입력해주세요
          </p>
        </div>

        <FormField
          control={form.control}
          name="new_password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>새 비밀번호</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="새 비밀번호를 입력하세요"
                    {...field}
                    disabled={resetPasswordMutation.isPending}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={resetPasswordMutation.isPending}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </FormControl>
              <FormDescription>
                8자 이상, 대소문자, 숫자, 특수문자 포함
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>비밀번호 확인</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="비밀번호를 다시 입력하세요"
                    {...field}
                    disabled={resetPasswordMutation.isPending}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={resetPasswordMutation.isPending}
                  >
                    {showConfirmPassword ? (
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

        <Button 
          type="submit" 
          className="w-full" 
          disabled={resetPasswordMutation.isPending}
        >
          {resetPasswordMutation.isPending ? "변경 중..." : "비밀번호 변경"}
        </Button>
      </form>
    </Form>
  )
}