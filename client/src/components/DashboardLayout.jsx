import {
  Link,
  NavLink,
  Outlet,
  useLocation,
} from "react-router";
import AccountControls from "./AccountControls.jsx";
import { useAuth } from "../context/AuthContext.js";
import useMessagePolling from "../hooks/useMessagePolling.js";
import { getConversations } from "../services/messageService.js";

const navigation = [
  { label: "Overview", path: "/" },
  { label: "Discover Talent", path: "/talent" },
  {
    label: "My Projects",
    path: "/projects",
    roles: ["client"],
  },
  {
    label: "My Profile",
    path: "/my-profile",
    roles: ["freelancer"],
  },
  {
    label: "Messages",
    path: "/messages",
    roles: ["client", "freelancer"],
  },
  { label: "Saved Talent", path: "/saved" },
];

function UnreadMessagesBadge() {
  const {
    data,
    error,
  } = useMessagePolling(getConversations, true, true);

  if (error) {
    return (
      <span
        title="Unread count is temporarily unavailable"
        aria-label="Unread count is temporarily unavailable"
        className="text-xs text-amber-700"
      >
        !
      </span>
    );
  }

  const count = (data ?? []).reduce(
    (total, conversation) =>
      total + conversation.unreadCount,
    0
  );

  if (count === 0) return null;

  return (
    <span
      aria-label={`${count} unread messages`}
      className="rounded-full bg-violet-600 px-2 py-0.5 text-xs font-semibold text-white"
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

function DashboardLayout() {
  const location = useLocation();
  const { user } = useAuth();

  const visibleNavigation = navigation.filter(
    (item) =>
      !item.roles || item.roles.includes(user?.role)
  );

  const currentPage =
    location.pathname === "/projects/new"
      ? "New project"
      : location.pathname.startsWith("/talent/")
        ? "Freelancer profile"
        : navigation.find(
            (item) => item.path === location.pathname
          )?.label ?? "Page not found";

  return (
    <div className="min-h-screen lg:flex">
      <aside className="border-b border-slate-200 bg-white lg:fixed lg:inset-y-0 lg:w-64 lg:overflow-y-auto lg:border-r lg:border-b-0">
        <div className="p-6">
          <Link
            to="/"
            className="text-2xl font-bold tracking-tight"
          >
            skillbridge
            <span className="text-violet-600">.</span>
          </Link>

          <p className="mt-8 text-xs font-semibold tracking-widest text-slate-400">
            YOUR WORKSPACE
          </p>

          <nav
            aria-label="Main navigation"
            className="mt-4 space-y-2"
          >
            {visibleNavigation.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  `flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-violet-50 text-violet-700"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`
                }
              >
                <span>{item.label}</span>

                {item.path === "/messages" && user && (
                  <UnreadMessagesBadge key={user.id} />
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="mx-6 mt-8 border-t border-slate-100 py-6">
          <p className="text-sm font-semibold">
            SkillBridge
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Your project workspace
          </p>
        </div>
      </aside>

      <div className="min-w-0 flex-1 lg:ml-64">
        <header className="flex min-h-20 flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-6 py-4 lg:px-10">
          <p className="text-sm text-slate-500">
            Workspace /{" "}
            <span className="text-slate-900">
              {currentPage}
            </span>
          </p>

          <AccountControls />
        </header>

        <main className="mx-auto max-w-7xl p-6 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;