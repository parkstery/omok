import { useEffect, useState } from 'react'
import { BannerAd } from '../components/BannerAd'
import { HelpModal } from '../components/HelpModal'
import { RuleToggle } from '../components/RankPicker'
import { Button } from '../components/ui/Button'
import { StatusBadge } from '../components/ui/StatusBadge'
import { TopBar } from '../components/ui/TopBar'
import { mustUseRenju, resolveRule } from '../core/game'
import {
  abandonRoom,
  createRoom,
  fetchRoom,
  getOnlineStatus,
  inviteUrl,
  joinRoom,
  subscribeRoom,
  type JoinResult,
} from '../services/network'
import { useGameStore } from '../store/gameStore'
import { useUserStore } from '../store/userStore'
import './Screen.css'

type LobbyPhase = 'setup' | 'waiting'

function joinErrorMessage(code: JoinResult): string {
  switch (code) {
    case 'missing':
      return '방을 찾을 수 없습니다.'
    case 'full':
      return '이미 다른 플레이어가 참가했습니다.'
    case 'self':
      return '본인이 만든 방에는 참가할 수 없습니다.'
    case 'offline':
      return 'Firebase가 설정되지 않았습니다.'
    default:
      return '참가에 실패했습니다.'
  }
}

export function PvPScreen() {
  const setScreen = useGameStore((s) => s.setScreen)
  const roomCode = useGameStore((s) => s.roomCode)
  const setRoomCode = useGameStore((s) => s.setRoomCode)
  const enterOnlineGame = useGameStore((s) => s.enterOnlineGame)
  const profile = useUserStore((s) => s.profile)
  const [rule, setRule] = useState<'freestyle' | 'renju'>('freestyle')
  const [help, setHelp] = useState(false)
  const [phase, setPhase] = useState<LobbyPhase>('setup')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const online = getOnlineStatus()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const room = params.get('room')
    if (room) setRoomCode(room.toUpperCase())
  }, [setRoomCode])

  useEffect(() => {
    if (phase !== 'waiting' || !roomCode) return

    const unsub = subscribeRoom(roomCode, (room) => {
      if (room?.status === 'playing' && room.guest) {
        enterOnlineGame(roomCode, room, 'host')
      }
    })

    return () => {
      unsub?.()
    }
  }, [phase, roomCode, enterOnlineGame])

  const resolvedRule = resolveRule(rule, profile?.rank ?? '15급', profile?.rank ?? '15급')

  const handleCreate = async () => {
    if (!profile) return
    setBusy(true)
    setError('')
    try {
      const code = await createRoom({
        hostId: profile.gameId,
        hostName: profile.nickname,
        hostRank: profile.rank,
        rule: resolvedRule,
      })
      if (!code) {
        setError('온라인 대전을 사용하려면 Firebase Realtime Database 설정이 필요합니다.')
        return
      }
      setRoomCode(code)
      setPhase('waiting')
    } finally {
      setBusy(false)
    }
  }

  const handleJoin = async () => {
    if (!profile || !roomCode.trim()) return
    setBusy(true)
    setError('')
    try {
      const result = await joinRoom(roomCode, {
        id: profile.gameId,
        name: profile.nickname,
        rank: profile.rank,
      })
      if (result !== 'ok') {
        setError(joinErrorMessage(result))
        return
      }
      const room = await fetchRoom(roomCode)
      if (!room) {
        setError('방 정보를 불러오지 못했습니다.')
        return
      }
      enterOnlineGame(roomCode, room, 'guest')
    } finally {
      setBusy(false)
    }
  }

  const handleCopy = async () => {
    if (!roomCode) return
    const link = inviteUrl(roomCode)
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      await navigator.clipboard.writeText(roomCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const leaveWaiting = () => {
    if (roomCode) void abandonRoom(roomCode)
    setPhase('setup')
    setRoomCode('')
    setError('')
  }

  return (
    <div className="screen">
      <BannerAd />
      <TopBar
        title="사람 대전"
        onBack={() => (phase === 'waiting' ? leaveWaiting() : setScreen('home'))}
        onHelp={() => setHelp(true)}
      />
      <main className="screen-main compact">
        <StatusBadge tone={online === 'ready' ? 'accent' : 'default'}>
          {online === 'ready' ? '온라인 준비됨' : 'Firebase 미설정'}
        </StatusBadge>

        {phase === 'setup' && (
          <>
            <div className="field">
              <label>규칙</label>
              <RuleToggle value={rule} onChange={setRule} rank={profile?.rank ?? '15급'} />
              {mustUseRenju(profile?.rank ?? '15급') && (
                <p className="hint">3급 이상은 렌주룰만 적용됩니다.</p>
              )}
            </div>
            <Button variant="secondary" fullWidth disabled={busy} onClick={handleCreate}>
              방 만들기
            </Button>
            <div className="field">
              <label>방 코드</label>
              <input
                className="text-input"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="ABCDEF"
                maxLength={8}
              />
            </div>
            <Button variant="primary" fullWidth disabled={busy || !roomCode.trim()} onClick={handleJoin}>
              참가
            </Button>
          </>
        )}

        {phase === 'waiting' && roomCode && (
          <div className="pvp-waiting">
            <p className="pvp-waiting__title">상대를 기다리는 중…</p>
            <div className="code-box">
              <span>방 코드</span>
              <strong>{roomCode}</strong>
            </div>
            <Button variant="secondary" fullWidth onClick={handleCopy}>
              {copied ? '복사됨!' : '초대 링크 복사'}
            </Button>
            <p className="hint">코드 또는 링크를 상대에게 보내세요.</p>
          </div>
        )}

        {error && <p className="hint warn">{error}</p>}
      </main>
      {help && (
        <HelpModal title="사람 대전" onClose={() => setHelp(false)}>
          <p>방을 만들고 코드 또는 링크를 상대에게 공유하세요.</p>
          <p>상대가 참가하면 실시간으로 착수가 동기화됩니다.</p>
          <p>Firebase Realtime Database가 필요합니다.</p>
        </HelpModal>
      )}
    </div>
  )
}
