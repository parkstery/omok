import { getAdNotice } from '../services/ads'
import './BannerAd.css'

export function BannerAd() {
  return (
    <div className="banner-ad" role="complementary" aria-label="광고">
      <span className="banner-label">AD</span>
      <span className="banner-text">{getAdNotice()}</span>
    </div>
  )
}
