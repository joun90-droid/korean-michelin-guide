import {
  catchtableWebUrl,
  naverWebUrl,
  openCatchtable,
  openNaverDirections,
  openTel,
  telHref,
} from '../../lib/outbound'
import './outbound-buttons.css'

export default function OutboundButtons({ restaurant, compact = false, className = '' }) {
  const tel = telHref(restaurant.phone)
  return (
    <div
      className={`outbound-btns ${compact ? 'compact' : ''} ${className}`.trim()}
      onClick={(e) => e.stopPropagation()}
    >
      <a
        href={catchtableWebUrl(restaurant.name)}
        rel="noopener noreferrer"
        onClick={(e) => openCatchtable(e, restaurant.name)}
      >
        캐치테이블 실시간 예약
      </a>
      <a
        href={naverWebUrl(restaurant)}
        rel="noopener noreferrer"
        onClick={(e) => openNaverDirections(e, restaurant)}
      >
        네이버 지도 길찾기
      </a>
      {tel ? (
        <a href={tel} onClick={(e) => openTel(e, restaurant.phone)}>
          전화 걸기
        </a>
      ) : (
        <span className="outbound-disabled">전화 정보 없음</span>
      )}
    </div>
  )
}
