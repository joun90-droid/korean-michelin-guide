import './Footer.css'

export default function Footer() {
  return (
    <footer className="site-footer">
      <p>
        주간 자동 동기화 카탈로그와 클라이언트 랭킹·거리 정렬을 사용합니다.
        공식 미쉐린 가이드와 표기가 다를 수 있습니다.
      </p>
      <p className="footer-meta">© {new Date().getFullYear()} Korean Michelin Guide (Demo)</p>
    </footer>
  )
}
