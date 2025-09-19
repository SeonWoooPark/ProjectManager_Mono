import type React from "react"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


export function CompanySetupForm() {
  const [formData, setFormData] = useState({
    companyName: "",
    businessNumber: "",
    industry: "",
    employeeCount: "",
    address: "",
    description: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate company setup submission
    setTimeout(() => {
      navigate("/auth/pending-approval")
      setIsLoading(false)
    }, 1000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="companyName">회사명</Label>
        <Input
          id="companyName"
          placeholder="회사명을 입력하세요"
          value={formData.companyName}
          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="businessNumber">사업자등록번호</Label>
        <Input
          id="businessNumber"
          placeholder="사업자등록번호를 입력하세요"
          value={formData.businessNumber}
          onChange={(e) => setFormData({ ...formData, businessNumber: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="industry">업종</Label>
        <Select onValueChange={(value) => setFormData({ ...formData, industry: value })}>
          <SelectTrigger>
            <SelectValue placeholder="업종을 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tech">IT/소프트웨어</SelectItem>
            <SelectItem value="manufacturing">제조업</SelectItem>
            <SelectItem value="retail">소매업</SelectItem>
            <SelectItem value="service">서비스업</SelectItem>
            <SelectItem value="finance">금융업</SelectItem>
            <SelectItem value="other">기타</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="employeeCount">직원 수</Label>
        <Select onValueChange={(value) => setFormData({ ...formData, employeeCount: value })}>
          <SelectTrigger>
            <SelectValue placeholder="직원 수를 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1-10">1-10명</SelectItem>
            <SelectItem value="11-50">11-50명</SelectItem>
            <SelectItem value="51-100">51-100명</SelectItem>
            <SelectItem value="101-500">101-500명</SelectItem>
            <SelectItem value="500+">500명 이상</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">주소</Label>
        <Input
          id="address"
          placeholder="회사 주소를 입력하세요"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">회사 설명</Label>
        <Textarea
          id="description"
          placeholder="회사에 대한 간단한 설명을 입력하세요"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "승인 요청 중..." : "승인 요청"}
      </Button>
    </form>
  )
}
