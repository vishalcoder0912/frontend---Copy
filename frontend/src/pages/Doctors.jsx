import { useCallback, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Star, Calendar } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select";
import LoadingSkeleton from "../components/shared/LoadingSkeleton";
import EmptyState from "../components/shared/EmptyState";
import useDebounce from "../hooks/useDebounce";
import { useDoctors } from "../hooks/useDoctors";
import { useAppointments } from "../hooks/useAppointments";
import { BADGE_VARIANTS, STATUS } from "../utils/constants";
import { compareStrings } from "../utils/helpers";

const doctorSchema = z.object({
  name: z.string().min(2, "Name is required"),
  specialization: z.string().min(2, "Specialization is required"),
  experience: z.coerce.number().min(0).max(40),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  availability: z.string().min(2, "Status is required"),
  rating: z.coerce.number().min(1).max(5),
});

/**
 * Doctors page with filter and schedule view.
 */
export default function Doctors() {
  const [specialization, setSpecialization] = useState("all");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [scheduleDoctor, setScheduleDoctor] = useState(null);

  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, createDoctor, updateDoctor } = useDoctors({
    page: 1,
    limit: 100,
    search: debouncedSearch,
  });

  const appointmentsQuery = useAppointments({ page: 1, limit: 100 });

  const doctors = data?.items || [];

  const filteredDoctors = useMemo(() => {
    const list = doctors.filter((doctor) => {
      const matchSpecialization = specialization === "all" || doctor?.specialization === specialization;
      return matchSpecialization;
    });
    return list.sort((a, b) => compareStrings(a?.name, b?.name));
  }, [doctors, specialization]);

  const specializations = useMemo(() => {
    const values = new Set(doctors.map((doctor) => doctor?.specialization).filter(Boolean));
    return ["all", ...Array.from(values)];
  }, [doctors]);

  const form = useForm({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      name: "",
      specialization: "Cardiology",
      experience: 5,
      phone: "",
      email: "",
      availability: "Available",
      rating: 4.5,
    },
  });

  const onSubmit = useCallback(async (values) => {
    await createDoctor(values);
    setOpen(false);
    form.reset();
  }, [createDoctor, form]);

  const handleToggleAvailability = useCallback(async (doctor) => {
    const next = doctor?.availability === "Available" ? "On Leave" : "Available";
    await updateDoctor({ id: doctor.id, payload: { availability: next } });
  }, [updateDoctor]);

  const scheduleItems = useMemo(() => {
    if (!scheduleDoctor) return [];
    return (appointmentsQuery.data?.items || []).filter(
      (appointment) => appointment?.doctor_name === scheduleDoctor?.name
    );
  }, [appointmentsQuery.data?.items, scheduleDoctor]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Doctors</h1>
          <p className="text-sm text-slate-500">Track doctor availability and specialties</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add New Doctor</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Doctor</DialogTitle>
            </DialogHeader>
            <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Name</label>
                <Input {...form.register("name")} placeholder="Doctor name" />
                {form.formState.errors.name && (
                  <span className="text-xs text-rose-600">{form.formState.errors.name.message}</span>
                )}
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Specialization</label>
                <Input {...form.register("specialization")} placeholder="Specialization" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Experience (years)</label>
                  <Input type="number" {...form.register("experience")} />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Rating</label>
                  <Input type="number" step="0.1" {...form.register("rating")} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Phone</label>
                  <Input {...form.register("phone")} placeholder="Phone" />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input type="email" {...form.register("email")} placeholder="Email" />
                </div>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={form.watch("availability")} onValueChange={(value) => form.setValue("availability", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS.doctor.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="submit">Save Doctor</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Input
          className="max-w-md"
          placeholder="Search doctor by name"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <Select value={specialization} onValueChange={setSpecialization}>
          <SelectTrigger className="max-w-xs">
            <SelectValue placeholder="Filter by specialization" />
          </SelectTrigger>
          <SelectContent>
            {specializations.map((item) => (
              <SelectItem key={item} value={item}>
                {item === "all" ? "All Specializations" : item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <LoadingSkeleton rows={6} />
        </div>
      ) : filteredDoctors.length === 0 ? (
        <EmptyState title="No doctors" message="Try adjusting filters or add a new doctor." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredDoctors.map((doctor) => (
            <Card key={doctor.id} className="transition hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{doctor?.name}</span>
                  <Badge variant={BADGE_VARIANTS[doctor?.availability] || "default"}>{doctor?.availability}</Badge>
                </CardTitle>
                <p className="text-sm text-slate-500">{doctor?.specialization}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="font-medium">Experience:</span>
                  {doctor?.experience ?? 0} years
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="font-medium">Rating:</span>
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-amber-400" />
                    {doctor?.rating ?? "-"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => setScheduleDoctor(doctor)}>
                    <Calendar className="h-4 w-4" />
                    Schedule
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => handleToggleAvailability(doctor)}>
                    Toggle Availability
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={Boolean(scheduleDoctor)} onOpenChange={() => setScheduleDoctor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Doctor Schedule</DialogTitle>
            <p className="text-sm text-slate-500">{scheduleDoctor?.name}</p>
          </DialogHeader>
          {appointmentsQuery.isLoading ? (
            <LoadingSkeleton rows={4} />
          ) : scheduleItems.length === 0 ? (
            <EmptyState title="No appointments" message="No upcoming schedule found." />
          ) : (
            <div className="space-y-2">
              {scheduleItems.map((appointment) => (
                <div key={appointment.id} className="rounded-lg border border-slate-200 p-3">
                  <p className="text-sm font-semibold text-slate-900">{appointment?.patient_name}</p>
                  <p className="text-xs text-slate-500">{appointment?.type} · {new Date(appointment?.appointment_date).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

Doctors.propTypes = {
  initialFilter: PropTypes.string,
};
