import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header({ title }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const links = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Attendance History", path: "/attendance-history" },
    { label: "My Profile", path: "/profile" },
    { label: "Change Password", path: "/change-password" },
    { label: "Apply Leave", path: "/apply-leave" },
    { label: "My Leaves", path: "/my-leaves" },

  ];

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between px-4 py-4 sm:px-6">
        <div>
          <h1 className="text-lg font-bold text-gray-900 sm:text-xl">
            {title}
          </h1>
          <p className="text-sm text-gray-500">{user?.name}</p>
        </div>

        <button
          onClick={logout}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
        >
          Log out
        </button>
      </div>

      {user?.role === "employee" && (
        <nav className="flex gap-2 overflow-x-auto px-4 pb-3 sm:px-6">
          {links.map((link) => {
            const active = location.pathname === link.path;

            return (
              <Link
                key={link.path}
                to={link.path}
                className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
