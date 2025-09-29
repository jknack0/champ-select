import styles from './Overlay.module.css'

const Overlay = () => {
  return (
    <section className={styles.pageContainer}>
      <h1 className={styles.pageHeading}>Overlay</h1>
      <p className={styles.pageCopy}>
        Design the broadcast overlay components used to display champions, timers, and player info for spectators.
      </p>
      <p className={styles.pageCopy}>
        Ensure this view stays lightweight so it can render in streaming software without extra configuration.
        Consider contrast ratios and motion guidelines for long stream sessions.
      </p>
    </section>
  )
}

export default Overlay
