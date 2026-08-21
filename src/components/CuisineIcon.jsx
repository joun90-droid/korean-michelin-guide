const icons = {
  한식: (
    <>
      <path d="M8 17c0 6.6 5.4 11 12 11s12-4.4 12-11" />
      <ellipse cx="20" cy="17" rx="12" ry="3" />
      <path d="M14.5 10.5c1-1.5 2-3.5 1.5-5.5M20 10c.3-2 .3-4-.5-6M25.5 10.5c-1-1.5-1.6-3.5-1-5.5" />
    </>
  ),
  오마카세: (
    <>
      <rect x="8" y="21" width="24" height="8" rx="4" />
      <path d="M10 21c1.5-7 6.5-11 10-11s8.5 4 10 11" />
      <path d="M14 25h12" />
    </>
  ),
  프렌치: (
    <>
      <path d="M13 6c-1 4-1.5 7 0 9.5A7 7 0 0 0 20 19a7 7 0 0 0 7-3.5c1.5-2.5 1-5.5 0-9.5" />
      <path d="M20 19v11M14 34h12" />
    </>
  ),
  이탈리안: (
    <>
      <path d="M12 8v9M16 8v9M12 17a4 4 0 0 0 4 4v9M16 17a4 4 0 0 0 4-4" />
      <circle cx="27" cy="24" r="6" />
      <path d="M27 19a5 5 0 0 1 0 10 5 5 0 0 1-4-2" />
    </>
  ),
  모던: (
    <>
      <circle cx="20" cy="20" r="12" />
      <circle cx="20" cy="20" r="5.5" />
      <circle cx="27" cy="12" r="1.4" fill="currentColor" stroke="none" />
    </>
  ),
  중식: (
    <>
      <path d="M9 23c0-8 5-13 11-13s11 5 11 13" />
      <path d="M9 23h22" />
      <path d="M13.5 23c.8-2.3 1.6-3.6 2.5-4.4M18 23c.8-3 1.6-4.7 2-5.4M22 23c.8-3 1.6-4.7 2-5.4M26.5 23c.8-2.3 1.6-3.6 2.5-4.4" />
    </>
  ),
}

export default function CuisineIcon({ cuisine, className }) {
  const paths = icons[cuisine] ?? icons['모던']
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths}
    </svg>
  )
}
