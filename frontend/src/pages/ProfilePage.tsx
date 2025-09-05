import { useAuthStore } from '@store/authStore';

export default function ProfilePage() {
  const { user } = useAuthStore();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b">
          <h1 className="text-2xl font-bold text-gray-900">프로필</h1>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-primary-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{user?.name}</h2>
              <p className="text-gray-600">{user?.email}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                {user?.role}
              </span>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">계정 정보</h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">이름</dt>
                <dd className="mt-1 text-sm text-gray-900">{user?.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">이메일</dt>
                <dd className="mt-1 text-sm text-gray-900">{user?.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">역할</dt>
                <dd className="mt-1 text-sm text-gray-900">{user?.role}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">가입일</dt>
                <dd className="mt-1 text-sm text-gray-900">2024-01-01</dd>
              </div>
            </dl>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">설정</h3>
            <div className="space-y-4">
              <button className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
                프로필 수정
              </button>
              <button className="ml-3 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                비밀번호 변경
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}