import { useCallback, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  format,
  parseISO,
  isSameDay,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameMonth,
  isAfter,
  isBefore,
  startOfToday,
  endOfToday,
  addDays,
} from "date-fns";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import LoadingSkeleton from "../components/shared/LoadingSkeleton";
import EmptyState from "../components/shared/EmptyState";
import { useAppointments } from "../hooks/useAppointments";
import { useDoctors } from "../hooks/useDoctors";
import { usePatients } from "../hooks/usePatients";
import { BADGE_VARIANTS, STATUS } from "../utils/constants";
import { formatDateTime } from "../utils/helpers";

const appointmentSchema = z.object({
  patient_id: z.coerce.number().min(1, "Patient is required"),
  doctor_id: z.coerce.number().min(1, "Doctor is required"),
  appointment_date: z.string().min(4, "Date is required"),
  time: z.string().min(3, "Time is required"),
  type: z.string().min(2, "Type is required"),
  status: z.string().min(2, "Status is required"),
});

/**
 * Appointments page with calendar and list views.
 */
export default function Appointments() {
  const [filters, setFilters] = useState({ date: "", doctor_id: "all", status: "all", search: "" });
  const [range, setRange] = useState("all");
  const [open, setOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const appointmentsQuery = useAppointments({
    page: 1,
    limit: 200,
    date: filters.date || undefined,
    status: filters.status === "all" ? "" : filters.status,
    doctor_id: filters.doctor_id === "all" ? "" : filters.doctor_id,
    search: filters.search || "",
  });
  const doctorsQuery = useDoctors({ page: 1, limit: 100 });
  const patientsQuery = usePatients({ page: 1, limit: 100 });

  const appointments = appointmentsQuery.data?.items || [];
  const doctors = doctorsQuery.data?.items || [];
  const patients = patientsQuery.data?.items || [];

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const filteredByRange = useMemo(() => {
    if (range === "all") return appointments;
    const today = startOfToday();
    const end = range === "today" ? endOfToday() : addDays(today, range === "week" ? 7 : 30);
    return appointments.filter((appointment) => {
      const date = parseISO(appointment?.appointment_date);
      return !isBefore(date, today) && !isAfter(date, end);
    });
  }, [appointments, range]);

  const appointmentsForDay = useMemo(() => {
    return filteredByRange.filter((appointment) =>
      isSameDay(parseISO(appointment?.appointment_date), selectedDay)
    );
  }, [filteredByRange, selectedDay]);

  const form = useForm({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patient_id: patients[0]?.id || 0,
      doctor_id: doctors[0]?.id || 0,
      appointment_date: format(new Date(), "yyyy-MM-dd"),
      time: "10:00",
      type: "Consultation",
      status: "Scheduled",
    },
  });

  const onSubmit = useCallback(async (values) => {
    const payload = {
      patient_id: values.patient_id,
      doctor_id: values.doctor_id,
      appointment_date: `${values.appointment_date} ${values.time}:00`,
      type: values.type,
      status: values.status,
      notes: "",
    };

    const conflict = appointments.some((appointment) =>
      appointment?.doctor_id === payload.doctor_id &&
      appointment?.appointment_date === payload.appointment_date
    );

    if (conflict) {
      toast.error("Appointment conflict detected. Choose another time.");
      return;
    }

    await appointmentsQuery.createAppointment(payload);
    setOpen(false);
    form.reset();
  }, [appointments, appointmentsQuery, form]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Appointments</h1>
          <p className="text-sm text-slate-500">Schedule and track patient appointments</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Book New Appointment</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Book New Appointment</DialogTitle>
            </DialogHeader>
            <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Patient</label>
                <Select
                  value={String(form.watch("patient_id") || "")}
                  onValueChange={(value) => form.setValue("patient_id", Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={String(patient.id)}>
                        {patient.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.patient_id && (
                  <span className="text-xs text-rose-600">{form.formState.errors.patient_id.message}</span>
                )}
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Doctor</label>
                <Select
                  value={String(form.watch("doctor_id") || "")}
                  onValueChange={(value) => form.setValue("doctor_id", Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={String(doctor.id)}>
                        {doctor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.doctor_id && (
                  <span className="text-xs text-rose-600">{form.formState.errors.doctor_id.message}</span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Date</label>
                  <Input type="date" {...form.register("appointment_date")} />
                  {form.formState.errors.appointment_date && (
                    <span className="text-xs text-rose-600">{form.formState.errors.appointment_date.message}</span>
                  )}
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Time</label>
                  <Input type="time" {...form.register("time")} />
                  {form.formState.errors.time && (
                    <span className="text-xs text-rose-600">{form.formState.errors.time.message}</span>
                  )}
                </div>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Appointment Type</label>
                <Input {...form.register("type")} placeholder="Consultation" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={form.watch("status")} onValueChange={(value) => form.setValue("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS.appointment.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="submit">Confirm Booking</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Tabs defaultValue="list">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <TabsList>
                <TabsTrigger value="list">List View</TabsTrigger>
                <TabsTrigger value="calendar">Calendar View</TabsTrigger>
              </TabsList>
              <div className="flex flex-wrap gap-2">
                <Input
                  type="date"
                  value={filters.date}
                  onChange={(event) => setFilters((prev) => ({ ...prev, date: event.target.value }))}
                />
                <Select value={filters.doctor_id} onValueChange={(value) => setFilters((prev) => ({ ...prev, doctor_id: value }))}>
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="Doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Doctors</SelectItem>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={String(doctor.id)}>
                        {doctor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filters.status} onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {STATUS.appointment.map((status) => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={range} onValueChange={setRange}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">Week</SelectItem>
                    <SelectItem value="month">Month</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Search patient or doctor"
                  value={filters.search}
                  onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
                />
              </div>
            </div>

            <TabsContent value="list">
              {appointmentsQuery.isLoading ? (
                <LoadingSkeleton rows={6} />
              ) : filteredByRange.length === 0 ? (
                <EmptyState title="No appointments" message="Try adjusting filters." />
              ) : (
                <div className="space-y-3">
                  {filteredByRange.map((appointment) => (
                    <Card key={appointment.id} className="transition hover:shadow-md">
                      <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm text-slate-500">
                            {formatDateTime(appointment?.appointment_date)}
                          </p>
                          <p className="text-base font-semibold text-slate-900">{appointment?.patient_name}</p>
                          <p className="text-sm text-slate-600">{appointment?.doctor_name} · {appointment?.type}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={BADGE_VARIANTS[appointment?.status] || "default"}>{appointment?.status}</Badge>
                          <Button variant="outline" size="sm">View</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="calendar">
              <Card>
                <CardContent className="grid gap-6 p-6 lg:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between">
                      <Button variant="outline" size="sm" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                        Prev
                      </Button>
                      <p className="text-sm font-medium text-slate-900">{format(currentMonth, "MMMM yyyy")}</p>
                      <Button variant="outline" size="sm" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                        Next
                      </Button>
                    </div>
                    <div className="mt-4 grid grid-cols-7 gap-2 text-center text-xs text-slate-500">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                        <div key={day}>{day}</div>
                      ))}
                    </div>
                    <div className="mt-2 grid grid-cols-7 gap-2">
                      {calendarDays.map((day) => {
                        const hasAppointment = filteredByRange.some((appointment) =>
                          isSameDay(parseISO(appointment?.appointment_date), day)
                        );
                        return (
                          <button
                            key={day.toISOString()}
                            onClick={() => setSelectedDay(day)}
                            className={`flex h-10 items-center justify-center rounded-md text-sm transition
                              ${isSameDay(day, selectedDay) ? "bg-sky-600 text-white" : "text-slate-700"}
                              ${!isSameMonth(day, currentMonth) ? "text-slate-300" : ""}
                              ${hasAppointment ? "border border-emerald-200" : "border border-transparent"}
                              hover:bg-slate-100`}
                          >
                            {format(day, "d")}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-slate-900">Appointments on {format(selectedDay, "PPP")}</p>
                    {appointmentsForDay.length === 0 ? (
                      <EmptyState title="No appointments" message="No appointments for this date." />
                    ) : (
                      appointmentsForDay.map((appointment) => (
                        <div key={appointment.id} className="rounded-lg border border-slate-200 p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-slate-900">{appointment?.patient_name}</p>
                              <p className="text-sm text-slate-600">{appointment?.doctor_name}</p>
                            </div>
                            <Badge variant={BADGE_VARIANTS[appointment?.status] || "default"}>{appointment?.status}</Badge>
                          </div>
                          <p className="mt-2 text-sm text-slate-500">
                            {format(parseISO(appointment?.appointment_date), "p")} · {appointment?.type}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Today Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {appointmentsQuery.isLoading ? (
              <LoadingSkeleton rows={3} />
            ) : (
              <>
                <div className="rounded-lg border border-slate-200 p-3">
                  <p className="text-sm text-slate-500">Total Appointments</p>
                  <p className="text-xl font-semibold text-slate-900">{appointments.length}</p>
                </div>
                <div className="rounded-lg border border-slate-200 p-3">
                  <p className="text-sm text-slate-500">Scheduled</p>
                  <p className="text-xl font-semibold text-slate-900">
                    {appointments.filter((appointment) => appointment?.status === "Scheduled").length}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 p-3">
                  <p className="text-sm text-slate-500">Completed</p>
                  <p className="text-xl font-semibold text-slate-900">
                    {appointments.filter((appointment) => appointment?.status === "Completed").length}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

Appointments.propTypes = {
  defaultRange: PropTypes.string,
};
