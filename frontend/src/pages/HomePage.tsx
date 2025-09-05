export default function HomePage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          확장 가능한 풀스택 애플리케이션
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Express + TypeScript 백엔드와 React + TypeScript 프론트엔드로 구축된
          모던 웹 애플리케이션입니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">⚡ 빠른 개발</h3>
          <p className="text-gray-600">
            Vite와 HMR을 통한 빠른 개발 경험
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">🛡️ 타입 안정성</h3>
          <p className="text-gray-600">
            TypeScript로 전체 코드베이스 타입 체크
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">📦 확장 가능</h3>
          <p className="text-gray-600">
            레이어드 아키텍처로 유지보수 용이
          </p>
        </div>
      </div>
    </div>
  );
}