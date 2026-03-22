import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "../lib/api";

/**
 * Patients API hook.
 */
export function usePatients(params = {}) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["patients", params],
    queryFn: async () => {
      const { data } = await api.get("/patients", { params });
      return data?.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post("/patients", payload);
      return data?.data;
    },
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ["patients"] });
      const prev = queryClient.getQueriesData({ queryKey: ["patients"] });
      queryClient.setQueriesData({ queryKey: ["patients"] }, (old) => {
        if (!old) return old;
        return { ...old, items: [payload, ...old.items] };
      });
      return { prev };
    },
    onError: (error, _, context) => {
      if (context?.prev) {
        context.prev.forEach(([key, data]) => queryClient.setQueryData(key, data));
      }
      toast.error(error.message);
    },
    onSuccess: () => {
      toast.success("Patient saved");
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      const { data } = await api.put(`/patients/${id}`, payload);
      return data?.data;
    },
    onSuccess: () => {
      toast.success("Patient updated");
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { data } = await api.delete(`/patients/${id}`);
      return data?.data;
    },
    onSuccess: () => {
      toast.success("Patient deleted");
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
    onError: (error) => toast.error(error.message),
  });

  return {
    ...query,
    createPatient: createMutation.mutateAsync,
    updatePatient: updateMutation.mutateAsync,
    deletePatient: deleteMutation.mutateAsync,
    creating: createMutation.isPending,
    updating: updateMutation.isPending,
    deleting: deleteMutation.isPending,
  };
}
