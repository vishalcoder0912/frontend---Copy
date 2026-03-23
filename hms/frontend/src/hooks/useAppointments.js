import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "../lib/api";
import { appointments as fallbackAppointments } from "../data/appointments";

const mapFallback = () =>
  fallbackAppointments.map((a) => ({
    ...a,
    patient_name: a.patient || a.patient_name,
    doctor_name: a.doctor || a.doctor_name,
    appointment_date: a.date
      ? `${a.date}T${a.time || "09:00"}:00`
      : a.appointment_date,
  }));

export default function useAppointments(params = {}) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["appointments", params],
    retry: false,
    staleTime: 30000,
    queryFn: async () => {
      try {
        const { data } = await api.get("/appointments", { params });
        return data?.data;
      } catch {
        const items = mapFallback();
        return {
          items,
          pagination: {
            total: items.length,
            page: 1,
            limit: 200,
            pages: 1,
          },
        };
      }
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post("/appointments", payload);
      return data?.data;
    },
    onSuccess: () => {
      toast.success("Appointment created");
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      const { data } = await api.put(`/appointments/${id}`, payload);
      return data?.data;
    },
    onSuccess: () => {
      toast.success("Appointment updated");
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { data } = await api.delete(`/appointments/${id}`);
      return data?.data;
    },
    onSuccess: () => {
      toast.success("Appointment deleted");
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return {
    ...query,
    createAppointment: createMutation.mutateAsync,
    updateAppointment: updateMutation.mutateAsync,
    deleteAppointment: deleteMutation.mutateAsync,
    creating: createMutation.isPending,
    updating: updateMutation.isPending,
    deleting: deleteMutation.isPending,
  };
}
