import { useEffect, useMemo, useState } from 'react'
import styles from './Avatar.module.css'

type AvatarProps = {
  name: string
  src: string
}

const Avatar = ({ name, src }: AvatarProps) => {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setHasError(false)
  }, [src])

  const initials = useMemo(() => name.slice(0, 2).toUpperCase(), [name])

  if (!hasError) {
    return (
      <div className={styles.avatar}>
        <img className={styles.image} src={src} alt={name} onError={() => setHasError(true)} />
      </div>
    )
  }

  return (
    <div className={styles.avatar} role="img" aria-label={name}>
      <span className={styles.initials}>{initials}</span>
    </div>
  )
}

export default Avatar
