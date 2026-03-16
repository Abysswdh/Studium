import RouteBridge from "../../components/route-bridge";
import ShellBackground from "../../components/shell-background";
import { redirect } from "next/navigation";
import { getCurrentUser } from "../../lib/auth/current-user";
import Script from "next/script";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function ShellLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  return (
    <main className="shellRoot" data-user-id={user.id}>
      <RouteBridge />

      <div className="shell">
        <div className="header">
          <button
            className="leftUserMenu headerAction"
            id="userMenuBtn"
            data-focus="header.quickSettings"
            type="button"
            aria-label="Quick settings"
          >
            <div className="userAvatar" aria-hidden="true">
              <img className="userAvatar__img" src={user.avatarUrl} alt="" />
            </div>
            <div className="userMeta">
              <div className="userName">{user.displayName}</div>
              <div className="userXp">
                <span className="bolt" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M13 2L3 14h8l-1 8 11-14h-8l0-6z" fill="currentColor" />
                  </svg>
                </span>
                <span className="userXp__value">{user.xp.toLocaleString()} XP</span>
              </div>
            </div>
          </button>

          <div className="rightClockMenu" aria-label="Clock">
            <button className="viewLabel headerAction" id="viewLabel" data-focus="header.pageInfo" type="button" aria-label="Page info">
              Dashboard
            </button>
            <span className="clock" id="clock">
              --:--
            </span>
            <div className="viewInfo" id="viewInfo" hidden>
              <div className="viewInfo__title" id="viewInfoTitle">
                Dashboard
              </div>
              <div className="viewInfo__desc" id="viewInfoDesc">
                Your daily snapshot: routine, quests, streaks, and widgets.
              </div>
            </div>
          </div>
        </div>

        <div id="routeOutlet">{children}</div>

        <div className="navbar" aria-label="Main navigation">
          <div className="carousel" id="carousel" role="tablist" aria-label="Menu switcher">
            <button className="navItem" type="button" data-page="dashboard" data-focus="nav.dashboard" role="tab" aria-selected="false">
              <i className="fa-solid fa-gauge" aria-hidden="true"></i>
              <span>Dashboard</span>
            </button>
            <button className="navItem" type="button" data-page="notes" data-focus="nav.notes" role="tab" aria-selected="false">
              <i className="fa-solid fa-note-sticky" aria-hidden="true"></i>
              <span>Notes</span>
            </button>
            <button className="navItem" type="button" data-page="quest" data-focus="nav.quest" role="tab" aria-selected="false">
              <i className="fa-solid fa-map" aria-hidden="true"></i>
              <span>Quest</span>
            </button>
            <button className="navItem" type="button" data-page="schedules" data-focus="nav.schedules" role="tab" aria-selected="false">
              <i className="fa-solid fa-calendar-days" aria-hidden="true"></i>
              <span>Schedule</span>
            </button>
            <button className="navItem" type="button" data-page="study" data-focus="nav.study" role="tab" aria-selected="false">
              <i className="fa-solid fa-book-open" aria-hidden="true"></i>
              <span>Study Room</span>
            </button>
            <button className="navItem" type="button" data-page="battle" data-focus="nav.battle" role="tab" aria-selected="false">
              <i className="fa-solid fa-fire" aria-hidden="true"></i>
              <span>Battle</span>
            </button>
            <button className="navItem" type="button" data-page="match" data-focus="nav.match" role="tab" aria-selected="false">
              <i className="fa-solid fa-gear" aria-hidden="true"></i>
              <span>Options</span>
            </button>
          </div>
        </div>

        <div className="footerHUD">
          <div className="appver">
            <div className="userName">Studium v1.0.0</div>
          </div>
          <div className="hud">
            <div className="hudBar" aria-label="Controls">
              <div className="hudGroup hudGroup--touch" aria-label="Swipe menu">
                <div className="hudKeys" aria-hidden="true">
                  <span className="hudKey">
                    <i className="fa-solid fa-arrows-left-right"></i>
                  </span>
                </div>
                <div className="hudLabel">Swipe left/right</div>
              </div>

              <div className="hudGroup" aria-label="Navigate">
                <div className="hudKeys" aria-hidden="true">
                  <span className="hudKey">
                    <i className="fa-solid fa-arrow-left"></i>
                  </span>
                  <span className="hudKey">
                    <i className="fa-solid fa-arrow-up"></i>
                  </span>
                  <span className="hudKey">
                    <i className="fa-solid fa-arrow-down"></i>
                  </span>
                  <span className="hudKey">
                    <i className="fa-solid fa-arrow-right"></i>
                  </span>
                </div>
                <div className="hudLabel">Navigate</div>
              </div>

              <div className="hudGroup hudGroup--right" aria-label="Scroll Menu">
                <div className="hudKeys" aria-hidden="true">
                  <span className="hudKey hudKey--mouse">
                    <i className="fa-solid fa-computer-mouse"></i>
                    <i className="fa-solid fa-arrows-up-down hudMouseScroll"></i>
                  </span>
                </div>
                <div className="hudLabel">Scroll Menu</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="drawerOverlay" id="profileOverlay" hidden></div>
      <aside className="drawer" id="profileDrawer" hidden aria-hidden="true" aria-label="Quick settings">
        <div className="drawerTop">
          <div className="drawerTitle">Quick Settings</div>
          <button className="drawerClose headerAction" id="profileCloseBtn" data-focus="drawer.close" type="button" aria-label="Close quick settings">
            <i className="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
        </div>

        <div className="drawerBody">
          <div className="drawerCard">
            <div className="drawerSectionTitle">Profile</div>
            <button className="drawerUser headerAction" id="qsProfileBtn" data-focus="drawer.profile" type="button" aria-label="Open profile settings">
              <div className="drawerAvatar" aria-hidden="true">
                <img className="drawerAvatar__img" src={user.avatarUrl} alt="" />
              </div>
              <div className="drawerUserMeta">
                <div className="drawerUserName">{user.displayName}</div>
                <div className="drawerUserSub">
                  {user.xp.toLocaleString()} XP | LVL {user.level}
                </div>
              </div>
              <span className="drawerUserChevron" aria-hidden="true">
                <i className="fa-solid fa-chevron-right"></i>
              </span>
            </button>
          </div>

          <div className="drawerCard">
            <div className="drawerSectionTitle">Shortcuts</div>

            <div className="qsMenu" aria-label="Quick shortcuts">
              <button className="qsMenuBtn headerAction" id="qsNotifBtn" data-focus="drawer.notif" type="button" aria-label="Notification settings">
                <span className="qsMenuIcon" aria-hidden="true">
                  <i className="fa-solid fa-bell"></i>
                </span>
                <span className="qsMenuText">Notification</span>
                <span className="qsMenuChevron" aria-hidden="true">
                  <i className="fa-solid fa-chevron-right"></i>
                </span>
              </button>

              <button className="qsMenuBtn headerAction" id="qsQuestBtn" data-focus="drawer.shortcutQuest" type="button" aria-label="Go to Quest">
                <span className="qsMenuIcon" aria-hidden="true">
                  <i className="fa-solid fa-map"></i>
                </span>
                <span className="qsMenuText">Quest</span>
                <span className="qsMenuChevron" aria-hidden="true">
                  <i className="fa-solid fa-chevron-right"></i>
                </span>
              </button>

              <button className="qsMenuBtn headerAction" id="qsBattleBtn" data-focus="drawer.shortcutBattle" type="button" aria-label="Go to Battle">
                <span className="qsMenuIcon" aria-hidden="true">
                  <i className="fa-solid fa-fire"></i>
                </span>
                <span className="qsMenuText">Battle</span>
                <span className="qsMenuChevron" aria-hidden="true">
                  <i className="fa-solid fa-chevron-right"></i>
                </span>
              </button>

              <button className="qsMenuBtn headerAction" id="qsNotesBtn" data-focus="drawer.shortcutNotes" type="button" aria-label="Go to Notes">
                <span className="qsMenuIcon" aria-hidden="true">
                  <i className="fa-solid fa-note-sticky"></i>
                </span>
                <span className="qsMenuText">Notes</span>
                <span className="qsMenuChevron" aria-hidden="true">
                  <i className="fa-solid fa-chevron-right"></i>
                </span>
              </button>
            </div>
            <div className="qsBottomRow" aria-label="Quick actions">
              <button className="qsSquareBtn headerAction" id="qsHomeBtn" data-focus="drawer.home" type="button" aria-label="Go to Dashboard">
                <i className="fa-solid fa-table-cells-large" aria-hidden="true"></i>
              </button>
              <button
                className="qsSquareBtn headerAction"
                id="qsSettingsBtn"
                data-focus="drawer.settings"
                type="button"
                aria-label="Open Options"
              >
                <i className="fa-solid fa-gear" aria-hidden="true"></i>
              </button>
              <button className="qsExitBtn headerAction" id="backToLandingBtn" data-focus="drawer.exit" type="button" aria-label="Exit to landing page">
                <span className="qsExitText">Exit Studium Focus Mode</span>
                <span className="qsExitIcon" aria-hidden="true">
                  <i className="fa-solid fa-right-from-bracket"></i>
                </span>
              </button>
            </div>
          </div>

          <div className="drawerCard">
            <div className="drawerSectionTitle">Music</div>

            <div className="qsAudioBar" aria-label="Music player">
              <audio id="qsMusicAudio" preload="metadata" />

              <div className="qsPlayer">
                <div className="qsMusicIcon" id="qsMusicIcon" aria-hidden="true">
                  <i className="fa-solid fa-music" aria-hidden="true"></i>
                </div>

                <div className="qsPlayerMain">
                  <div className="qsTrack">
                    <div className="qsTrackTitle" id="qsTrackTitle">
                      Music
                    </div>
                    <div className="qsTrackSub" id="qsTrackSub">
                      Loading playlist...
                    </div>
                  </div>

                  <div className="qsPlayerControls" aria-label="Music controls">
                    <button className="qsCtl headerAction" id="qsMusicPrevBtn" data-focus="drawer.music.prev" type="button" aria-label="Previous track">
                      <i className="fa-solid fa-backward-step" aria-hidden="true"></i>
                    </button>
                    <button className="qsCtl headerAction" id="qsMusicPlayBtn" data-focus="drawer.music.play" type="button" aria-label="Play or pause">
                      <i className="fa-solid fa-play" aria-hidden="true"></i>
                    </button>
                    <button className="qsCtl headerAction" id="qsMusicNextBtn" data-focus="drawer.music.next" type="button" aria-label="Next track">
                      <i className="fa-solid fa-forward-step" aria-hidden="true"></i>
                    </button>

                    <button className="qsCtl headerAction" id="toggleMusicBtn" data-focus="drawer.music.toggle" type="button" aria-label="Toggle music output">
                      <i className="fa-solid fa-volume-high qsMusicOnIcon" aria-hidden="true"></i>
                      <i className="fa-solid fa-volume-xmark qsMusicOffIcon" aria-hidden="true"></i>
                    </button>
                  </div>

                  <input
                    className="qsSeek"
                    id="qsMusicSeek"
                    type="range"
                    min={0}
                    max={1000}
                    step={1}
                    defaultValue={0}
                    aria-label="Track position"
                    data-focus="drawer.music.seek"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="bg">
        <ShellBackground />
        <div className="bg__veil" aria-hidden="true"></div>
      </div>

      <div className="bootOverlay" id="bootOverlay" aria-hidden="true">
        <div className="bootLogo" id="bootLogo">
          <div className="bootLogo__title">STUDIUM</div>
          <div className="bootLogo__tag">Study like a game, finish like a pro.</div>
        </div>
      </div>

      <Script src="/studium-client.js" strategy="afterInteractive" />
    </main>
  );
}
