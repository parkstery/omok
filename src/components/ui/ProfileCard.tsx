import type { UserProfile } from '../../core/types'
import './ProfileCard.css'

interface ProfileCardProps {
  profile: UserProfile
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const initial = profile.nickname.slice(0, 1).toUpperCase()
  return (
    <div className="profile-card">
      <div className="profile-card__row">
        <div className="profile-card__avatar" aria-hidden>
          {initial}
        </div>
        <div>
          <p className="profile-card__name">{profile.nickname}</p>
          <p className="profile-card__rank">{profile.rank}</p>
        </div>
      </div>
      <div className="profile-card__stats">
        <div className="profile-card__stat profile-card__stat--win">
          <span className="profile-card__stat-value">{profile.stats.wins}</span>
          <span className="profile-card__stat-label">승</span>
        </div>
        <div className="profile-card__stat profile-card__stat--loss">
          <span className="profile-card__stat-value">{profile.stats.losses}</span>
          <span className="profile-card__stat-label">패</span>
        </div>
        <div className="profile-card__stat">
          <span className="profile-card__stat-value">{profile.stats.draws}</span>
          <span className="profile-card__stat-label">무</span>
        </div>
      </div>
    </div>
  )
}
