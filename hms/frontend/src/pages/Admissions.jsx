import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  UserPlus, 
  Search, 
  Filter, 
  Bed, 
  Calendar, 
  Clock,
  CheckCircle,
  AlertCircle,
  Edit,
  Trash2,
  LogOut
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
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
import { Textarea } from "../components/ui/textarea";
import LoadingSkeleton from "../components/shared/LoadingSkeleton";
import EmptyState from "../components/shared/EmptyState";
import ConfirmDialog from "../components/shared/ConfirmDialog";
import Pagination from "../components/shared/Pagination";
import useHospital from "../hooks/useHospital";
import usePatients from "../hooks/usePatients";
import useDoctors from "../hooks/useDoctors";

const admissionSchema = z.object({
  patient_id: z.coerce.number().min(1, "Patient required"),
  bed_id: z.coerce.number().min(1, "Bed required"),
  doctor_id: z.coerce.number().optional(),
  reason: z.string().min(2, "Reason required"),
  diagnosis: z.string().optional(),
  treatment_plan: z.string().optional(),
  status: z.string().default("Admitted"),
});

export default function Admissions() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmDischarge, setConfirmDischarge] = useState(null);

  const { 
    useAdmissions, 
    useBeds,
    createAdmission, 
    updateAdmission, 
    deleteAdmission,
    isCreatingAdmission, 
    isUpdatingAdmission 
  } = useHospital();

  const { data, isLoading, error, refetch } = useAdmissions({ 
    search,
    status: statusFilter === "all" ? undefined : statusFilter, 
    page, 
    limit: 20 
  });

  const { data: bedsData } = useBeds({ status: "Available", limit: 100 });
  const { data: patientsData } = usePatients({ page: 1, limit: 200 });
  const { data: doctorsData } = useDoctors({ page: 1, limit: 200 });

  const admissions = data?.items || [];
  const availableBeds = bedsData?.items || [];
  const patients = patientsData?.items || [];
  const doctors = doctorsData?.items || [];

  const form = useForm({
    resolver: zodResolver(admissionSchema),
    defaultValues: {
      patient_id: "",
      bed_id: "",
      doctor_id: "",
      reason: "",
      diagnosis: "",
      treatment_plan: "",
      status: "Admitted",
    },
  });

  const handleOpenChange = useCallback((value) => {
    setOpen(value);
    if (!value) {
      setEditing(null);
      form.reset();
    }
  }, [form]);

  const handleEdit = useCallback((admission) => {
    setEditing(admission);
    form.reset({
      patient_id: admission.patient_id || "",
      bed_id: admission.bed_id || "",
      doctor_id: admission.doctor_id || "",
      reason: admission.reason || "",
      diagnosis: admission.diagnosis || "",
      treatment_plan: admission.treatment_plan || "",
      status: admission.status || "Admitted",
    });
    setOpen(true);
  }, [form]);

  const handleSubmit = async (values) => {
    try {
      if (editing) {
        await updateAdmission({ id: editing.id, payload: values });
      } else {
        await createAdmission(values);
      }
      handleOpenChange(false);
    } catch (error) {
      console.error("Error saving admission:", error);
    }
  };

  const handleDelete = useCallback(async () => {
    if (!confirmDelete) return;
    await deleteAdmission(confirmDelete.id);
    setConfirmDelete(null);
  }, [confirmDelete, deleteAdmission]);

  const handleDischarge = useCallback(async () => {
    if (!confirmDischarge) return;
    await updateAdmission({ 
      id: confirmDischarge.id, 
      payload: { 
        status: "Discharged",
        discharge_date: new Date().toISOString()
      } 
    });
    setConfirmDischarge(null);
  }, [confirmDischarge, updateAdmission]);

  const getStatusBadge = (status) => {
    const colors = {
      Admitted: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
      Discharged: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      Transferred: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    };
    return colors[status] || "bg-slate-100 text-slate-700";
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Admitted": return <Clock className="h-4 w-4" />;
      case "Discharged": return <CheckCircle className="h-4 w-4" />;
      case "Transferred": return <AlertCircle className="h-4 w-4" />;
      default: return <Bed className="h-4 w-4" />;
    }
  };

  const stats = {
    total: admissions.length,
    admitted: admissions.filter(a => a.status === "Admitted").length,
    discharged: admissions.filter(a => a.status === "Discharged").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Admissions</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage patient admissions and discharges.</p>
        </div>
        <Button className="bg-sky-600 hover:bg-sky-700" onClick={() => setOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Admit Patient
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-sky-100 p-2">
                <Bed className="h-5 w-5 text-sky-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data?.pagination?.total || 0}</p>
                <p className="text-xs text-slate-500">Total Admissions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-emerald-100 p-2">
                <Clock className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.admitted}</p>
                <p className="text-xs text-slate-500">Currently Admitted</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-100 p-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.discharged}</p>
                <p className="text-xs text-slate-500">Discharged</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-amber-100 p-2">
                <Bed className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{availableBeds.length}</p>
                <p className="text-xs text-slate-500">Beds Available</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by patient name or admission code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 dark:bg-slate-800 dark:border-slate-700"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[180px] dark:bg-slate-800 dark:border-slate-700">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Admitted">Admitted</SelectItem>
            <SelectItem value="Discharged">Discharged</SelectItem>
            <SelectItem value="Transferred">Transferred</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <LoadingSkeleton rows={6} />
      ) : error ? (
        <EmptyState title="Admissions unavailable" description={error.message || "Unable to load admissions."} />
      ) : admissions.length === 0 ? (
        <EmptyState title="No admissions found" description="Admit patients to get started." />
      ) : (
        <div className="rounded-lg border bg-white dark:bg-slate-900 dark:border-slate-700">
          <Table>
            <TableHeader>
              <TableRow className="dark:border-slate-700">
                <TableHead className="dark:text-slate-300">Code</TableHead>
                <TableHead className="dark:text-slate-300">Patient</TableHead>
                <TableHead className="dark:text-slate-300">Bed</TableHead>
                <TableHead className="dark:text-slate-300">Doctor</TableHead>
                <TableHead className="dark:text-slate-300">Admission Date</TableHead>
                <TableHead className="dark:text-slate-300">Status</TableHead>
                <TableHead className="dark:text-slate-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="dark:border-slate-700">
              {admissions.map((admission) => (
                <TableRow key={admission.id} className="dark:border-slate-700">
                  <TableCell className="font-medium dark:text-white">{admission.admission_code}</TableCell>
                  <TableCell className="dark:text-slate-300">
                    <div>
                      <p className="font-medium">{admission.patient_name}</p>
                      {admission.reason && (
                        <p className="text-xs text-slate-500 truncate max-w-[200px]">{admission.reason}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="dark:text-slate-300">
                    {admission.bed_number ? (
                      <div className="flex items-center gap-2">
                        <Bed className="h-4 w-4" />
                        {admission.bed_number}
                      </div>
                    ) : "-"}
                  </TableCell>
                  <TableCell className="dark:text-slate-300">{admission.doctor_name || "-"}</TableCell>
                  <TableCell className="dark:text-slate-300">
                    {admission.admission_date ? new Date(admission.admission_date).toLocaleDateString() : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(admission.status)}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(admission.status)}
                        {admission.status}
                      </span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {admission.status === "Admitted" && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setConfirmDischarge(admission)}
                          className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                        >
                          <LogOut className="h-3 w-3 mr-1" />
                          Discharge
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => handleEdit(admission)}>Edit</Button>
                      <Button variant="destructive" size="sm" onClick={() => setConfirmDelete(admission)}>Delete</Button>
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
            <DialogTitle>{editing ? "Update Admission" : "Admit Patient"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium dark:text-slate-200">Patient *</label>
                <Select 
                  value={String(form.watch("patient_id") || "")} 
                  onValueChange={(v) => form.setValue("patient_id", Number(v))}
                >
                  <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700">
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={String(patient.id)}>
                        {patient.name} ({patient.patient_code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium dark:text-slate-200">Bed *</label>
                <Select 
                  value={String(form.watch("bed_id") || "")} 
                  onValueChange={(v) => form.setValue("bed_id", Number(v))}
                >
                  <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700">
                    <SelectValue placeholder="Select bed" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableBeds.map((bed) => (
                      <SelectItem key={bed.id} value={String(bed.id)}>
                        {bed.bed_number} - {bed.ward_type} ({bed.status})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium dark:text-slate-200">Attending Doctor</label>
                <Select 
                  value={String(form.watch("doctor_id") || "")} 
                  onValueChange={(v) => form.setValue("doctor_id", Number(v))}
                >
                  <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700">
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={String(doctor.id)}>
                        {doctor.name} ({doctor.specialization})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                    <SelectItem value="Admitted">Admitted</SelectItem>
                    <SelectItem value="Discharged">Discharged</SelectItem>
                    <SelectItem value="Transferred">Transferred</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium dark:text-slate-200">Reason for Admission *</label>
              <Textarea 
                {...form.register("reason")} 
                placeholder="Enter reason for admission..."
                rows={2}
                className="dark:bg-slate-800 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="text-sm font-medium dark:text-slate-200">Diagnosis</label>
              <Input 
                {...form.register("diagnosis")} 
                placeholder="Enter diagnosis..."
                className="dark:bg-slate-800 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="text-sm font-medium dark:text-slate-200">Treatment Plan</label>
              <Textarea 
                {...form.register("treatment_plan")} 
                placeholder="Enter treatment plan..."
                rows={2}
                className="dark:bg-slate-800 dark:border-slate-700"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
            <Button 
              className="bg-sky-600 hover:bg-sky-700" 
              onClick={form.handleSubmit(handleSubmit)} 
              disabled={isCreatingAdmission || isUpdatingAdmission}
            >
              {isCreatingAdmission || isUpdatingAdmission ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        onOpenChange={(v) => !v && setConfirmDelete(null)}
        title="Delete Admission?"
        description="This will remove the admission record."
        confirmText="Delete"
        onConfirm={handleDelete}
      />

      <ConfirmDialog
        open={Boolean(confirmDischarge)}
        onOpenChange={(v) => !v && setConfirmDischarge(null)}
        title="Discharge Patient?"
        description={`This will discharge ${confirmDischarge?.patient_name} and free up bed ${confirmDischarge?.bed_number}.`}
        confirmText="Discharge"
        onConfirm={handleDischarge}
      />
    </div>
  );
}
