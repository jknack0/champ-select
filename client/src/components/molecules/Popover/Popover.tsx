import { useEffect, useRef } from 'react'
import styles from './Popover.module.css'

type PopoverProps = {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
}

const Popover = ({ open, onClose, children, className }: PopoverProps) => {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClick)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div ref={ref} className={[styles.popover, className].filter(Boolean).join(' ')} role="menu">
      {children}
    </div>
  )
}

export default Popover
