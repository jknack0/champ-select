import { useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { IconButton } from '../../atoms'
import UserBadge from '../../atoms/UserBadge'
import { Popover } from '../../molecules'
import styles from './AuthMenu.module.css'

const AuthMenu = () => {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const anchorRef = useRef<HTMLDivElement | null>(null)
  const navigate = useNavigate()

  const close = () => setOpen(false)
  const toggle = () => setOpen((v) => !v)

  const handleLogout = async () => {
    await logout()
    close()
    navigate('/champ-select', { replace: true })
  }

  return (
    <div className={styles.wrapper} ref={anchorRef}>
      <IconButton icon={<UserBadge email={user?.email ?? null} />} ariaLabel="Account menu" onClick={toggle} />
      <Popover open={open} onClose={close}>
        {user ? (
          <div className={styles.menu}>
            <div className={styles.header}>
              <UserBadge email={user.email} />
              <div className={styles.meta}>
                <div className={styles.email}>{user.email}</div>
              </div>
            </div>
            <button className={styles.item} onClick={handleLogout} role="menuitem">
              Logout
            </button>
          </div>
        ) : (
          <div className={styles.menu}>
            <NavLink className={styles.item} to="/login" onClick={close} role="menuitem">
              Login
            </NavLink>
            <NavLink className={styles.item} to="/signup" onClick={close} role="menuitem">
              Sign Up
            </NavLink>
          </div>
        )}
      </Popover>
    </div>
  )
}

export default AuthMenu
