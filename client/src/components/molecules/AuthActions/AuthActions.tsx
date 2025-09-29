import styles from './AuthActions.module.css'
import { Button } from '../../atoms'

export type AuthActionsProps = {
  submitting?: boolean
  primaryText: string
  onSubmit: () => void
  secondary?: React.ReactNode
}

const AuthActions = ({ submitting, primaryText, onSubmit, secondary }: AuthActionsProps) => (
  <div className={styles.actions}>
    <Button onClick={onSubmit} ariaLabel={primaryText} disabled={submitting}>
      {submitting ? `${primaryText}...` : primaryText}
    </Button>
    {secondary ? <div className={styles.secondary}>{secondary}</div> : null}
  </div>
)

export default AuthActions
