import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card"
import { Button } from "@components/ui/button"
import { Badge } from "@components/ui/badge"
import { Avatar, AvatarFallback } from "@components/ui/avatar"
import { CheckCircle, XCircle, UserCheck, Calendar } from "lucide-react"

interface JoinRequest {
  id: string
  name: string
  email: string
  requestedRole: string
  inviteCode: string
  requestDate: string
  invitedBy: string
}

interface JoinRequestsCardProps {
  requests: JoinRequest[]
  onApprove: (requestId: string) => void
  onReject: (requestId: string) => void
}

export function JoinRequestsCard({ requests, onApprove, onReject }: JoinRequestsCardProps) {
  if (requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            가입 요청
          </CardTitle>
          <CardDescription>새로운 팀원 가입 요청을 검토하고 승인하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <UserCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p>현재 대기 중인 가입 요청이 없습니다.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              가입 요청
            </CardTitle>
            <CardDescription>새로운 팀원 가입 요청을 검토하고 승인하세요</CardDescription>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            {requests.length}건 대기
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback>{request.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium text-foreground">{request.name}</h4>
                    <p className="text-sm text-muted-foreground">{request.email}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                      <span>요청 역할: {request.requestedRole}</span>
                      <span>초대자: {request.invitedBy}</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{request.requestDate}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => onApprove(request.id)}
                    className="gap-1 text-primary hover:bg-primary hover:text-primary-foreground"
                    variant="outline"
                  >
                    <CheckCircle className="h-3 w-3" />
                    승인
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onReject(request.id)}
                    className="gap-1 text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
                  >
                    <XCircle className="h-3 w-3" />
                    거절
                  </Button>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">초대 코드:</span>
                  <code className="bg-muted px-2 py-1 rounded text-xs">{request.inviteCode}</code>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
