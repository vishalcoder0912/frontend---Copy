import { useCallback, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import LoadingSkeleton from "../components/shared/LoadingSkeleton";
import EmptyState from "../components/shared/EmptyState";
import { useBilling } from "../hooks/useBilling";
import { usePatients } from "../hooks/usePatients";
import { useDoctors } from "../hooks/useDoctors";
import { useAppointments } from "../hooks/useAppointments";
import { BADGE_VARIANTS, STATUS } from "../utils/constants";
import { formatCurrency, formatDate, downloadCSV } from "../utils/helpers";

/**
 * Billing management page.
 */
export default function Billing() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [open, setOpen] = useState(false);

  const { data, isLoading, createBilling } = useBilling({
    page: 1,
    limit: 200,
    search,
    status: statusFilter === "all" ? "" : statusFilter,
  });

  const patientsQuery = usePatients({ page: 1, limit: 100 });
  const doctorsQuery = useDoctors({ page: 1, limit: 100 });
  const appointmentsQuery = useAppointments({ page: 1, limit: 100 });

  const records = data?.items || [];

  const recordsWithStatus = useMemo(() => {
    const today = new Date();
    return records.map((record) => {
      const due = record?.due_date ? new Date(record.due_date) : null;
      const overdue = record?.status === "Pending" && due && due < today;
      return { ...record, displayStatus: overdue ? "Overdue" : record?.status };
    });
  }, [records]);

  const totals = useMemo(() => {
    const totalRevenue = recordsWithStatus.reduce((sum, record) => sum + Number(record?.amount || 0), 0);
    const pendingAmount = recordsWithStatus.filter((record) => record?.displayStatus === "Pending").reduce((sum, record) => sum + Number(record?.amount || 0), 0);
    const overdueAmount = recordsWithStatus.filter((record) => record?.displayStatus === "Overdue").reduce((sum, record) => sum + Number(record?.amount || 0), 0);
    return { totalRevenue, pendingAmount, overdueAmount };
  }, [recordsWithStatus]);

  const handlePrint = useCallback((record) => {
    const win = window.open("", "print");
    if (!win) return;
    win.document.write(`
      <html><head><title>Invoice</title></head>
      <body>
        <h1>Invoice ${record?.id}</h1>
        <p>Patient: ${record?.patient_name}</p>
        <p>Doctor: ${record?.doctor_name}</p>
        <p>Amount: ${formatCurrency(record?.amount)}</p>
        <p>Status: ${record?.displayStatus}</p>
        <p>Date: ${formatDate(record?.invoice_date)}</p>
      </body></html>
    `);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  }, []);

  const handleExport = useCallback(() => {
    downloadCSV("billing.csv", recordsWithStatus.map((record) => ({
      id: record.id,
      patient: record.patient_name,
      doctor: record.doctor_name,
      amount: record.amount,
      status: record.displayStatus,
    })));
  }, [recordsWithStatus]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Billing</h1>
          <p className="text-sm text-slate-500">Track invoices and payment status</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Generate Invoice</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate Invoice</DialogTitle>
              </DialogHeader>
              <InvoiceForm
                patients={patientsQuery.data?.items || []}
                doctors={doctorsQuery.data?.items || []}
                appointments={appointmentsQuery.data?.items || []}
                onSubmit={async (payload) => {
                  await createBilling(payload);
                  setOpen(false);
                }}
              />
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={handleExport}>Export CSV</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-slate-900">{formatCurrency(totals.totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-amber-600">{formatCurrency(totals.pendingAmount)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-rose-600">{formatCurrency(totals.overdueAmount)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Input
          className="max-w-md"
          placeholder="Search by patient or doctor"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="max-w-xs">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {STATUS.billing.map((status) => (
              <SelectItem key={status} value={status}>{status}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        {isLoading ? (
          <div className="p-6">
            <LoadingSkeleton rows={6} />
          </div>
        ) : recordsWithStatus.length === 0 ? (
          <div className="p-6">
            <EmptyState title="No billing records" message="Generate a new invoice to get started." />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recordsWithStatus.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium text-slate-900">B-{record.id}</TableCell>
                  <TableCell>{record?.patient_name}</TableCell>
                  <TableCell>{record?.doctor_name}</TableCell>
                  <TableCell>{formatDate(record?.invoice_date)}</TableCell>
                  <TableCell>{formatCurrency(record?.amount)}</TableCell>
                  <TableCell>
                    <Badge variant={BADGE_VARIANTS[record?.displayStatus] || "default"}>{record?.displayStatus}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => handlePrint(record)}>
                      Print
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

function InvoiceForm({ patients, doctors, appointments, onSubmit }) {
  const [form, setForm] = useState({
    patient_id: patients[0]?.id || "",
    doctor_id: doctors[0]?.id || "",
    appointment_id: "",
    amount: "",
    status: "Pending",
    due_date: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    const next = {};
    if (!form.patient_id) next.patient_id = "Patient is required";
    if (!form.doctor_id) next.doctor_id = "Doctor is required";
    if (!form.amount || Number(form.amount) <= 0) next.amount = "Amount is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  return (
    <form className="grid gap-4" onSubmit={(event) => {
      event.preventDefault();
      if (!validate()) return;
      onSubmit({
        patient_id: Number(form.patient_id),
        doctor_id: Number(form.doctor_id),
        appointment_id: form.appointment_id ? Number(form.appointment_id) : null,
        amount: Number(form.amount),
        status: form.status,
        due_date: form.due_date || null,
      });
    }}>
      <div className="grid gap-2">
        <label className="text-sm font-medium">Patient</label>
        <Select value={String(form.patient_id)} onValueChange={(value) => handleChange("patient_id", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select patient" />
          </SelectTrigger>
          <SelectContent>
            {patients.map((patient) => (
              <SelectItem key={patient.id} value={String(patient.id)}>{patient.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.patient_id && <span className="text-xs text-rose-600">{errors.patient_id}</span>}
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium">Doctor</label>
        <Select value={String(form.doctor_id)} onValueChange={(value) => handleChange("doctor_id", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select doctor" />
          </SelectTrigger>
          <SelectContent>
            {doctors.map((doctor) => (
              <SelectItem key={doctor.id} value={String(doctor.id)}>{doctor.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.doctor_id && <span className="text-xs text-rose-600">{errors.doctor_id}</span>}
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium">Appointment (optional)</label>
        <Select value={String(form.appointment_id || "")} onValueChange={(value) => handleChange("appointment_id", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select appointment" />
          </SelectTrigger>
          <SelectContent>
            {appointments.map((appointment) => (
              <SelectItem key={appointment.id} value={String(appointment.id)}>
                {appointment.patient_name} · {formatDate(appointment.appointment_date)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium">Amount</label>
        <Input type="number" value={form.amount} onChange={(event) => handleChange("amount", event.target.value)} />
        {errors.amount && <span className="text-xs text-rose-600">{errors.amount}</span>}
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium">Due Date</label>
        <Input type="date" value={form.due_date} onChange={(event) => handleChange("due_date", event.target.value)} />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium">Status</label>
        <Select value={form.status} onValueChange={(value) => handleChange("status", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS.billing.map((status) => (
              <SelectItem key={status} value={status}>{status}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <Button type="submit">Create Invoice</Button>
      </DialogFooter>
    </form>
  );
}

InvoiceForm.propTypes = {
  patients: PropTypes.arrayOf(PropTypes.object),
  doctors: PropTypes.arrayOf(PropTypes.object),
  appointments: PropTypes.arrayOf(PropTypes.object),
  onSubmit: PropTypes.func.isRequired,
};

Billing.propTypes = {
  initialStatus: PropTypes.string,
};
