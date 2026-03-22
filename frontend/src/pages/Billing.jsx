import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { billingRecords as billingSeed } from "../data/billing";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select";
import { Skeleton } from "../components/ui/skeleton";

const statusVariant = {
  Paid: "success",
  Pending: "warning",
  Overdue: "danger",
};

export default function Billing() {
  const { data, isLoading } = useQuery({
    queryKey: ["billing"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return billingSeed;
    },
  });

  const [records] = useState(billingSeed);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesSearch = `${record.patient} ${record.doctor}`.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || record.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [records, search, statusFilter]);

  const totalRevenue = records.reduce((sum, record) => sum + record.amount, 0);
  const pendingAmount = records.filter((record) => record.status === "Pending").reduce((sum, record) => sum + record.amount, 0);
  const overdueAmount = records.filter((record) => record.status === "Overdue").reduce((sum, record) => sum + record.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Billing</h1>
          <p className="text-sm text-slate-500">Track invoices and payment status</p>
        </div>
        <Button>Generate Invoice</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-slate-900">?{totalRevenue.toLocaleString("en-IN")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-amber-600">?{pendingAmount.toLocaleString("en-IN")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-rose-600">?{overdueAmount.toLocaleString("en-IN")}</p>
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
            <SelectItem value="Paid">Paid</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
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
                <TableHead>Invoice</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium text-slate-900">{record.id}</TableCell>
                  <TableCell>{record.patient}</TableCell>
                  <TableCell>{record.doctor}</TableCell>
                  <TableCell>{record.date}</TableCell>
                  <TableCell>?{record.amount.toLocaleString("en-IN")}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[record.status]}>{record.status}</Badge>
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
