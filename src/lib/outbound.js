const APPNAME = encodeURIComponent('https://michelin-guide-kr.web.app')
const CT_PKG = 'co.kr.catchtable.android.catchtable_app'
const NMAP_PKG = 'com.nhn.android.nmap'
const CT_IOS = 'https://apps.apple.com/kr/app/id1485193566'

export function isAndroid() {
  return /Android/i.test(navigator.userAgent)
}

export function isIOS() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent)
}

export function isMobile() {
  return isAndroid() || isIOS()
}

export function telHref(phone) {
  if (!phone) return ''
  const raw = String(phone).trim()
  const plus = raw.startsWith('+')
  const digits = raw.replace(/\D/g, '')
  if (!digits) return ''
  if (plus || digits.startsWith('82')) return `tel:+${digits}`
  if (digits.startsWith('0')) return `tel:+82${digits.slice(1)}`
  return `tel:${digits}`
}

export function catchtableWebUrl(restaurant) {
  const alias = restaurant?.catchtableShop
  if (alias) {
    return `https://app.catchtable.co.kr/ct/shop/${encodeURIComponent(alias)}`
  }
  if (restaurant?.catchtableUrl?.includes('/ct/shop/')) {
    return restaurant.catchtableUrl
  }
  const q = encodeURIComponent(restaurant?.name || restaurant || '')
  return `https://app.catchtable.co.kr/ct/search/total?keyword=${q}&isKeywordSearchOpen=true`
}

export function naverWebUrl({ lat, lng, name, address }) {
  if (lat != null && lng != null) {
    return `https://map.naver.com/p/directions/-/-/${lng},${lat},${encodeURIComponent(name)}/walk`
  }
  return `https://map.naver.com/p/search/${encodeURIComponent(`${name || ''} ${address || ''}`.trim())}`
}

function go(url) {
  window.location.href = url
}

function openWithFallback(appUrl, webUrl, storeUrl) {
  const start = Date.now()
  go(appUrl)
  window.setTimeout(() => {
    if (document.hidden) return
    if (Date.now() - start < 1800) go(webUrl || storeUrl)
  }, 900)
}

export function openCatchtable(event, restaurant) {
  event?.preventDefault()
  event?.stopPropagation()
  const web = catchtableWebUrl(restaurant)
  const path = web.replace('https://app.catchtable.co.kr', '')
  if (isAndroid()) {
    go(
      `intent://${path.replace(/^\//, '')}#Intent;scheme=https;authority=app.catchtable.co.kr;package=${CT_PKG};S.browser_fallback_url=${encodeURIComponent(web)};end`,
    )
    return
  }
  if (isIOS() || isMobile()) {
    go(web)
    return
  }
  window.open(web, '_blank', 'noopener,noreferrer')
}

export function openNaverDirections(event, restaurant) {
  event?.preventDefault()
  event?.stopPropagation()
  const web = naverWebUrl(restaurant)
  const { lat, lng, name } = restaurant
  if (lat == null || lng == null) {
    if (isMobile()) go(web)
    else window.open(web, '_blank', 'noopener,noreferrer')
    return
  }
  if (isAndroid()) {
    go(
      `intent://route/walk?dlat=${lat}&dlng=${lng}&dname=${encodeURIComponent(name || '')}&appname=${APPNAME}#Intent;scheme=nmap;package=${NMAP_PKG};S.browser_fallback_url=${encodeURIComponent(web)};end`,
    )
    return
  }
  if (isIOS()) {
    openWithFallback(
      `nmap://route/walk?dlat=${lat}&dlng=${lng}&dname=${encodeURIComponent(name || '')}&appname=${APPNAME}`,
      web,
    )
    return
  }
  window.open(web, '_blank', 'noopener,noreferrer')
}

export function openTel(event, phone) {
  event?.stopPropagation()
  const href = telHref(phone)
  if (!href) {
    event?.preventDefault()
    return
  }
  if (isMobile()) {
    event?.preventDefault()
    go(href)
  }
}
