import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { useSignupCompanyManager } from "@/services/auth/authMutations"
import type { CompanyManagerSignupDto } from "@/types/auth.types"

// 유효성 검증 스키마
const companySetupSchema = z.object({
  company_name: z.string().min(2, '회사명은 최소 2자 이상이어야 합니다'),
  company_description: z.string().optional(),
})

type CompanySetupFormValues = z.infer<typeof companySetupSchema>

export function CompanySetupForm() {
  const navigate = useNavigate()
  const signupMutation = useSignupCompanyManager()
  
  const form = useForm<CompanySetupFormValues>({
    resolver: zodResolver(companySetupSchema),
    defaultValues: {
      company_name: '',
      company_description: '',
    },
  })

  const handleSubmit = async (values: CompanySetupFormValues) => {
    // sessionStorage에서 사용자 정보 가져오기
    const signupData = sessionStorage.getItem('signupData')
    if (!signupData) {
      navigate('/auth/signup')
      return
    }

    const userData = JSON.parse(signupData)
    
    // 회사 관리자로 회원가입
    const signupDto: CompanyManagerSignupDto = {
      user: {
        email: userData.email,
        password: userData.password,
        user_name: userData.user_name,
        phone_number: userData.phone_number,
      },
      company: {
        company_name: values.company_name,
        company_description: values.company_description,
      },
    }
    
    signupMutation.mutate(signupDto)
  }

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
          name="company_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>회사명 *</FormLabel>
              <FormControl>
                <Input 
                  placeholder="회사명을 입력하세요" 
                  {...field}
                  disabled={signupMutation.isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="company_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>회사 설명</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="회사에 대한 간단한 설명을 입력하세요 (선택사항)"
                  rows={4}
                  {...field}
                  disabled={signupMutation.isPending}
                />
              </FormControl>
              <FormDescription>
                회사의 주요 사업 분야나 특징을 간단히 설명해주세요
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-4">
          <Button 
            type="submit" 
            className="w-full" 
            disabled={signupMutation.isPending}
          >
            {signupMutation.isPending ? "회사 등록 중..." : "회사 등록 및 승인 요청"}
          </Button>
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            회사 등록 후 시스템 관리자의 승인이 필요합니다.
            <br />
            승인 완료 시 이메일로 안내드립니다.
          </p>
        </div>
      </form>
    </Form>
  )
}
