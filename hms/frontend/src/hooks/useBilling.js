import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "../lib/api";
import { billing as fallbackBilling } from "../data/billing";

const mapFallback = () =>
  fallbackBilling.map((b) => ({
    ...b,
    patient_name: b.patient || b.patient_name,
    doctor_name: b.doctor || b.doctor_name,
    invoice_date: b.date || b.invoice_date,
  }));

export default function useBilling(params = {}) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["billing", params],
    retry: false,
    staleTime: 30000,
    queryFn: async () => {
      try {
        const { data } = await api.get("/billing", { params });
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
      const { data } = await api.post("/billing", payload);
      return data?.data;
    },
    onSuccess: () => {
      toast.success("Invoice created");
      queryClient.invalidateQueries({ queryKey: ["billing"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      const { data } = await api.put(`/billing/${id}`, payload);
      return data?.data;
    },
    onSuccess: () => {
      toast.success("Invoice updated");
      queryClient.invalidateQueries({ queryKey: ["billing"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { data } = await api.delete(`/billing/${id}`);
      return data?.data;
    },
    onSuccess: () => {
      toast.success("Invoice deleted");
      queryClient.invalidateQueries({ queryKey: ["billing"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return {
    ...query,
    createBilling: createMutation.mutateAsync,
    updateBilling: updateMutation.mutateAsync,
    deleteBilling: deleteMutation.mutateAsync,
    creating: createMutation.isPending,
    updating: updateMutation.isPending,
    deleting: deleteMutation.isPending,
  };
}
