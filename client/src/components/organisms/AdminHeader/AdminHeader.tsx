import { Heading, Button } from '../../atoms'
import styles from './AdminHeader.module.css'

type AdminHeaderProps = {
  shareLink?: string
  shareLinkStatus?: 'idle' | 'copied' | 'error'
  onCopyShareLink?: () => void
}

const AdminHeader = ({ shareLink, shareLinkStatus = 'idle', onCopyShareLink }: AdminHeaderProps) => {
  const showShareLink = Boolean(shareLink)
  const canCopy = Boolean(onCopyShareLink)

  let feedback: string | null = null
  if (shareLinkStatus === 'copied') {
    feedback = 'Link copied!'
  } else if (shareLinkStatus === 'error') {
    feedback = 'Copy failed. Try again.'
  }

  return (
    <header className={styles.header}>
      <Heading level={1}>Champ Select Admin</Heading>
      {showShareLink ? (
        <div className={styles.shareSection} role="group" aria-labelledby="viewer-link-label">
          <div className={styles.shareContent}>
            <span className={styles.shareLabel} id="viewer-link-label">
              Viewer Link
            </span>
            <div className={styles.shareControl}>
              <input
                className={styles.shareInput}
                value={shareLink}
                readOnly
                aria-label="Viewer link"
                onFocus={(event) => event.currentTarget.select()}
              />
              <Button type="button" onClick={onCopyShareLink} disabled={!canCopy}>
                Copy Link
              </Button>
            </div>
            {feedback ? (
              <span
                className={shareLinkStatus === 'copied' ? styles.success : styles.error}
                role="status"
              >
                {feedback}
              </span>
            ) : (
              <span className={styles.helper}>Share this link with your viewers to keep them in sync.</span>
            )}
          </div>
        </div>
      ) : null}
    </header>
  )
}

export default AdminHeader
