import { Badge } from "@mantine/core"
import { Clock, UserCheck, Users } from "lucide-react"

export function EmployeesView() {
  const employees = [
    {
      id: "EMP-001",
      name: "Wildan F (Kasir Utama)",
      role: "CASHIER",
      shift: "Pagi (08:00 - 16:00)",
      status: "ACTIVE",
      isCurrentUser: true,
    },
    {
      id: "EMP-002",
      name: "Siti Rahma (Waitress)",
      role: "WAITER",
      shift: "Pagi (08:00 - 16:00)",
      status: "ACTIVE",
      isCurrentUser: false,
    },
    {
      id: "EMP-003",
      name: "Budi Santoso (Head Chef)",
      role: "KITCHEN",
      shift: "Pagi (08:00 - 16:00)",
      status: "ACTIVE",
      isCurrentUser: false,
    },
  ]

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-lg sm:text-xl font-extrabold tracking-tight text-slate-900">
            <Users className="text-blue-600" size={24} />
            <span>Karyawan & Staff Bertugas</span>
          </h1>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            Daftar staff restoran dan kasir yang aktif pada shift berjalan.
          </p>
        </div>

        <Badge size="md" color="blue" variant="light">
          {employees.length} Staff Aktif
        </Badge>
      </div>

      {/* STAFF CARDS */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {employees.map((emp) => (
          <div
            key={emp.id}
            className={`rounded-xl border bg-white p-4 sm:p-5 shadow-xs transition-all ${
              emp.isCurrentUser ? "border-blue-500 ring-2 ring-blue-500/10" : "border-slate-200"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-sm font-extrabold text-slate-900">
                  <span>{emp.name}</span>
                  {emp.isCurrentUser && (
                    <Badge size="xs" color="blue">
                      Anda
                    </Badge>
                  )}
                </div>
                <div className="mt-0.5 text-xs font-semibold text-slate-500">
                  ID: {emp.id}
                </div>
              </div>

              <Badge size="xs" color={emp.role === "CASHIER" ? "blue" : emp.role === "KITCHEN" ? "orange" : "teal"}>
                {emp.role}
              </Badge>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
              <div className="flex items-center gap-1 text-slate-500">
                <Clock size={13} />
                <span>{emp.shift}</span>
              </div>
              <div className="flex items-center gap-1 font-bold text-emerald-600">
                <UserCheck size={13} />
                <span>{emp.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

