import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "../lib/api";
import { patients as fallbackPatients } from "../data/patients";

export default function usePatients(params = {}) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["patients", params],
    retry: false,
    staleTime: 30000,
    queryFn: async () => {
      try {
        const { data } = await api.get("/patients", { params });
        return data?.data;
      } catch {
        return {
          items: fallbackPatients,
          pagination: {
            total: fallbackPatients.length,
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
      const { data } = await api.post("/patients", payload);
      return data?.data;
    },
    onSuccess: () => {
      toast.success("Patient created");
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
    onError: (error) => {
      toast.error(error.message);
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
    onError: (error) => {
      toast.error(error.message);
    },
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
    onError: (error) => {
      toast.error(error.message);
    },
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
