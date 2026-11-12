import { useEffect, useState } from "react";
import api, { errMsg } from "../../api";

const empty = {
  name: "",
  email: "",
  password: "",
  department: "",
};

export default function Employees() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState(empty);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () => api.get("/admin/employees").then((r) => setList(r.data));

  useEffect(() => {
    load().catch((err) => setMsg(errMsg(err)));
  }, []);

  const add = async (e) => {
    e.preventDefault();
    setMsg("");
    setBusy(true);

    try {
      await api.post("/admin/employees", form);
      setForm(empty);
      await load();
      setMsg("Employee added successfully.");
    } catch (err) {
      setMsg(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (u) => {
    try {
      await api.put(`/admin/employees/${u._id}`, {
        isActive: !u.isActive,
      });
      await load();
    } catch (err) {
      setMsg(errMsg(err));
    }
  };

  const reset = async (u) => {
    const password = window.prompt(
      `New password for ${u.name} (min 6 characters)`,
    );

    if (!password) return;

    if (password.length < 6) {
      setMsg("Password must contain at least 6 characters.");
      return;
    }

    try {
      await api.put(`/admin/employees/${u._id}`, { password });
      setMsg(`Password reset successfully for ${u.name}.`);
    } catch (err) {
      setMsg(errMsg(err));
    }
  };

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      
      <form
        onSubmit={add}
        className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"
      >
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">Add Employee</h2>
          <p className="mt-1 text-sm text-gray-500">
            Create a new employee account.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <input
            placeholder="Full name"
            value={form.name}
            onChange={(e) => updateForm("name", e.target.value)}
            required
            className="rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <input
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={(e) => updateForm("email", e.target.value)}
            required
            className="rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <input
            type="password"
            placeholder="Temporary password"
            value={form.password}
            onChange={(e) => updateForm("password", e.target.value)}
            required
            minLength={6}
            className="rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <input
            placeholder="Department"
            value={form.department}
            onChange={(e) => updateForm("department", e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <button
          type="submit"
          disabled={busy}
          className="mt-5 w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 sm:w-auto"
        >
          {busy ? "Adding employee..." : "+ Add Employee"}
        </button>

        {msg && <p className="mt-4 text-sm text-blue-600">{msg}</p>}
      </form>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">All Employees</h2>

          <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
            {list.length} Employees
          </span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["Name", "Email", "Department", "Status", "Actions"].map(
                  (heading) => (
                    <th
                      key={heading}
                      className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-600"
                    >
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {list.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-4 font-medium text-gray-900">
                    {u.name}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-gray-600">
                    {u.email}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-gray-600">
                    {u.department || "-"}
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        u.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {u.isActive ? "Active" : "Deactivated"}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => toggle(u)}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100"
                      >
                        {u.isActive ? "Deactivate" : "Activate"}
                      </button>

                      <button
                        onClick={() => reset(u)}
                        className="rounded-lg border border-blue-200 px-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50"
                      >
                        Reset Password
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!list.length && (
                <tr>
                  <td
                    colSpan="5"
                    className="px-4 py-10 text-center text-gray-500"
                  >
                    No employees found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
