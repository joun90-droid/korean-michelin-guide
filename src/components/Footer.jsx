import './Footer.css'

export default function Footer() {
  return (
    <footer className="site-footer">
      <p>
        본 사이트의 레스토랑 정보는 데모용 샘플 데이터이며 실제 미슐랭 가이드
        등재 정보와 다를 수 있습니다.
      </p>
      <p className="footer-meta">© {new Date().getFullYear()} Korean Michelin Guide (Demo)</p>
    </footer>
  )
}
