import styles from './ChampSelect.module.css'

const ChampSelect = () => {
  return (
    <section className={styles.pageContainer}>
      <h1 className={styles.pageHeading}>Champ Select</h1>
      <p className={styles.pageCopy}>
        This view will power the main champion selection experience for players. Build out the layout and
        champion interactions here.
      </p>
      <p className={styles.pageCopy}>
        Consider how to present picks, bans, timers, and player statuses. Keep the layout flexible so it can scale with
        future features.
      </p>
    </section>
  )
}

export default ChampSelect
