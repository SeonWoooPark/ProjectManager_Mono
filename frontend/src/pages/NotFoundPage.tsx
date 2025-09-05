import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-[600px] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          페이지를 찾을 수 없습니다
        </h2>
        <p className="text-gray-600 mb-8">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
        </p>
        <Link
          to="/"
          className="inline-block bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}