import { NavLink } from 'react-router-dom'
import './Header.css'

function SunIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path
        fill="currentColor"
        d="M10 4.5a1 1 0 0 1-1-1v-1a1 1 0 1 1 2 0v1a1 1 0 0 1-1 1Zm0 12a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1Zm7.5-6.5a1 1 0 0 1-1 1h-1a1 1 0 1 1 0-2h1a1 1 0 0 1 1 1Zm-13 0a1 1 0 0 1-1 1h-1a1 1 0 1 1 0-2h1a1 1 0 0 1 1 1Zm10.02-5.52a1 1 0 0 1 0 1.42l-.7.7a1 1 0 1 1-1.42-1.42l.7-.7a1 1 0 0 1 1.42 0Zm-9.32 9.32a1 1 0 0 1 0 1.42l-.7.7a1 1 0 1 1-1.42-1.42l.7-.7a1 1 0 0 1 1.42 0Zm9.32 1.42a1 1 0 0 1-1.42 0l-.7-.7a1 1 0 1 1 1.42-1.42l.7.7a1 1 0 0 1 0 1.42ZM5.9 5.62a1 1 0 0 1-1.42 0l-.7-.7A1 1 0 1 1 5.2 3.5l.7.7a1 1 0 0 1 0 1.42ZM10 6.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Z"
      />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path
        fill="currentColor"
        d="M17.3 12.6a7.5 7.5 0 0 1-9.9-9.9.75.75 0 0 0-.9-1 8.98 8.98 0 1 0 11.8 11.8.75.75 0 0 0-1-.9Z"
      />
    </svg>
  )
}

export default function Header({ theme, onToggleTheme }) {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <NavLink to="/" className="brand">
          <span className="brand-mark">가</span>
          <span className="brand-text">
            <strong>한국 미슐랭 가이드</strong>
            <em>Korean Michelin Guide</em>
          </span>
        </NavLink>

        <nav className="site-nav" aria-label="주요 메뉴">
          <NavLink to="/" end>
            목록
          </NavLink>
          <NavLink to="/map">지도</NavLink>
        </nav>

        <button
          type="button"
          className="theme-toggle"
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
    </header>
  )
}
