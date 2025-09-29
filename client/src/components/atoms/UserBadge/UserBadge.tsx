import styles from './UserBadge.module.css'

type UserBadgeProps = {
  email?: string | null
  size?: number
  className?: string
}

const UserBadge = ({ size = 32, className }: UserBadgeProps) => {
  return (
    <div
      className={[styles.badge, className].filter(Boolean).join(' ')}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        width={Math.floor(size * 0.65)}
        height={Math.floor(size * 0.65)}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5Zm0 2c-3.866 0-7 3.134-7 7 0 .552.448 1 1 1h12c.552 0 1-.448 1-1 0-3.866-3.134-7-7-7Z"
          fill="#f0f4f8"
          opacity="0.95"
        />
      </svg>
    </div>
  )
}

export default UserBadge
