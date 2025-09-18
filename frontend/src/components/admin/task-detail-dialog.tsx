import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@components/ui/dialog"
import { Button } from "@components/ui/button"
import { Badge } from "@components/ui/badge"
import { Avatar, AvatarFallback } from "@components/ui/avatar"
import { Textarea } from "@components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select"
import { Separator } from "@components/ui/separator"
import { Calendar, Flag, MessageCircle, User, Tag } from "lucide-react"
import { useState } from "react"
import { Input } from "@components/ui/input"

interface Task {
  id: string
  title: string
  description: string
  assignee: string
  priority: string
  dueDate: string
  tags: string[]
  comments: number
}

interface TeamMember {
  id: string
  name: string
  role: string
  avatar: string
}

interface TaskDetailDialogProps {
  task: Task
  isOpen: boolean
  onClose: () => void
  teamMembers: TeamMember[]
  onTaskMove: (taskId: string, fromColumn: string, toColumn: string) => void
}

const mockComments = [
  {
    id: "1",
    author: "박민수",
    content: "API 스펙 문서를 먼저 검토해주세요.",
    timestamp: "2024-01-18 14:30",
  },
  {
    id: "2",
    author: "김철수",
    content: "네, 내일까지 완료하겠습니다.",
    timestamp: "2024-01-18 15:45",
  },
]

export function TaskDetailDialog({ task, isOpen, onClose, teamMembers, onTaskMove }: TaskDetailDialogProps) {
  const [newComment, setNewComment] = useState("")
  const [selectedAssignee, setSelectedAssignee] = useState(task.assignee)
  const [selectedPriority, setSelectedPriority] = useState(task.priority)
  const [selectedDueDate, setSelectedDueDate] = useState(task.dueDate)
  const [selectedTags, setSelectedTags] = useState(task.tags.join(", "))

  const handleAddComment = () => {
    if (newComment.trim()) {
      // In a real app, this would add the comment via API
      console.log("Adding comment:", newComment)
      setNewComment("")
    }
  }

  const handleStatusChange = (newStatus: string) => {
    // In a real app, this would update the task status via API
    console.log(`Changing task ${task.id} status to ${newStatus}`)
    onTaskMove(task.id, "current", newStatus)
  }

  const handleSave = () => {
    // In a real app, this would save the changes via API
    console.log("Saving task changes:", {
      assignee: selectedAssignee,
      priority: selectedPriority,
      dueDate: selectedDueDate,
      tags: selectedTags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag),
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{task.title}</DialogTitle>
          <DialogDescription>{task.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Task Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">담당자</span>
              </div>
              <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.name}>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-5 h-5">
                          <AvatarFallback className="text-xs">{member.avatar}</AvatarFallback>
                        </Avatar>
                        {member.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Flag className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">우선순위</span>
              </div>
              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="높음">높음</SelectItem>
                  <SelectItem value="중간">중간</SelectItem>
                  <SelectItem value="낮음">낮음</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">마감일</span>
              </div>
              <Input type="date" value={selectedDueDate} onChange={(e) => setSelectedDueDate(e.target.value)} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">태그</span>
              </div>
              <Input
                placeholder="태그를 쉼표로 구분하여 입력하세요"
                value={selectedTags}
                onChange={(e) => setSelectedTags(e.target.value)}
              />
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedTags.split(",").map((tag, index) => {
                  const trimmedTag = tag.trim()
                  return trimmedTag ? (
                    <Badge key={index} variant="outline" className="text-xs">
                      {trimmedTag}
                    </Badge>
                  ) : null
                })}
              </div>
            </div>
          </div>

          {/* Status Actions */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">상태 변경</h4>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => handleStatusChange("todo")} className="bg-transparent">
                할 일로 이동
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleStatusChange("inProgress")}
                className="bg-transparent"
              >
                진행 중으로 이동
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleStatusChange("review")}
                className="bg-transparent"
              >
                검토로 이동
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleStatusChange("completed")}
                className="bg-transparent"
              >
                완료로 이동
              </Button>
            </div>
          </div>

          <Separator />

          {/* Comments Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-medium">댓글 ({mockComments.length})</h4>
            </div>

            <div className="space-y-3">
              {mockComments.map((comment) => (
                <div key={comment.id} className="border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-xs">{comment.author.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{comment.author}</span>
                    <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                  </div>
                  <p className="text-sm text-foreground">{comment.content}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Textarea
                placeholder="댓글을 입력하세요..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
              />
              <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                댓글 추가
              </Button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSave} className="gap-2">
            저장
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
