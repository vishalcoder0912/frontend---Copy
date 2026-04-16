import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { format } from "date-fns";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
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
import Pagination from "../components/shared/Pagination";
import LoadingSkeleton from "../components/shared/LoadingSkeleton";
import EmptyState from "../components/shared/EmptyState";
import api from "../lib/api";

const actionColors = {
  CREATE_PATIENT: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  UPDATE_PATIENT: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  CREATE_APPOINTMENT: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  CREATE_BILLING: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  UPDATE_BILLING: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  DELETE_BILLING: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
};

export default function ActivityLogs() {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ["activity-logs", { search, actionFilter, page }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (actionFilter !== "all") params.append("action", actionFilter);
      params.append("page", String(page));
      params.append("limit", String(pageSize));
      const response = await api.get(`/activity?${params}`);
      return response.data?.data;
    },
    retry: 1,
  });

  const logs = useMemo(() => data?.items || [], [data?.items]);
  const actionOptions = useMemo(
    () => ["all", ...new Set(logs.map((log) => log.action).filter(Boolean))],
    [logs]
  );
  const totalPages = data?.pagination?.totalPages || 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Activity Logs</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Track system requests and user actions from the audit trail.</p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search logs..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
          />
        </div>
        <Select
          value={actionFilter}
          onValueChange={(value) => {
            setActionFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700 dark:text-white">
            <SelectValue placeholder="Filter by action" />
          </SelectTrigger>
          <SelectContent>
            {actionOptions.map((action) => (
              <SelectItem key={action} value={action}>
                {action === "all" ? "All Actions" : action}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <LoadingSkeleton rows={6} />
      ) : error ? (
        <EmptyState title="Activity logs unavailable" description={error.message || "Unable to load activity logs."} />
      ) : logs.length === 0 ? (
        <EmptyState title="No activity found" description="No audit log entries matched the current filters." />
      ) : (
        <div className="rounded-lg border bg-white dark:bg-slate-900 dark:border-slate-700">
          <Table>
            <TableHeader>
              <TableRow className="dark:border-slate-700">
                <TableHead className="dark:text-slate-300">Action</TableHead>
                <TableHead className="dark:text-slate-300">User</TableHead>
                <TableHead className="dark:text-slate-300">Role</TableHead>
                <TableHead className="dark:text-slate-300">Endpoint</TableHead>
                <TableHead className="dark:text-slate-300">Status</TableHead>
                <TableHead className="dark:text-slate-300">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="dark:border-slate-700">
              {logs.map((log) => (
                <TableRow key={log.id} className="dark:border-slate-700">
                  <TableCell>
                    <Badge className={actionColors[log.action] || "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"}>
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium dark:text-white">{log.user_name || "System"}</TableCell>
                  <TableCell className="dark:text-slate-300">{log.user_role || "-"}</TableCell>
                  <TableCell className="dark:text-slate-300">{log.endpoint || "-"}</TableCell>
                  <TableCell className="dark:text-slate-300">{log.response_status || "-"}</TableCell>
                  <TableCell className="dark:text-slate-300 text-sm">
                    {log.timestamp ? format(new Date(log.timestamp), "MMM d, yyyy HH:mm") : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
