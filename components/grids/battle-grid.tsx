import BattleLeaderboard from "./battle-leaderboard";
import styles from "./battle-grid.module.css";

export default function BattleGrid() {
  return (
    <div className={styles.page} aria-label="Battle grid">
      <div className={styles.grid}>
        <div className={`${styles.block} ${styles.leftTop}`}>
          <div className={styles.label}>Your Stats</div>
          <div className={`gridCard ${styles.card}`} id="battle-stats" data-focus="battle.stats" tabIndex={0} role="button" aria-label="Your battle stats">
            <div className={styles.content} aria-hidden="true">
              <div className={styles.statsGrid}>
                <div className={styles.stat}>
                  <div className={styles.statLabel}>ELO</div>
                  <div className={styles.statValue}>1,350</div>
                </div>
                <div className={styles.stat}>
                  <div className={styles.statLabel}>Rank</div>
                  <div className={styles.statValue}>Silver II</div>
                </div>
                <div className={styles.stat}>
                  <div className={styles.statLabel}>Winrate</div>
                  <div className={styles.statValue}>62%</div>
                </div>
                <div className={styles.stat}>
                  <div className={styles.statLabel}>Battle XP</div>
                  <div className={styles.statValue}>+240</div>
                </div>
              </div>

              <div className={styles.contentBottom}>
                <div className={styles.kicker}>Highlights</div>
                <div className={styles.meta}>Top topic: Calculus • Current streak: 3</div>
              </div>
            </div>
          </div>
        </div>

        <div className={`${styles.block} ${styles.leftBottom}`}>
          <div className={styles.label}>Based on Your Quest</div>
          <div className={`gridCard ${styles.card}`} id="battle-quests" data-focus="battle.questBased" tabIndex={0} role="button" aria-label="Recommended battles from your quests">
            <div className={styles.content} aria-hidden="true">
              <div className={styles.questList}>
                <div className={styles.questItem}>
                  <div className={styles.questTitle}>Mid Exam - Calculus</div>
                  <div className={styles.questMeta}>Recommended: Ranked • +120 XP</div>
                </div>
                <div className={styles.questItem}>
                  <div className={styles.questTitle}>AOI Case Study - Data Structure</div>
                  <div className={styles.questMeta}>Recommended: Practice • 10m</div>
                </div>
              </div>
              <div className={styles.contentBottom}>
                <div className={styles.meta}>Win battles to earn XP + boost quest progress.</div>
              </div>
            </div>
          </div>
        </div>

        <div className={`${styles.block} ${styles.midTop}`}>
          <div className={styles.label}>Battle Mode</div>
          <button className={`gridCard ${styles.card} ${styles.rankedCard}`} id="battle-ranked" data-focus="battle.lobby" type="button" aria-label="Ranked battle mode">
            <div className={styles.content} aria-hidden="true">
              <div className={styles.kicker}>Ranked</div>
              <div className={styles.titleRow}>
                <div className={styles.title}>Ranked 1v1</div>
              </div>
              <div className={styles.meta}>ELO ranked • +XP rewards • vs Bot</div>

              <div className={styles.ctaRow}>
                <span className={styles.pill}>
                  <i className="fa-solid fa-trophy" aria-hidden="true"></i> Win to climb
                </span>
                <span className={styles.pill}>
                  <i className="fa-solid fa-bolt" aria-hidden="true"></i> Quest XP boost
                </span>
              </div>

              <img className={styles.rankedMascot} src="/blockyPng/battle.png" alt="" aria-hidden="true" />
            </div>
          </button>
        </div>

        <div className={styles.midStack}>
          <button className={`gridCard ${styles.card} ${styles.midStackTop}`} id="battle-casual" data-focus="battle.casual" type="button" aria-label="Casual battle mode">
            <div className={styles.content} aria-hidden="true">
              <div className={styles.kicker}>Casual</div>
              <div className={styles.title}>Quick Match</div>
              <div className={styles.meta}>No rank loss • Fast warm-up</div>
            </div>
          </button>

          <button className={`gridCard ${styles.card} ${styles.midStackTop}`} id="battle-practice" data-focus="battle.practice" type="button" aria-label="Practice battle mode">
            <div className={styles.content} aria-hidden="true">
              <div className={styles.kicker}>Practice</div>
              <div className={styles.title}>Training</div>
              <div className={styles.meta}>Pick topic • Difficulty • Drills</div>
            </div>
          </button>

          <button className={`gridCard ${styles.card}`} id="battle-makeRoom" data-focus="battle.room.make" type="button" aria-label="Make a room">
            <div className={styles.content} aria-hidden="true">
              <div className={styles.kicker}>Room</div>
              <div className={styles.title}>Make a room</div>
              <div className={styles.meta}>Play with friends (coming soon)</div>
            </div>
          </button>

          <button className={`gridCard ${styles.card}`} id="battle-joinRoom" data-focus="battle.room.join" type="button" aria-label="Join a room">
            <div className={styles.content} aria-hidden="true">
              <div className={styles.kicker}>Room</div>
              <div className={styles.title}>Join a room</div>
              <div className={styles.meta}>Enter code (coming soon)</div>
            </div>
          </button>
        </div>

        <div className={`${styles.block} ${styles.right}`}>
          <div className={styles.label}>Leaderboard</div>
          <div className={`gridCard ${styles.card}`} id="battle-leaderboard" data-focus="battle.leaderboard" tabIndex={0} role="region" aria-label="Leaderboard">
            <div className={styles.content}>
              <BattleLeaderboard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
