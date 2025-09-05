import { useAuthStore } from '@store/authStore';

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">대시보드</h1>
        <p className="text-gray-600">
          환영합니다, {user?.name}님! 여기는 대시보드 페이지입니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-primary-600">123</div>
          <div className="text-gray-600 mt-2">총 사용자</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">45</div>
          <div className="text-gray-600 mt-2">활성 세션</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">789</div>
          <div className="text-gray-600 mt-2">API 호출</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-purple-600">99.9%</div>
          <div className="text-gray-600 mt-2">가동시간</div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">최근 활동</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-gray-600">새 사용자 가입</span>
            <span className="text-sm text-gray-400">5분 전</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-gray-600">시스템 업데이트 완료</span>
            <span className="text-sm text-gray-400">1시간 전</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-gray-600">백업 완료</span>
            <span className="text-sm text-gray-400">3시간 전</span>
          </div>
        </div>
      </div>
    </div>
  );
}