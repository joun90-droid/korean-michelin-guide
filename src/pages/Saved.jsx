import { Link } from 'react-router-dom'
import ActionCard from '../components/restaurant/action-card'
import SeoHead from '../components/seo/SeoHead'
import { restaurants } from '../data/restaurants'
import { useLibrary } from '../hooks/useLibrary'
import './Home.css'

export default function Saved() {
  const { saved, recent } = useLibrary()
  const savedList = saved.map((id) => restaurants.find((r) => r.id === id)).filter(Boolean)
  const recentList = recent.map((id) => restaurants.find((r) => r.id === id)).filter(Boolean)

  return (
    <div className="home-page">
      <SeoHead
        title="저장한 레스토랑 | 한국 미쉐린 가이드"
        description="찜한 미쉐린 레스토랑과 최근 본 목록을 한곳에서 다시 열어보세요."
        path="/saved"
      />
      <section className="hero hero-compact">
        <p className="hero-eyebrow">LIBRARY</p>
        <h1>저장 · 최근 본</h1>
        <p className="hero-sub">하트로 담아 둔 곳과 방금 본 레스토랑입니다. 이 기기에만 저장됩니다.</p>
      </section>

      <section>
        <h2 className="section-title">찜한 곳</h2>
        {savedList.length ? (
          <div className="restaurant-grid">
            {savedList.map((r) => (
              <ActionCard key={r.id} restaurant={r} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>아직 찜한 레스토랑이 없습니다.</p>
            <Link to="/" className="empty-link">
              목록에서 고르기
            </Link>
          </div>
        )}
      </section>

      {recentList.length > 0 && (
        <section>
          <h2 className="section-title">최근 본</h2>
          <div className="restaurant-grid">
            {recentList.map((r) => (
              <ActionCard key={r.id} restaurant={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
