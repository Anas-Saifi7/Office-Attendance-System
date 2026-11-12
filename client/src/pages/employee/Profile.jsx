import { useAuth } from "../../context/AuthContext";
import Header from "../../components/Header";

export default function Profile() {
  const { user } = useAuth();

  const fields = [
    ["Full Name", user?.name],
    ["Email Address", user?.email],
    ["Role", user?.role],
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header title="My Profile" />

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-6">

          <div>
            <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">
              My Profile
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              View your employee account information.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="h-28 bg-linear-to-r from-blue-600 to-indigo-600 sm:h-36" />

            <div className="px-4 pb-6 sm:px-6 sm:pb-8">

              <div className="-mt-12 mb-5 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-blue-100 text-3xl font-bold text-blue-700 shadow-sm sm:h-24 sm:w-24 sm:text-4xl">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>

                <span className="w-fit rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  Active Account
                </span>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-800 sm:text-2xl">
                  {user?.name || "Employee"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Employee Account Information
                </p>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200">
                {fields.map(([label, value], index) => (
                  <div
                    key={label}
                    className={`grid grid-cols-1 gap-2 px-4 py-4 sm:grid-cols-3 sm:items-center sm:gap-4 sm:px-5 ${
                      index !== fields.length - 1
                        ? "border-b border-slate-200"
                        : ""
                    }`}
                  >
                    <p className="text-sm font-medium text-slate-500">
                      {label}
                    </p>

                    <p className="wrap-break-word text-sm font-semibold capitalize text-slate-800 sm:col-span-2">
                      {value || "-"}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-sm font-semibold text-blue-900">
                  Account Information
                </p>
                <p className="mt-1 text-xs leading-5 text-blue-700">
                  Your profile information is managed by your administrator.
                  Contact your admin if you need to update your account details.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
