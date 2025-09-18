import { Button } from "@components/ui/button"
import { Badge } from "@components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@components/ui/table"
import { CheckCircle, XCircle, Eye } from "lucide-react"
import { useState } from "react"

interface CompanyRequest {
  id: string
  companyName: string
  requesterName: string
  requesterEmail: string
  industry: string
  employeeCount: string
  requestDate: string
  status: "pending" | "approved" | "rejected"
}

interface CompanyRequestsTableProps {
  requests: CompanyRequest[]
}

export function CompanyRequestsTable({ requests }: CompanyRequestsTableProps) {
  const [requestList, setRequestList] = useState(requests)

  const handleApprove = (id: string) => {
    setRequestList((prev) => prev.map((req) => (req.id === id ? { ...req, status: "approved" as const } : req)))
    // Here you would typically send an API request
    console.log(`Approved request ${id}`)
  }

  const handleReject = (id: string) => {
    setRequestList((prev) => prev.map((req) => (req.id === id ? { ...req, status: "rejected" as const } : req)))
    // Here you would typically send an API request
    console.log(`Rejected request ${id}`)
  }

  if (requestList.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">승인 대기 중인 요청이 없습니다.</div>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>회사명</TableHead>
          <TableHead>요청자</TableHead>
          <TableHead>업종</TableHead>
          <TableHead>직원 수</TableHead>
          <TableHead>요청일</TableHead>
          <TableHead>상태</TableHead>
          <TableHead>작업</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requestList.map((request) => (
          <TableRow key={request.id}>
            <TableCell className="font-medium">{request.companyName}</TableCell>
            <TableCell>
              <div>
                <div className="font-medium">{request.requesterName}</div>
                <div className="text-sm text-muted-foreground">{request.requesterEmail}</div>
              </div>
            </TableCell>
            <TableCell>{request.industry}</TableCell>
            <TableCell>{request.employeeCount}</TableCell>
            <TableCell>{request.requestDate}</TableCell>
            <TableCell>
              <Badge
                variant={
                  request.status === "approved"
                    ? "default"
                    : request.status === "rejected"
                      ? "destructive"
                      : "secondary"
                }
              >
                {request.status === "pending" && "대기 중"}
                {request.status === "approved" && "승인됨"}
                {request.status === "rejected" && "반려됨"}
              </Badge>
            </TableCell>
            <TableCell>
              {request.status === "pending" && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleApprove(request.id)}
                    className="text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    승인
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReject(request.id)}
                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <XCircle className="h-3 w-3 mr-1" />
                    반려
                  </Button>
                </div>
              )}
              {request.status !== "pending" && (
                <Button size="sm" variant="ghost">
                  <Eye className="h-3 w-3 mr-1" />
                  상세보기
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
