import RouteBridge from "../../components/route-bridge";
import ShellBackground from "../../components/shell-background";
import { getCurrentUser } from "../../lib/auth/current-user";
import { guestUser } from "../../lib/mock-user";
import Script from "next/script";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function ShellLayout({ children }: { children: React.ReactNode }) {
  const user = (await getCurrentUser()) ?? guestUser();

  return (
    <main className="shellRoot">
      <RouteBridge />

      <div className="shell">
        <div className="header">
          <button
            className="leftUserMenu headerAction"
            id="userMenuBtn"
            data-focus="header.profile"
            type="button"
            aria-label="Profile and quick settings"
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
            <button className="navItem" type="button" data-page="guild" data-focus="nav.guild" role="tab" aria-selected="false">
              <i className="fa-solid fa-people-group" aria-hidden="true"></i>
              <span>Guild</span>
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
      <aside className="drawer" id="profileDrawer" hidden aria-hidden="true" aria-label="Profile and quick settings">
        <div className="drawerTop">
          <div className="drawerTitle">Profile</div>
          <button className="drawerClose headerAction" id="profileCloseBtn" data-focus="drawer.close" type="button" aria-label="Close profile">
            <i className="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
        </div>

        <div className="drawerBody">
          <div className="drawerCard">
            <div className="drawerUser">
              <div className="drawerAvatar" aria-hidden="true">
                <img className="drawerAvatar__img" src={user.avatarUrl} alt="" />
              </div>
              <div className="drawerUserMeta">
                <div className="drawerUserName">{user.displayName}</div>
                <div className="drawerUserSub">
                  {user.xp.toLocaleString()} XP • LVL {user.level}
                </div>
              </div>
            </div>
          </div>

          <div className="drawerCard">
            <div className="drawerSectionTitle">Quick Settings</div>

            <div className="qsMenu" aria-label="Quick shortcuts">
              <button className="qsMenuBtn headerAction" id="qsNotifBtn" data-focus="drawer.notif" type="button" aria-label="Toggle notifications">
                <span className="qsMenuIcon" aria-hidden="true">
                  <i className="fa-solid fa-bell"></i>
                </span>
                <span className="qsMenuText">Notification</span>
                <span className="qsMenuPill" id="qsNotifPill" aria-hidden="true">
                  On
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

              <button className="qsMenuBtn headerAction" id="qsGuildBtn" data-focus="drawer.shortcutGuild" type="button" aria-label="Go to Guild">
                <span className="qsMenuIcon" aria-hidden="true">
                  <i className="fa-solid fa-people-group"></i>
                </span>
                <span className="qsMenuText">Guild</span>
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
                aria-label="Toggle advanced settings"
                aria-expanded="false"
              >
                <i className="fa-solid fa-gear" aria-hidden="true"></i>
              </button>
              <button className="qsExitBtn headerAction" id="backToLandingBtn" data-focus="drawer.landing" type="button" aria-label="Exit to landing page">
                <div className="qsExitText">Exit To Landing</div>
                <div className="qsExitIcon" aria-hidden="true">
                  <i className="fa-solid fa-right-to-bracket"></i>
                </div>
              </button>
            </div>

            <div className="qsAdvanced" id="qsAdvanced" hidden aria-label="Advanced settings">
              <div className="qsSection" aria-label="Brightness settings">
                <div className="qsCaption">BRIGHTNESS</div>
                <div className="qsRow">
                  <div className="qsIcon" aria-hidden="true">
                    <i className="fa-solid fa-sun"></i>
                  </div>
                  <input
                    className="qsRange"
                    id="qsBrightness"
                    data-focus="drawer.brightness"
                    tabIndex={0}
                    type="range"
                    min={0}
                    max={100}
                    defaultValue={78}
                    aria-label="Brightness"
                  />
                  <div className="qsValue" id="qsBrightnessVal" aria-hidden="true">
                    78
                  </div>
                </div>
              </div>

              <div className="qsSection" aria-label="Sound effects volume">
                <div className="qsCaption">SFX VOLUME</div>
                <div className="qsRow">
                  <div className="qsIcon" aria-hidden="true">
                    <i className="fa-solid fa-volume-low"></i>
                  </div>
                  <input
                    className="qsRange"
                    id="qsSfxVolume"
                    data-focus="drawer.sfxVolume"
                    tabIndex={0}
                    type="range"
                    min={0}
                    max={100}
                    defaultValue={55}
                    aria-label="Sound effects volume"
                  />
                  <div className="qsValue" id="qsSfxVolumeVal" aria-hidden="true">
                    55
                  </div>
                </div>
              </div>

              <div className="qsSection" aria-label="Other settings">
                <div className="qsCaption">OTHER</div>
                <label className="qsToggleRow" htmlFor="qsFullscreen">
                  <span className="qsIcon" aria-hidden="true">
                    <i className="fa-solid fa-expand"></i>
                  </span>
                  <span className="qsToggleLabel">Fullscreen</span>
                  <input
                    id="qsFullscreen"
                    data-focus="drawer.fullscreen"
                    tabIndex={0}
                    className="qsToggleInput"
                    type="checkbox"
                    aria-label="Toggle fullscreen preference"
                  />
                  <span className="qsSwitch" aria-hidden="true"></span>
                </label>

                <label className="qsToggleRow" htmlFor="qsWallpapers">
                  <span className="qsIcon" aria-hidden="true">
                    <i className="fa-solid fa-film"></i>
                  </span>
                  <span className="qsToggleLabel">Wallpapers</span>
                  <input
                    id="qsWallpapers"
                    data-focus="drawer.wallpapers"
                    tabIndex={0}
                    className="qsToggleInput"
                    type="checkbox"
                    aria-label="Toggle wallpapers"
                    defaultChecked
                  />
                  <span className="qsSwitch" aria-hidden="true"></span>
                </label>
              </div>
            </div>

            <div className="qsAudioBar" aria-label="Audio controls">
              <audio id="qsMusicAudio" preload="metadata" />

              <div className="qsAudioLeft">
                <div className="qsMusicIcon" aria-hidden="true">
                  <i className="fa-solid fa-music"></i>
                </div>
                <div className="qsTrack">
                  <div className="qsTrackTitle" id="qsTrackTitle">
                    No playlist
                  </div>
                  <div className="qsTrackSub" id="qsTrackSub">
                    Add files to /public/sound/playlist
                  </div>
                </div>
              </div>

              <div className="qsAudioControls" aria-label="Music controls">
                <button className="qsCtl headerAction" id="qsMusicPrevBtn" data-focus="drawer.musicPrev" type="button" aria-label="Previous track">
                  <i className="fa-solid fa-backward-step" aria-hidden="true"></i>
                </button>
                <button className="qsCtl headerAction" id="qsMusicPlayBtn" data-focus="drawer.musicPlay" type="button" aria-label="Play or pause">
                  <i className="fa-solid fa-play" aria-hidden="true"></i>
                </button>
                <button className="qsCtl headerAction" id="qsMusicNextBtn" data-focus="drawer.musicNext" type="button" aria-label="Next track">
                  <i className="fa-solid fa-forward-step" aria-hidden="true"></i>
                </button>
              </div>

              <div className="qsAudioRight" aria-label="Audio toggles">
                <button className="qsPillBtn headerAction" id="toggleSfxBtn" data-focus="drawer.sfx" type="button" aria-label="Toggle sound effects">
                  <span className="qsPillBtn__label">SFX</span>
                  <i className="fa-solid fa-volume-high" aria-hidden="true"></i>
                </button>
                <button className="qsPillBtn headerAction" id="toggleMusicBtn" data-focus="drawer.music" type="button" aria-label="Toggle music">
                  <span className="qsPillBtn__label">Music</span>
                  <i className="fa-solid fa-music" aria-hidden="true"></i>
                </button>
              </div>

              <div className="qsMusicVol" aria-label="Music volume">
                <input className="qsRange" id="qsMusicVolume" data-focus="drawer.musicVolume" tabIndex={0} type="range" min={0} max={100} defaultValue={55} aria-label="Music volume" />
                <div className="qsValue" id="qsMusicVolumeVal" aria-hidden="true">
                  55
                </div>
              </div>
            </div>
            {user.id === 0 ? (
              <>
                <button className="drawerToggle headerAction" id="signInBtn" data-focus="drawer.signin" type="button" aria-label="Sign in">
                  Sign In
                </button>
                <button
                  className="drawerToggle headerAction"
                  id="registerBtn"
                  data-focus="drawer.register"
                  type="button"
                  aria-label="Create an account"
                >
                  Register
                </button>
              </>
            ) : (
              <button className="drawerToggle headerAction" id="signOutBtn" data-focus="drawer.signout" type="button" aria-label="Sign out">
                Sign Out
              </button>
            )}
            <button className="drawerToggle headerAction" data-focus="drawer.profile" type="button" aria-label="Open profile page (placeholder)">
              Open Profile (Soon)
            </button>
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
