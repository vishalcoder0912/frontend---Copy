import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { patients as patientSeed } from "../data/patients";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/table";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select";
import { Skeleton } from "../components/ui/skeleton";

const patientSchema = z.object({
  name: z.string().min(2, "Name is required"),
  age: z.coerce.number().min(1).max(120),
  gender: z.string().min(1, "Gender is required"),
  bloodType: z.string().min(1, "Blood type is required"),
  contact: z.string().min(8, "Contact is required"),
  lastVisit: z.string().min(4, "Last visit is required"),
  status: z.string().min(1, "Status is required"),
});

const statusVariant = {
  Active: "success",
  Critical: "danger",
  Discharged: "default",
};

export default function Patients() {
  const { data, isLoading } = useQuery({
    queryKey: ["patients"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return patientSeed;
    },
  });

  const [patients, setPatients] = useState(patientSeed);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const filteredPatients = useMemo(() => {
    const source = patients;
    return source.filter((patient) => {
      const matchesSearch = `${patient.name} ${patient.id} ${patient.contact}`
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || patient.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [patients, search, statusFilter]);

  const form = useForm({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: "",
      age: 30,
      gender: "Male",
      bloodType: "O+",
      contact: "",
      lastVisit: "2026-03-22",
      status: "Active",
    },
  });

  const handleOpenChange = (value) => {
    setOpen(value);
    if (!value) {
      setEditing(null);
      form.reset();
    }
  };

  const onSubmit = (values) => {
    if (editing) {
      setPatients((prev) =>
        prev.map((item) => (item.id === editing.id ? { ...editing, ...values } : item))
      );
    } else {
      const nextId = `P-${Math.floor(1000 + Math.random() * 9000)}`;
      setPatients((prev) => [{ id: nextId, ...values }, ...prev]);
    }
    handleOpenChange(false);
  };

  const handleEdit = (patient) => {
    setEditing(patient);
    form.reset({ ...patient });
    setOpen(true);
  };

  const handleDelete = (id) => {
    setPatients((prev) => prev.filter((patient) => patient.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Patients</h1>
          <p className="text-sm text-slate-500">Manage patient records and care status</p>
        </div>
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button>Add New Patient</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Patient" : "Add New Patient"}</DialogTitle>
            </DialogHeader>
            <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Name</label>
                <Input {...form.register("name")} placeholder="Patient name" />
                {form.formState.errors.name && (
                  <span className="text-xs text-rose-600">{form.formState.errors.name.message}</span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Age</label>
                  <Input type="number" {...form.register("age")} />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Gender</label>
                  <Select value={form.watch("gender")} onValueChange={(value) => form.setValue("gender", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Blood Type</label>
                  <Input {...form.register("bloodType")} placeholder="O+" />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Contact</label>
                  <Input {...form.register("contact")} placeholder="Phone number" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Last Visit</label>
                  <Input type="date" {...form.register("lastVisit")} />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={form.watch("status")} onValueChange={(value) => form.setValue("status", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                      <SelectItem value="Discharged">Discharged</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Save Patient</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex w-full max-w-md items-center gap-2">
          <Input
            placeholder="Search by name, ID, or contact"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="w-full max-w-xs">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Critical">Critical</SelectItem>
              <SelectItem value="Discharged">Discharged</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        {isLoading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Blood</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Last Visit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>
                    <p className="font-medium text-slate-900">{patient.name}</p>
                    <p className="text-xs text-slate-500">{patient.id}</p>
                  </TableCell>
                  <TableCell>{patient.age}</TableCell>
                  <TableCell>{patient.gender}</TableCell>
                  <TableCell>{patient.bloodType}</TableCell>
                  <TableCell>{patient.contact}</TableCell>
                  <TableCell>{patient.lastVisit}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[patient.status]}>{patient.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(patient)}>
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(patient.id)}>
                        Delete
                      </Button>
                    </div>
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
