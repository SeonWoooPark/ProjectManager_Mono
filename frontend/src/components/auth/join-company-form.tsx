import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { useSignupTeamMember, useValidateInvitationCode } from "@/services/auth/authMutations"
import type { TeamMemberSignupDto } from "@/types/auth.types"

// 유효성 검증 스키마
const joinCompanySchema = z.object({
  invitation_code: z.string()
    .min(6, '초대 코드는 최소 6자 이상이어야 합니다')
    // .max(10, '초대 코드는 최대 10자까지 입력 가능합니다'),
})

type JoinCompanyFormValues = z.infer<typeof joinCompanySchema>

export function JoinCompanyForm() {
  const navigate = useNavigate()
  const signupMutation = useSignupTeamMember()
  const validateCodeMutation = useValidateInvitationCode()

  // 아직 백엔드에 초대 코드 검증 api가 없어서 현재는 회사 값 defalut 설정
  const [validatedCompanyName, setValidatedCompanyName] = useState<string>('Comp')
  
  const form = useForm<JoinCompanyFormValues>({
    resolver: zodResolver(joinCompanySchema),
    defaultValues: {
      invitation_code: '',
    },
  })

  const handleSubmit = async (values: JoinCompanyFormValues) => {
    // sessionStorage에서 사용자 정보 가져오기
    const signupData = sessionStorage.getItem('signupData')
    if (!signupData) {
      navigate('/auth/signup')
      return
    }

    const userData = JSON.parse(signupData)
    
    // 팀원으로 회원가입
    const signupDto: TeamMemberSignupDto = {
      user: {
        email: userData.email,
        password: userData.password,
        user_name: userData.user_name,
        phone_number: userData.phone_number,
      },
      invitation_code: values.invitation_code,
    }
    
    signupMutation.mutate(signupDto)
  }

  // 초대 코드 검증 (6자 이상 입력 시)
  const invitationCode = form.watch('invitation_code')
  useEffect(() => {
    if (invitationCode && invitationCode.length >= 6) {
      validateCodeMutation.mutate(invitationCode)
    }
  }, [invitationCode])

  // 검증 결과 처리
  useEffect(() => {
    if (validateCodeMutation.isSuccess && validateCodeMutation.data) {
      if (validateCodeMutation.data.valid && validateCodeMutation.data.company_name) {
        setValidatedCompanyName(validateCodeMutation.data.company_name)
      } else {
        setValidatedCompanyName('')
      }
    }
  }, [validateCodeMutation.data, validateCodeMutation.isSuccess])

  // 회원가입 성공 시 sessionStorage 클리어
  useEffect(() => {
    if (signupMutation.isSuccess) {
      sessionStorage.removeItem('signupData')
    }
  }, [signupMutation.isSuccess])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="invitation_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>초대 코드</FormLabel>
              <FormControl>
                <Input 
                  placeholder="초대 코드를 입력하세요" 
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase()
                    field.onChange(value)
                  }}
                  disabled={signupMutation.isPending}
                />
              </FormControl>
              <FormDescription>
                회사 관리자로부터 받은 초대 코드를 입력해주세요
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {validatedCompanyName && (
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">
              ✓ "{validatedCompanyName}" 회사에 참여 요청을 보낼 수 있습니다.
            </AlertDescription>
          </Alert>
        )}

        {/* {validateCodeMutation.isError && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              유효하지 않은 초대 코드입니다. 다시 확인해주세요.
            </AlertDescription>
          </Alert>
        )} */}

        <div className="pt-4">
          <Button 
            type="submit" 
            className="w-full" 
            disabled={signupMutation.isPending || !validatedCompanyName}
          >
            {signupMutation.isPending ? "참여 요청 중..." : "참여 요청"}
          </Button>
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            참여 요청 후 회사 관리자의 승인이 필요합니다.
            <br />
            승인 완료 시 이메일로 안내드립니다.
          </p>
        </div>
      </form>
    </Form>
  )
}
