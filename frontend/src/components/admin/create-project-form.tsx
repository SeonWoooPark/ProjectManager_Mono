import type React from "react"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@components/ui/button"
import { Input } from "@components/ui/input"
import { Label } from "@components/ui/label"
import { Textarea } from "@components/ui/textarea"
import { Checkbox } from "@components/ui/checkbox"


// Mock team members data
const teamMembers = [
  { id: "1", name: "김철수", email: "kim@company.com", role: "개발자" },
  { id: "2", name: "이영희", email: "lee@company.com", role: "디자이너" },
  { id: "3", name: "박민수", email: "park@company.com", role: "기획자" },
  { id: "4", name: "정수진", email: "jung@company.com", role: "개발자" },
  { id: "5", name: "최영수", email: "choi@company.com", role: "마케터" },
]

export function CreateProjectForm() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    selectedMembers: [] as string[],
  })
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleMemberToggle = (memberId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedMembers: prev.selectedMembers.includes(memberId)
        ? prev.selectedMembers.filter((id) => id !== memberId)
        : [...prev.selectedMembers, memberId],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate project creation
    setTimeout(() => {
      navigate("/admin/company/projects")
      setIsLoading(false)
    }, 1000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">프로젝트 이름</Label>
        <Input
          id="name"
          placeholder="프로젝트 이름을 입력하세요"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">프로젝트 설명</Label>
        <Textarea
          id="description"
          placeholder="프로젝트에 대한 상세한 설명을 입력하세요"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          required
        />
      </div>

      <div className="space-y-3">
        <Label>팀원 선택</Label>
        <div className="border rounded-lg p-4 space-y-3 max-h-48 overflow-y-auto">
          {teamMembers.map((member) => (
            <div key={member.id} className="flex items-center space-x-3">
              <Checkbox
                id={member.id}
                checked={formData.selectedMembers.includes(member.id)}
                onCheckedChange={() => handleMemberToggle(member.id)}
              />
              <div className="flex-1">
                <Label htmlFor={member.id} className="text-sm font-medium cursor-pointer">
                  {member.name}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {member.role} • {member.email}
                </p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">선택된 팀원: {formData.selectedMembers.length}명</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="startDate">시작일</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="endDate">종료일</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? "생성 중..." : "프로젝트 생성"}
        </Button>
        <Button type="button" variant="outline" onClick={() => navigate(-1)} className="bg-transparent">
          취소
        </Button>
      </div>
    </form>
  )
}
