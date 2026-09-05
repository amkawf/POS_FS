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
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <Users className="text-blue-600" size={24} />
            <span>Karyawan & Staff Bertugas</span>
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Daftar staff restoran dan kasir yang aktif pada shift berjalan.
          </p>
        </div>

        <Badge size="md" color="blue" variant="light">
          {employees.length} Staff Aktif
        </Badge>
      </div>

      {/* STAFF CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {employees.map((emp) => (
          <div
            key={emp.id}
            className={`rounded-xl border bg-white p-5 shadow-xs transition-all ${
              emp.isCurrentUser ? "border-blue-500 ring-2 ring-blue-500/10" : "border-slate-200"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                  <span>{emp.name}</span>
                  {emp.isCurrentUser && (
                    <Badge size="xs" color="blue">
                      Anda
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-slate-500 font-semibold mt-0.5">
                  ID: {emp.id}
                </div>
              </div>

              <Badge size="xs" color={emp.role === "CASHIER" ? "blue" : emp.role === "KITCHEN" ? "orange" : "teal"}>
                {emp.role}
              </Badge>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-slate-500">
                <Clock size={13} />
                <span>{emp.shift}</span>
              </div>
              <div className="flex items-center gap-1 text-emerald-600 font-bold">
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
