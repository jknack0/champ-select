import { useMemo } from 'react'
import Card from '../../atoms/Card'
import Heading from '../../atoms/Heading'
import SelectBadge from '../../atoms/SelectBadge'
import SelectSpinner from '../../atoms/SelectSpinner'
import SelectText from '../../atoms/SelectText'
import styles from './WaitingRoom.module.css'

type WaitingRoomProps = {
  amountLabel: string
  connected: boolean
  lastEventAt?: string
}

const WaitingRoom = ({ amountLabel, connected, lastEventAt }: WaitingRoomProps) => {
  const formattedTime = useMemo(() => {
    if (!lastEventAt) {
      return ''
    }
    const date = new Date(lastEventAt)
    if (Number.isNaN(date.getTime())) {
      return ''
    }
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  }, [lastEventAt])

  return (
    <Card>
      <div className={styles.container} aria-live="polite">
        <SelectSpinner />
        <Heading level={3}>Waiting for a matching donation.</Heading>
        <SelectText tone="muted">
          {amountLabel ? `We will unlock the picker as soon as a ${amountLabel} donation arrives.` : 'Keep the Streamlabs tab open-any eligible donation will unlock the picker.'}
        </SelectText>
        <div className={styles.meta}>
          <SelectBadge tone={connected ? 'success' : 'warning'}>
            {connected ? 'Socket Connected' : 'Socket Disconnected'}
          </SelectBadge>
          {formattedTime ? <SelectBadge tone="info">Last event {formattedTime}</SelectBadge> : null}
        </div>
      </div>
    </Card>
  )
}

export default WaitingRoom
