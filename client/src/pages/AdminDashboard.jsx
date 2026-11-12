import { useState } from "react";
import Header from "../components/Header";
import Overview from "./admin/Overview";
import Employees from "./admin/Employees";
import Records from "./admin/Records";
import OfficeSettings from "./admin/OfficeSettings";

import LeaveManagement from "./admin/LeaveManagement";
import AdminLeavePolicy from "./admin/AdminLeavePolicy";

const TABS = [
  ["overview", "Overview", Overview],
  ["employees", "Employees", Employees],
  ["records", "Records", Records],
  ["office", "Office settings", OfficeSettings],

["leaves", "Leave Management", LeaveManagement],
["leave-policy", "Leave Policy", AdminLeavePolicy]

];

export default function AdminDashboard() {
  const [tab, setTab] = useState("overview");

  const Active = TABS.find((t) => t[0] === tab)[2];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header title="Admin Dashboard" />

      <nav className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 sm:px-6">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto">
          {TABS.map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`whitespace-nowrap border-b-2 px-4 py-4 text-sm font-medium transition ${
                tab === key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-800"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </nav>

      <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        <Active />
      </main>
    </div>
  );
}
