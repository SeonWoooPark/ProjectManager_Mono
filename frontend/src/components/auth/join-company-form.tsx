import type React from "react"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"


export function JoinCompanyForm() {
  const [inviteCode, setInviteCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate invite code validation
    setTimeout(() => {
      navigate("/auth/pending-approval")
      setIsLoading(false)
    }, 1000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="inviteCode">초대 코드</Label>
        <Input
          id="inviteCode"
          placeholder="초대 코드를 입력하세요"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          required
        />
        <p className="text-sm text-muted-foreground">회사 관리자로부터 받은 초대 코드를 입력해주세요.</p>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "확인 중..." : "참여 요청"}
      </Button>
    </form>
  )
}
