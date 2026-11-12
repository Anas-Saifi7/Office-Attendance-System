import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/employee", label: "Dashboard", end: true },
  { to: "/employee/history", label: "Attendance History" },
  { to: "/employee/profile", label: "My Profile" },
  { to: "/employee/password", label: "Change Password" },
];

export default function EmployeeLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-slate-900 text-white md:flex">
        <div className="border-b border-slate-700 p-6">
          <h1 className="text-xl font-bold">Office Attendance</h1>
          <p className="mt-1 text-sm text-slate-400">Employee Portal</p>
        </div>

        <nav className="flex-1 space-y-2 p-4">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `block rounded-lg px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-700 p-4">
          <p className="truncate text-sm font-medium">{user?.name}</p>
          <p className="text-xs text-slate-400">{user?.email}</p>

          <button
            onClick={logout}
            className="mt-4 w-full rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400 hover:bg-red-500/20"
          >
            Logout
          </button>
        </div>
      </aside>

      <div className="md:pl-64">
        <header className="sticky top-0 z-10 border-b bg-white px-5 py-4 shadow-sm">
          <h2 className="font-semibold text-slate-800">
            Welcome, {user?.name}
          </h2>
          <p className="text-sm text-slate-500">Employee Attendance Portal</p>
        </header>

        <nav className="flex gap-2 overflow-x-auto border-b bg-white p-3 md:hidden">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-lg px-3 py-2 text-sm ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-700"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <main className="mx-auto max-w-7xl p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
