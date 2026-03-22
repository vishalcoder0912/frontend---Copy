import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
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
import { patients } from "../data/patients";
import { doctors } from "../data/doctors";
import { appointments } from "../data/appointments";
import { billingRecords } from "../data/billing";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/table";
import { Skeleton } from "../components/ui/skeleton";

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

const statusVariant = {
  Scheduled: "info",
  Completed: "success",
  Cancelled: "danger",
};

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return {
        patients,
        doctors,
        appointments,
        billingRecords,
      };
    },
  });

  const totalRevenue = data
    ? data.billingRecords.reduce((sum, record) => sum + record.amount, 0)
    : 0;

  const recentAppointments = data ? data.appointments.slice(0, 6) : [];

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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total Patients", value: data?.patients.length ?? 0 },
          { label: "Doctors", value: data?.doctors.length ?? 0 },
          { label: "Appointments", value: data?.appointments.length ?? 0 },
          { label: "Revenue", value: `?${totalRevenue.toLocaleString("en-IN")}` },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardTitle>{stat.label}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Patient Growth</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyPatients}>
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
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
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
                    <TableCell>{appointment.patient}</TableCell>
                    <TableCell>{appointment.doctor}</TableCell>
                    <TableCell>{appointment.date} · {appointment.time}</TableCell>
                    <TableCell>{appointment.type}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[appointment.status]}>{appointment.status}</Badge>
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
