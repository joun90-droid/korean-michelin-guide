import { Link } from 'react-router-dom'
import './NotFound.css'

export default function NotFound() {
  return (
    <div className="not-found">
      <p className="not-found-code">404</p>
      <h1>페이지를 찾을 수 없습니다</h1>
      <Link to="/">목록으로 돌아가기</Link>
    </div>
  )
}
