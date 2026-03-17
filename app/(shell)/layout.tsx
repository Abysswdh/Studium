import RouteBridge from "../../components/route-bridge";
import ShellBackground from "../../components/shell-background";
import NotificationIsland from "../../components/notifications/notification-island";
import { redirect } from "next/navigation";
import { getCurrentUser } from "../../lib/auth/current-user";
import Script from "next/script";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function ShellLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (!user.onboardingCompletedAt) redirect("/onboarding");

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

          <div className="headerCenter" aria-label="Notifications">
            <NotificationIsland />
            <div className="qsHoldHost" id="qsHoldHost" hidden aria-hidden="true">
              <div className="qsHoldPill" id="qsHoldPill" style={{ ["--qs-hold-duration" as any]: "650ms" }}>
                <svg className="qsHoldRing" viewBox="0 0 360 64" preserveAspectRatio="none" aria-hidden="true">
                  <rect className="qsHoldRingPath" id="qsHoldRingPath" pathLength={100} x="2" y="2" width="356" height="60" rx="30" ry="30" />
                </svg>
                <span className="qsHoldKey" aria-hidden="true">
                  M
                </span>
                <div className="qsHoldText">
                  <div className="qsHoldTitle">Quick settings</div>
                  <div className="qsHoldSub">Hold to open</div>
                </div>
              </div>
            </div>
          </div>

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

          <div className="arenaDock" id="arenaDock" hidden aria-label="Arena controls">
            <div className="arenaDockLeft">
              <div className="arenaDockTitle">Arena</div>
              <div className="arenaDockMeta" id="arenaDockMeta">
                Ready
              </div>
            </div>

          <div className="arenaDockKeys" aria-label="Answer keys">
            <span className="arenaKey">A</span>
            <span className="arenaKey">B</span>
            <span className="arenaKey">C</span>
            <span className="arenaKey">D</span>
            <span className="arenaDockHint">or 1–4</span>
            <span className="arenaKey">H</span>
            <span className="arenaDockHint">hint</span>
          </div>

          <div className="arenaDockActions" aria-label="Arena actions">
            <button className="arenaDockBtn headerAction" id="arenaPauseBtn" type="button" aria-label="Pause match">
              Pause
            </button>
            <button className="arenaDockBtn headerAction" id="arenaMusicBtn" type="button" aria-label="Toggle music">
              Music
            </button>
            <button className="arenaDockBtn arenaDockBtnDanger headerAction" id="arenaSurrenderBtn" type="button" aria-label="Surrender match">
              Surrender
            </button>
            <a className="arenaDockBtn headerAction" id="arenaQuitBtn" href="/battle" aria-label="Exit arena">
              Exit
            </a>
          </div>
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

              <div className="hudGroup" aria-label="Quick settings">
                <div className="hudKeys" aria-hidden="true">
                  <span className="hudKey hudKey--hold" id="hudHoldM">
                    <svg className="hudHoldRing" viewBox="0 0 36 36" aria-hidden="true">
                      <circle className="hudHoldRingPath" pathLength={100} cx="18" cy="18" r="16" />
                    </svg>
                    <span className="hudKeyText" aria-hidden="true">
                      M
                    </span>
                  </span>
                </div>
                <div className="hudLabel">Hold quick settings</div>
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

      <section className="qsPanel qsProfilePanel" id="qsProfilePanel" hidden aria-hidden="true" role="dialog" aria-modal="true" aria-label="Profile panel">
        <div className="qsProfileTop">
          <div className="qsProfileTitle">Profile</div>
          <div className="qsProfileTopRight">
            <button className="qsProfileClose headerAction" id="qsProfileCloseBtn" type="button" aria-label="Close profile panel">
              <i className="fa-solid fa-xmark" aria-hidden="true"></i>
            </button>
          </div>
        </div>

        <div className="qsProfileHero" aria-label="Profile summary">
          <div className="qsProfileAvatar" aria-hidden="true">
            <img className="qsProfileAvatarImg" src={user.avatarUrl} alt="" />
          </div>
          <div className="qsProfileMeta">
            <div className="qsProfileName">{user.displayName}</div>
            <div className="qsProfileSub">
              {user.xp.toLocaleString()} XP | LVL {user.level}
            </div>
          </div>
        </div>

        <div className="qsProfileTabs" role="tablist" aria-label="Profile tabs">
          <button className="qsProfileTab headerAction" id="qsProfileTabStreak" type="button" role="tab" aria-selected="true" data-tab="streak">
            Streak
          </button>
          <button className="qsProfileTab headerAction" id="qsProfileTabRanking" type="button" role="tab" aria-selected="false" data-tab="ranking">
            Ranking
          </button>
          <button className="qsProfileTab headerAction" id="qsProfileTabFriends" type="button" role="tab" aria-selected="false" data-tab="friends">
            Friends
          </button>
        </div>

        <div className="qsProfileBody" aria-label="Profile content">
          <div className="qsProfilePane" data-pane="streak" aria-label="Streak tab">
            <div className="qsProfilePlaceholderTitle">Streak</div>
            <div className="qsProfilePlaceholderSub">Hook this to your streak data when ready.</div>
          </div>
          <div className="qsProfilePane" data-pane="ranking" hidden aria-hidden="true" aria-label="Ranking tab">
            <div className="qsProfilePlaceholderTitle">Ranking</div>
            <div className="qsProfilePlaceholderSub">Show leaderboard + current rank.</div>
          </div>
          <div className="qsProfilePane" data-pane="friends" hidden aria-hidden="true" aria-label="Friends tab">
            <div className="qsProfilePlaceholderTitle">Friends</div>
            <div className="qsProfilePlaceholderSub">Invite / manage friends here.</div>
          </div>
        </div>

        <div className="qsProfileFooter" aria-label="Profile actions">
          <button className="qsProfileFooterBtn qsProfileFooterBtn--primary headerAction" id="qsProfileEditBtn" type="button" aria-label="Edit profile">
            Edit Profile
          </button>
          <button className="qsProfileFooterBtn headerAction" id="qsProfileMoreBtn" type="button" aria-label="More options">
            More options
          </button>
        </div>
      </section>

      <section className="qsPanel" id="qsNotifPanel" hidden aria-hidden="true" role="dialog" aria-modal="true" aria-label="Notification panel">
        <div className="qsPanelTop">
          <div className="qsPanelTitle">Notification</div>
          <div className="qsPanelTopRight">
            <label className="qsMiniToggle" aria-label="Toggle notifications">
              <input id="qsNotifToggle" className="qsMiniToggleInput" type="checkbox" defaultChecked />
              <span className="qsMiniSwitch" aria-hidden="true" />
            </label>
            <button className="qsPanelClose headerAction" id="qsNotifCloseBtn" type="button" aria-label="Close notification panel">
              <i className="fa-solid fa-xmark" aria-hidden="true"></i>
            </button>
          </div>
        </div>

        <div className="qsPanelBody" aria-label="Notification content">
          <div className="qsPanelCard" aria-label="Notification settings card">
            <div className="qsPanelCardTitle">System notifications</div>
            <div className="qsPanelCardSub">Turn notifications on/off for quick settings.</div>
          </div>
        </div>

        <div className="qsPanelFooter" aria-label="Notification actions">
          <button className="qsPanelFooterBtn qsPanelFooterBtn--primary headerAction" id="qsNotifSettingsBtn" type="button" aria-label="Open notification settings">
            Open Settings
          </button>
        </div>
      </section>

      <section className="qsPanel" id="qsQuestPanel" hidden aria-hidden="true" role="dialog" aria-modal="true" aria-label="Quest panel">
        <div className="qsPanelTop">
          <div className="qsPanelTitle">Quest</div>
          <div className="qsPanelTopRight">
            <button className="qsPanelClose headerAction" id="qsQuestCloseBtn" type="button" aria-label="Close quest panel">
              <i className="fa-solid fa-xmark" aria-hidden="true"></i>
            </button>
          </div>
        </div>

        <div className="qsPanelBody" aria-label="Quest content">
          <div className="qsPanelCard" aria-label="Quest card">
            <div className="qsPanelCardTitle">Today&apos;s quests</div>
            <div className="qsPanelCardSub">Jump back into your quests and keep the streak going.</div>
          </div>
        </div>

        <div className="qsPanelFooter" aria-label="Quest actions">
          <button className="qsPanelFooterBtn qsPanelFooterBtn--primary headerAction" id="qsQuestOpenBtn" type="button" aria-label="Open quest page">
            Open Quest
          </button>
        </div>
      </section>

      <section className="qsPanel" id="qsBattlePanel" hidden aria-hidden="true" role="dialog" aria-modal="true" aria-label="Battle panel">
        <div className="qsPanelTop">
          <div className="qsPanelTitle">Battle</div>
          <div className="qsPanelTopRight">
            <button className="qsPanelClose headerAction" id="qsBattleCloseBtn" type="button" aria-label="Close battle panel">
              <i className="fa-solid fa-xmark" aria-hidden="true"></i>
            </button>
          </div>
        </div>

        <div className="qsPanelBody" aria-label="Battle content">
          <div className="qsPanelCard" aria-label="Battle card">
            <div className="qsPanelCardTitle">1v1 battle</div>
            <div className="qsPanelCardSub">Start a quick match and climb the leaderboard.</div>
          </div>
        </div>

        <div className="qsPanelFooter" aria-label="Battle actions">
          <button className="qsPanelFooterBtn qsPanelFooterBtn--primary headerAction" id="qsBattleOpenBtn" type="button" aria-label="Open battle page">
            Open Battle
          </button>
        </div>
      </section>

      <section className="qsPanel" id="qsNotesPanel" hidden aria-hidden="true" role="dialog" aria-modal="true" aria-label="Notes panel">
        <div className="qsPanelTop">
          <div className="qsPanelTitle">Notes</div>
          <div className="qsPanelTopRight">
            <button className="qsPanelClose headerAction" id="qsNotesCloseBtn" type="button" aria-label="Close notes panel">
              <i className="fa-solid fa-xmark" aria-hidden="true"></i>
            </button>
          </div>
        </div>

        <div className="qsPanelBody" aria-label="Notes content">
          <div className="qsPanelCard" aria-label="Notes card">
            <div className="qsPanelCardTitle">Quick capture</div>
            <div className="qsPanelCardSub">Open Notes to review, create, or hide notes.</div>
          </div>
        </div>

        <div className="qsPanelFooter" aria-label="Notes actions">
          <button className="qsPanelFooterBtn qsPanelFooterBtn--primary headerAction" id="qsNotesOpenBtn" type="button" aria-label="Open notes page">
            Open Notes
          </button>
        </div>
      </section>

      <div className="bg">
        <ShellBackground />
        <div className="bg__veil" aria-hidden="true"></div>
      </div>

      <div
        className="bootOverlay"
        id="bootOverlay"
        aria-hidden="true"
        style={{ background: "rgba(0,0,0,1)", position: "fixed", inset: 0, zIndex: 12000, pointerEvents: "none" }}
      >
        <div className="bootLogo" id="bootLogo">
          <div className="bootLogo__title">STUDIUM</div>
          <div className="bootLogo__tag">Study like a game, finish like a pro.</div>
        </div>
      </div>

      <Script src="/studium-client.js" strategy="afterInteractive" />
    </main>
  );
}
