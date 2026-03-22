import PropTypes from "prop-types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Download, FileText, Clock } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/table";
import LoadingSkeleton from "../components/shared/LoadingSkeleton";
import EmptyState from "../components/shared/EmptyState";
import { usePatients } from "../hooks/usePatients";
import { useDoctors } from "../hooks/useDoctors";
import { useAppointments } from "../hooks/useAppointments";
import { useBilling } from "../hooks/useBilling";
import { BADGE_VARIANTS } from "../utils/constants";
import { downloadCSV, formatCurrency, formatDateTime } from "../utils/helpers";

const monthlyPatients = [
  { month: "Jan", value: 120 },
  { month: "Feb", value: 180 },
  { month: "Mar", value: 240 },
  { month: "Apr", value: 200 },
  { month: "May", value: 260 },
  { month: "Jun", value: 300 },
];

const weeklyAppointments = [
  { day: "Mon", value: 18 },
  { day: "Tue", value: 24 },
  { day: "Wed", value: 20 },
  { day: "Thu", value: 28 },
  { day: "Fri", value: 32 },
  { day: "Sat", value: 14 },
];

/**
 * Dashboard overview page.
 */
export default function Dashboard() {
  const patients = usePatients({ page: 1, limit: 1 });
  const doctors = useDoctors({ page: 1, limit: 1 });
  const appointments = useAppointments({ page: 1, limit: 6 });
  const billing = useBilling({ page: 1, limit: 100 });

  const [range, setRange] = useState("6m");
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const totalRevenue = useMemo(
    () => billing.data?.items?.reduce((sum, record) => sum + Number(record?.amount || 0), 0) || 0,
    [billing.data?.items]
  );

  const recentAppointments = appointments.data?.items || [];

  const isLoading =
    patients.isLoading ||
    doctors.isLoading ||
    appointments.isLoading ||
    billing.isLoading;

  const chartData = useMemo(() => {
    if (range === "3m") return monthlyPatients.slice(-3);
    if (range === "6m") return monthlyPatients;
    return [...monthlyPatients, { month: "Jul", value: 310 }, { month: "Aug", value: 330 }];
  }, [range]);

  const handleExport = useCallback(() => {
    downloadCSV("appointments.csv", recentAppointments.map((item) => ({
      patient: item?.patient_name,
      doctor: item?.doctor_name,
      date: item?.appointment_date,
      status: item?.status,
    })));
  }, [recentAppointments]);

  const handleExportPdf = useCallback(() => {
    window.print();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">Overview of hospital operations</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link to="/patients">Add Patient</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link to="/appointments">Book Appointment</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/billing">Generate Invoice</Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Clock className="h-4 w-4" />
          <span>{now.toLocaleString()}</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPdf}>
            <FileText className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total Patients", value: patients.data?.total ?? 0 },
          { label: "Doctors", value: doctors.data?.total ?? 0 },
          { label: "Appointments", value: appointments.data?.total ?? 0 },
          { label: "Revenue", value: formatCurrency(totalRevenue) },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardTitle>{stat.label}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <LoadingSkeleton rows={1} />
              ) : (
                <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Monthly Patient Growth</CardTitle>
            <SelectRange value={range} onChange={setRange} />
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appointments per Week</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyAppointments}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingSkeleton rows={5} />
          ) : recentAppointments.length === 0 ? (
            <EmptyState title="No appointments" message="Create a new appointment to see data." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentAppointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>{appointment?.patient_name}</TableCell>
                    <TableCell>{appointment?.doctor_name}</TableCell>
                    <TableCell>{formatDateTime(appointment?.appointment_date)}</TableCell>
                    <TableCell>{appointment?.type}</TableCell>
                    <TableCell>
                      <Badge variant={BADGE_VARIANTS[appointment?.status] || "default"}>
                        {appointment?.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SelectRange({ value, onChange }) {
  return (
    <select
      className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      <option value="3m">Last 3 months</option>
      <option value="6m">Last 6 months</option>
      <option value="12m">Last 12 months</option>
    </select>
  );
}

SelectRange.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};
