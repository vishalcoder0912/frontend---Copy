import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
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
} from "date-fns";
import { appointments as appointmentSeed } from "../data/appointments";
import { doctors } from "../data/doctors";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { Skeleton } from "../components/ui/skeleton";

const appointmentSchema = z.object({
  patient: z.string().min(2, "Patient name is required"),
  doctor: z.string().min(2, "Doctor is required"),
  date: z.string().min(4, "Date is required"),
  time: z.string().min(3, "Time is required"),
  type: z.string().min(2, "Type is required"),
  status: z.string().min(2, "Status is required"),
});

const statusVariant = {
  Scheduled: "info",
  Completed: "success",
  Cancelled: "danger",
};

export default function Appointments() {
  const { data, isLoading } = useQuery({
    queryKey: ["appointments"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return appointmentSeed;
    },
  });

  const [appointments, setAppointments] = useState(appointmentSeed);
  const [filters, setFilters] = useState({ date: "", doctor: "all", status: "all" });
  const [open, setOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const matchesDate = !filters.date || appointment.date === filters.date;
      const matchesDoctor = filters.doctor === "all" || appointment.doctor === filters.doctor;
      const matchesStatus = filters.status === "all" || appointment.status === filters.status;
      return matchesDate && matchesDoctor && matchesStatus;
    });
  }, [appointments, filters]);

  const appointmentsForDay = useMemo(() => {
    return appointments.filter((appointment) =>
      isSameDay(parseISO(appointment.date), selectedDay)
    );
  }, [appointments, selectedDay]);

  const form = useForm({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patient: "",
      doctor: doctors[0]?.name || "",
      date: format(new Date(), "yyyy-MM-dd"),
      time: "10:00",
      type: "Consultation",
      status: "Scheduled",
    },
  });

  const onSubmit = (values) => {
    const nextId = `A-${Math.floor(3000 + Math.random() * 900)}`;
    setAppointments((prev) => [{ id: nextId, ...values }, ...prev]);
    setOpen(false);
    form.reset();
  };

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
                <label className="text-sm font-medium">Patient Name</label>
                <Input {...form.register("patient")} placeholder="Patient name" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Doctor</label>
                <Select value={form.watch("doctor")} onValueChange={(value) => form.setValue("doctor", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.name}>
                        {doctor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Date</label>
                  <Input type="date" {...form.register("date")} />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Time</label>
                  <Input type="time" {...form.register("time")} />
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
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
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
                <Select value={filters.doctor} onValueChange={(value) => setFilters((prev) => ({ ...prev, doctor: value }))}>
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="Doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Doctors</SelectItem>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.name}>
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
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TabsContent value="list">
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Skeleton key={index} className="h-24 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAppointments.map((appointment) => (
                    <Card key={appointment.id} className="transition hover:shadow-md">
                      <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm text-slate-500">{appointment.date} · {appointment.time}</p>
                          <p className="text-base font-semibold text-slate-900">{appointment.patient}</p>
                          <p className="text-sm text-slate-600">{appointment.doctor} · {appointment.type}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={statusVariant[appointment.status]}>{appointment.status}</Badge>
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
                        const hasAppointment = appointments.some((appointment) =>
                          isSameDay(parseISO(appointment.date), day)
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
                      <p className="text-sm text-slate-500">No appointments for this date.</p>
                    ) : (
                      appointmentsForDay.map((appointment) => (
                        <div key={appointment.id} className="rounded-lg border border-slate-200 p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-slate-900">{appointment.patient}</p>
                              <p className="text-sm text-slate-600">{appointment.doctor}</p>
                            </div>
                            <Badge variant={statusVariant[appointment.status]}>{appointment.status}</Badge>
                          </div>
                          <p className="mt-2 text-sm text-slate-500">{appointment.time} · {appointment.type}</p>
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
            {isLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : (
              <>
                <div className="rounded-lg border border-slate-200 p-3">
                  <p className="text-sm text-slate-500">Total Appointments</p>
                  <p className="text-xl font-semibold text-slate-900">{appointments.length}</p>
                </div>
                <div className="rounded-lg border border-slate-200 p-3">
                  <p className="text-sm text-slate-500">Scheduled</p>
                  <p className="text-xl font-semibold text-slate-900">
                    {appointments.filter((appointment) => appointment.status === "Scheduled").length}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 p-3">
                  <p className="text-sm text-slate-500">Completed</p>
                  <p className="text-xl font-semibold text-slate-900">
                    {appointments.filter((appointment) => appointment.status === "Completed").length}
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
