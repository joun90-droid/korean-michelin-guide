import { SITE_NAME } from '../data/restaurants'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="site-footer">
      <p>
        미슐랭 스타·빕 구르망·스타 없는 가이드 등재·블루리본을 함께 모았습니다.
        공식 가이드 표기와 다를 수 있습니다.
      </p>
      <p className="footer-meta">© {new Date().getFullYear()} {SITE_NAME}</p>
    </footer>
  )
}
