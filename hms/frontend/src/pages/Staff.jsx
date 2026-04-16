import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  UserPlus, 
  Users, 
  Shield, 
  Mail, 
  Phone, 
  Calendar, 
  Building2,
  Search,
  Filter,
  UserCheck,
  Clock,
  DollarSign
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import LoadingSkeleton from "../components/shared/LoadingSkeleton";
import EmptyState from "../components/shared/EmptyState";
import ConfirmDialog from "../components/shared/ConfirmDialog";
import Pagination from "../components/shared/Pagination";
import useStaff from "../hooks/useStaff";
import useDepartments from "../hooks/useDepartments";
import useUsers from "../hooks/useUsers";

const staffSchema = z.object({
  user_id: z.coerce.number().min(1, "User is required"),
  department_id: z.coerce.number().optional(),
  position: z.string().optional(),
  salary: z.coerce.number().optional(),
  join_date: z.string().optional(),
  phone: z.string().optional(),
  status: z.string().default("Active"),
});

const POSITIONS = [
  "Administrator",
  "Staff Nurse",
  "Front Desk Executive",
  "Chief Pharmacist",
  "Lab Technician",
  "Support Staff",
  "Emergency Coordinator",
  "HR Manager",
  "Accountant",
  "IT Support",
];

export default function Staff() {
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [positionFilter, setPositionFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const { 
    data, 
    isLoading, 
    error, 
    createStaff, 
    updateStaff, 
    deleteStaff, 
    isCreating, 
    isUpdating 
  } = useStaff({
    search,
    department_id: departmentFilter === "all" ? "" : departmentFilter,
    status: statusFilter === "all" ? "" : statusFilter,
    position: positionFilter === "all" ? "" : positionFilter,
    page,
    limit: 20,
  });

  const { data: deptData } = useDepartments({ limit: 100 });
  const { data: usersData } = useUsers({ limit: 200 });

  const staff = useMemo(() => data?.items || [], [data?.items]);
  const departments = deptData?.items || [];
  const users = usersData?.items || [];

  const stats = useMemo(() => {
    const total = staff.length;
    const active = staff.filter(s => s.status === "Active").length;
    const inactive = staff.filter(s => s.status === "Inactive").length;
    const departments = new Set(staff.filter(s => s.department_id).map(s => s.department_id)).size;
    
    const byDepartment = {};
    staff.forEach(s => {
      const dept = s.department_name || "Unassigned";
      byDepartment[dept] = (byDepartment[dept] || 0) + 1;
    });

    return { total, active, inactive, departments, byDepartment };
  }, [staff]);

  const form = useForm({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      user_id: "",
      department_id: "",
      position: "",
      salary: 0,
      join_date: "",
      phone: "",
      status: "Active",
    },
  });

  const handleOpenChange = useCallback((value) => {
    setOpen(value);
    if (!value) {
      setEditing(null);
      form.reset();
    }
  }, [form]);

  const handleEdit = useCallback((member) => {
    setEditing(member);
    form.reset({
      user_id: member.user_id || "",
      department_id: member.department_id || "",
      position: member.position || "",
      salary: member.salary || 0,
      join_date: member.join_date ? member.join_date.split("T")[0] : "",
      phone: member.phone || "",
      status: member.status || "Active",
    });
    setOpen(true);
  }, [form]);

  const handleSubmit = async (values) => {
    try {
      if (editing) {
        await updateStaff({ id: editing.id, payload: values });
      } else {
        await createStaff(values);
      }
      handleOpenChange(false);
    } catch (err) {
      console.error("Error saving staff:", err);
    }
  };

  const handleDelete = useCallback(async () => {
    if (!confirmDelete) return;
    await deleteStaff(confirmDelete.id);
    setConfirmDelete(null);
  }, [confirmDelete, deleteStaff]);

  const getStatusBadge = (status) => {
    const colors = {
      Active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
      Inactive: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400",
      "On Leave": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    };
    return colors[status] || colors.Active;
  };

  const getPositionIcon = (position) => {
    if (position?.toLowerCase().includes("nurse")) return "text-rose-500";
    if (position?.toLowerCase().includes("pharma")) return "text-green-500";
    if (position?.toLowerCase().includes("lab")) return "text-purple-500";
    if (position?.toLowerCase().includes("front")) return "text-blue-500";
    return "text-slate-500";
  };

  const formatSalary = (salary) => {
    if (!salary) return "-";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(salary);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Staff Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage hospital staff, employees, and their assignments.</p>
        </div>
        <Button className="bg-sky-600 hover:bg-sky-700" onClick={() => setOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Staff
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-sky-50 to-white dark:from-sky-900/20 dark:to-slate-900">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-sky-100 p-2.5 dark:bg-sky-900/50">
                <Users className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{data?.pagination?.total || stats.total}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Total Staff</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-900/20 dark:to-slate-900">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-emerald-100 p-2.5 dark:bg-emerald-900/50">
                <UserCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.active}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-white dark:from-amber-900/20 dark:to-slate-900">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-amber-100 p-2.5 dark:bg-amber-900/50">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.inactive}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Inactive</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-slate-900">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-purple-100 p-2.5 dark:bg-purple-900/50">
                <Building2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.departments}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Departments</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by name, employee code, or position..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
          />
        </div>
        <Select value={departmentFilter} onValueChange={(v) => { setDepartmentFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[180px] dark:bg-slate-800 dark:border-slate-700">
            <Building2 className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={String(dept.id)}>{dept.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={positionFilter} onValueChange={(v) => { setPositionFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[180px] dark:bg-slate-800 dark:border-slate-700">
            <Shield className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Position" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Positions</SelectItem>
            {POSITIONS.map((pos) => (
              <SelectItem key={pos} value={pos}>{pos}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[140px] dark:bg-slate-800 dark:border-slate-700">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <LoadingSkeleton rows={6} />
      ) : error ? (
        <EmptyState title="Staff unavailable" description={error.message || "Unable to load staff."} />
      ) : staff.length === 0 ? (
        <EmptyState title="No staff found" description="Add staff members to get started." />
      ) : (
        <div className="rounded-lg border bg-white dark:bg-slate-900 dark:border-slate-700 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <TableHead className="dark:text-slate-300">Employee</TableHead>
                <TableHead className="dark:text-slate-300">Code</TableHead>
                <TableHead className="dark:text-slate-300">Department</TableHead>
                <TableHead className="dark:text-slate-300">Position</TableHead>
                <TableHead className="dark:text-slate-300">Salary</TableHead>
                <TableHead className="dark:text-slate-300">Join Date</TableHead>
                <TableHead className="dark:text-slate-300">Status</TableHead>
                <TableHead className="dark:text-slate-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="dark:border-slate-700">
              {staff.map((member) => (
                <TableRow key={member.id} className="dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-100 to-sky-200 text-sky-700 dark:from-sky-900 dark:to-sky-800 dark:text-sky-300 font-semibold">
                        {(member.user_name || "S").slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium dark:text-white">{member.user_name || "Unknown"}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {member.user_email || "No email"}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="dark:text-slate-300 font-mono text-sm">
                    <Badge variant="outline" className="font-mono">{member.employee_code}</Badge>
                  </TableCell>
                  <TableCell className="dark:text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-slate-400" />
                      {member.department_name || <span className="text-slate-400 italic">Unassigned</span>}
                    </div>
                  </TableCell>
                  <TableCell className="dark:text-slate-300">
                    <Badge variant="outline" className={`${getPositionIcon(member.position)} border-current`}>
                      {member.position || "-"}
                    </Badge>
                  </TableCell>
                  <TableCell className="dark:text-slate-300">
                    <span className="font-medium">{formatSalary(member.salary)}</span>
                  </TableCell>
                  <TableCell className="dark:text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      {member.join_date ? new Date(member.join_date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                      }) : "-"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(member.status)}>
                      {member.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(member)}>Edit</Button>
                      <Button variant="destructive" size="sm" onClick={() => setConfirmDelete(member)}>Delete</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {data?.pagination && (
        <Pagination page={page} totalPages={data.pagination.totalPages} onPageChange={setPage} />
      )}

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Staff Member" : "Add New Staff Member"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div>
              <label className="text-sm font-medium dark:text-slate-200">User Account *</label>
              <Select 
                value={String(form.watch("user_id") || "")} 
                onValueChange={(v) => form.setValue("user_id", Number(v))}
                disabled={!!editing}
              >
                <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700">
                  <SelectValue placeholder="Select user account" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={String(user.id)}>
                      {user.name} ({user.email}) - {user.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium dark:text-slate-200">Department</label>
                <Select 
                  value={form.watch("department_id") ? String(form.watch("department_id")) : "none"} 
                  onValueChange={(v) => form.setValue("department_id", v === "none" ? null : Number(v))}
                >
                  <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={String(dept.id)}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium dark:text-slate-200">Position</label>
                <Select 
                  value={form.watch("position") || "none"} 
                  onValueChange={(v) => form.setValue("position", v === "none" ? "" : v)}
                >
                  <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700">
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {POSITIONS.map((pos) => (
                      <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium dark:text-slate-200">Salary (Monthly)</label>
                <Input 
                  type="number" 
                  {...form.register("salary")} 
                  placeholder="Enter salary"
                  className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium dark:text-slate-200">Phone</label>
                <Input 
                  {...form.register("phone")} 
                  placeholder="+91 XXXXXXXXXX"
                  className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium dark:text-slate-200">Join Date</label>
                <Input 
                  type="date" 
                  {...form.register("join_date")} 
                  className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium dark:text-slate-200">Status</label>
                <Select 
                  value={form.watch("status")} 
                  onValueChange={(v) => form.setValue("status", v)}
                >
                  <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
            <Button 
              className="bg-sky-600 hover:bg-sky-700" 
              onClick={form.handleSubmit(handleSubmit)} 
              disabled={isCreating || isUpdating}
            >
              {isCreating || isUpdating ? "Saving..." : editing ? "Update Staff" : "Add Staff"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        onOpenChange={(v) => !v && setConfirmDelete(null)}
        title="Delete Staff Member?"
        description={`This will remove ${confirmDelete?.user_name || "this staff member"} from the system. This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDelete}
      />
    </div>
  );
}
