import RouteBridge from "../../components/route-bridge";
import { getCurrentUser } from "../../lib/auth/current-user";
import { guestUser } from "../../lib/mock-user";
import MusicPlayer from "../../components/music/music-player";
import { getPlaylistTracks } from "../../lib/music/playlist";
import ExternalNowPlaying from "../../components/external-now-playing/external-now-playing";
import Script from "next/script";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function ShellLayout({ children }: { children: React.ReactNode }) {
  const user = (await getCurrentUser()) ?? guestUser();
  const tracks = getPlaylistTracks();

  return (
    <main>
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
            <button className="navItem" type="button" data-page="routine" data-focus="nav.routine" role="tab" aria-selected="false">
              <i className="fa-solid fa-list-check" aria-hidden="true"></i>
              <span>Routine</span>
            </button>
            <button className="navItem" type="button" data-page="quest" data-focus="nav.quest" role="tab" aria-selected="false">
              <i className="fa-solid fa-map" aria-hidden="true"></i>
              <span>Quest</span>
            </button>
            <button className="navItem" type="button" data-page="schedules" data-focus="nav.schedules" role="tab" aria-selected="false">
              <i className="fa-solid fa-calendar-days" aria-hidden="true"></i>
              <span>Schedules</span>
            </button>
            <button className="navItem" type="button" data-page="notes" data-focus="nav.notes" role="tab" aria-selected="false">
              <i className="fa-solid fa-note-sticky" aria-hidden="true"></i>
              <span>Notes</span>
            </button>
            <button className="navItem" type="button" data-page="study" data-focus="nav.study" role="tab" aria-selected="false">
              <i className="fa-solid fa-book-open" aria-hidden="true"></i>
              <span>Study</span>
            </button>
            <button className="navItem" type="button" data-page="pomodoro" data-focus="nav.pomodoro" role="tab" aria-selected="false">
              <i className="fa-solid fa-stopwatch" aria-hidden="true"></i>
              <span>Pomodoro</span>
            </button>
            <button className="navItem" type="button" data-page="battle" data-focus="nav.battle" role="tab" aria-selected="false">
              <i className="fa-solid fa-crosshairs" aria-hidden="true"></i>
              <span>Battle</span>
            </button>
            <button className="navItem" type="button" data-page="guild" data-focus="nav.guild" role="tab" aria-selected="false">
              <i className="fa-solid fa-people-group" aria-hidden="true"></i>
              <span>Guild</span>
            </button>
            <button className="navItem" type="button" data-page="match" data-focus="nav.match" role="tab" aria-selected="false">
              <i className="fa-solid fa-trophy" aria-hidden="true"></i>
              <span>Match</span>
            </button>
          </div>
        </div>

        <div className="footerHUD">
          <div className="appver">
            <div className="userName">Studium v1.0.0</div>
          </div>
          <MusicPlayer tracks={tracks} />
          <ExternalNowPlaying />
          <div className="hud">
            <div className="hudBar" aria-label="Controls">
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
            <button
              className="drawerToggle headerAction"
              id="toggleSfxBtn"
              data-focus="drawer.sfx"
              type="button"
              aria-label="Toggle sound effects"
            >
              SFX: On
            </button>
            <button
              className="drawerToggle headerAction"
              id="backToLandingBtn"
              data-focus="drawer.landing"
              type="button"
              aria-label="Back to landing page"
            >
              Back to Landing
            </button>
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
        <video className="bg__video bg__video--active" id="bgVideoA" src="/bg/blue - dashboard.mp4" autoPlay muted loop playsInline preload="auto" />
        <video className="bg__video" id="bgVideoB" autoPlay muted loop playsInline preload="auto" />
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
