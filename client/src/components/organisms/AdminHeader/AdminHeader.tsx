import { Heading, Button } from '../../atoms'
import styles from './AdminHeader.module.css'

type ShareStatus = 'idle' | 'copied' | 'error'

type ShareLinkConfig = {
  label: string
  url: string
  status: ShareStatus
  onCopy?: () => void
}

type AdminHeaderProps = {
  shareLinks?: ShareLinkConfig[]
}

const AdminHeader = ({ shareLinks = [] }: AdminHeaderProps) => {
  return (
    <header className={styles.header}>
      <Heading level={1}>Champ Select Admin</Heading>
      {shareLinks.length > 0 ? (
        <div className={styles.shareList}>
          {shareLinks.map(({ label, url, status, onCopy }, index) => {
            const labelId = `share-link-${index}`

            let feedbackText: string | null = null
            let feedbackClass = styles.helper
            let feedbackRole: 'status' | undefined

            if (status === 'copied') {
              feedbackText = 'Link copied!'
              feedbackClass = styles.success
              feedbackRole = 'status'
            } else if (status === 'error') {
              feedbackText = 'Copy failed. Try again.'
              feedbackClass = styles.error
              feedbackRole = 'status'
            }

            return (
              <div key={label} className={styles.shareSection} role="group" aria-labelledby={labelId}>
                <div className={styles.shareContent}>
                  <span className={styles.shareLabel} id={labelId}>
                    {label}
                  </span>
                  <div className={styles.shareControl}>
                    <input
                      className={styles.shareInput}
                      value={url}
                      readOnly
                      aria-label={label}
                      onFocus={(event) => event.currentTarget.select()}
                    />
                    <Button type="button" variant="ghost" onClick={onCopy} disabled={!onCopy}>
                      Copy Link
                    </Button>
                  </div>
                  {feedbackText ? (
                    <span className={feedbackClass} role={feedbackRole}>
                      {feedbackText}
                    </span>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      ) : null}
    </header>
  )
}

export default AdminHeader
