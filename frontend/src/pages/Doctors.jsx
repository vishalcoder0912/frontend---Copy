import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { doctors as doctorSeed } from "../data/doctors";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select";
import { Skeleton } from "../components/ui/skeleton";

const doctorSchema = z.object({
  name: z.string().min(2, "Name is required"),
  specialization: z.string().min(2, "Specialization is required"),
  experience: z.coerce.number().min(1).max(40),
  rating: z.coerce.number().min(1).max(5),
  status: z.string().min(1, "Status is required"),
});

const statusVariant = {
  Available: "success",
  "In Surgery": "warning",
  "On Leave": "danger",
};

export default function Doctors() {
  const { data, isLoading } = useQuery({
    queryKey: ["doctors"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return doctorSeed;
    },
  });

  const [doctors, setDoctors] = useState(doctorSeed);
  const [specialization, setSpecialization] = useState("all");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const specializations = useMemo(() => {
    const values = new Set(doctors.map((doctor) => doctor.specialization));
    return ["all", ...Array.from(values)];
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doctor) => {
      const matchesSpecialization = specialization === "all" || doctor.specialization === specialization;
      const matchesSearch = doctor.name.toLowerCase().includes(search.toLowerCase());
      return matchesSpecialization && matchesSearch;
    });
  }, [doctors, specialization, search]);

  const form = useForm({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      name: "",
      specialization: "Cardiology",
      experience: 5,
      rating: 4.5,
      status: "Available",
    },
  });

  const onSubmit = (values) => {
    const nextId = `D-${Math.floor(2000 + Math.random() * 900)}`;
    setDoctors((prev) => [{ id: nextId, ...values }, ...prev]);
    setOpen(false);
    form.reset();
  };

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
              <div className="grid gap-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={form.watch("status")} onValueChange={(value) => form.setValue("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="In Surgery">In Surgery</SelectItem>
                    <SelectItem value="On Leave">On Leave</SelectItem>
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
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-44 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredDoctors.map((doctor) => (
            <Card key={doctor.id} className="transition hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{doctor.name}</span>
                  <Badge variant={statusVariant[doctor.status]}>{doctor.status}</Badge>
                </CardTitle>
                <p className="text-sm text-slate-500">{doctor.specialization}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="font-medium">Experience:</span>
                  {doctor.experience} years
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="font-medium">Rating:</span>
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-amber-400" />
                    {doctor.rating}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">View Profile</Button>
                  <Button variant="secondary" size="sm">Assign</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
