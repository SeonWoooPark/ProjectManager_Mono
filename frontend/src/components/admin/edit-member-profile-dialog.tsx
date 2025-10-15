import { useState, useEffect } from 'react';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog';
import { useUpdateMemberProfile } from '@/services/members/membersMutations';
import type { MemberSummary } from '@/types/members.types';

interface EditMemberProfileDialogProps {
  member: MemberSummary | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditMemberProfileDialog({ member, open, onOpenChange }: EditMemberProfileDialogProps) {
  const updateProfileMutation = useUpdateMemberProfile();

  const [formData, setFormData] = useState({
    user_name: '',
    phone_number: '',
    email: '',
  });

  // member가 변경될 때마다 폼 데이터 초기화
  useEffect(() => {
    if (member) {
      setFormData({
        user_name: member.user_name,
        phone_number: member.phone_number || '',
        email: member.email,
      });
    }
  }, [member]);

  const handleSave = () => {
    if (!member) return;

    updateProfileMutation.mutate(
      {
        userId: member.id,
        user_name: formData.user_name,
        phone_number: formData.phone_number,
        // 이메일은 변경하지 않음 (백엔드에서 처리)
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  if (!member) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>프로필 수정</DialogTitle>
          <DialogDescription>
            {member.user_name}님의 프로필 정보를 수정합니다.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-name">이름</Label>
            <Input
              id="edit-name"
              value={formData.user_name}
              onChange={(e) => setFormData({ ...formData, user_name: e.target.value })}
              placeholder="이름을 입력하세요"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-email">이메일</Label>
            <Input
              id="edit-email"
              type="email"
              value={formData.email}
              disabled
              className="bg-muted cursor-not-allowed"
              placeholder="이메일을 입력하세요"
            />
            <p className="text-xs text-muted-foreground">이메일은 수정할 수 없습니다.</p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-phone">전화번호</Label>
            <Input
              id="edit-phone"
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              placeholder="전화번호를 입력하세요"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            취소
          </Button>
          <Button onClick={handleSave} disabled={updateProfileMutation.isPending}>
            {updateProfileMutation.isPending ? '저장 중...' : '저장'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
