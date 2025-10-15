import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Link } from 'react-router-dom'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { useForgotPassword } from "@/services/auth/authMutations"
import { ArrowLeft, Mail } from "lucide-react"

// 유효성 검증 스키마
const forgotPasswordSchema = z.object({
  email: z.string().email('올바른 이메일을 입력해주세요'),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordForm() {
  const [emailSent, setEmailSent] = useState(false)
  const forgotPasswordMutation = useForgotPassword()
  
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const handleSubmit = async (values: ForgotPasswordFormValues) => {
    forgotPasswordMutation.mutate(
      { email: values.email },
      {
        onSuccess: () => {
          setEmailSent(true)
        },
      }
    )
  }

  if (emailSent) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
            <Mail className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold mb-2">이메일을 확인해주세요</h2>
          <p className="text-sm text-muted-foreground">
            비밀번호 재설정 링크를 <br />
            <span className="font-medium">{form.getValues('email')}</span>로 전송했습니다.
          </p>
        </div>

        <Alert>
          <AlertDescription>
            이메일이 도착하지 않았나요?
            <ul className="mt-2 text-sm list-disc list-inside">
              <li>스팸 폴더를 확인해주세요</li>
              <li>이메일 주소가 올바른지 확인해주세요</li>
              <li>몇 분 후에 다시 시도해주세요</li>
            </ul>
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setEmailSent(false)
              form.reset()
            }}
          >
            다른 이메일로 시도
          </Button>
          <Link to="/auth/login" className="block">
            <Button variant="ghost" className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              로그인으로 돌아가기
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold mb-2">비밀번호 재설정</h2>
          <p className="text-sm text-muted-foreground">
            가입하신 이메일 주소를 입력하시면 <br />
            비밀번호 재설정 링크를 보내드립니다.
          </p>
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이메일</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  {...field}
                  disabled={forgotPasswordMutation.isPending}
                />
              </FormControl>
              <FormDescription>
                회원가입 시 사용한 이메일 주소를 입력해주세요
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full" 
          disabled={forgotPasswordMutation.isPending}
        >
          {forgotPasswordMutation.isPending ? "전송 중..." : "재설정 링크 보내기"}
        </Button>

        <Link to="/auth/login">
          <Button variant="ghost" className="w-full">
            <ArrowLeft className="h-4 w-4 mr-2" />
            로그인으로 돌아가기
          </Button>
        </Link>
      </form>
    </Form>
  )
}