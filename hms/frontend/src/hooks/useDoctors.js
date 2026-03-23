import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "../lib/api";
import { doctors as fallbackDoctors } from "../data/doctors";

export default function useDoctors(params = {}) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["doctors", params],
    retry: false,
    staleTime: 30000,
    queryFn: async () => {
      try {
        const { data } = await api.get("/doctors", { params });
        return data?.data;
      } catch {
        return {
          items: fallbackDoctors,
          pagination: {
            total: fallbackDoctors.length,
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
      const { data } = await api.post("/doctors", payload);
      return data?.data;
    },
    onSuccess: () => {
      toast.success("Doctor created");
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      const { data } = await api.put(`/doctors/${id}`, payload);
      return data?.data;
    },
    onSuccess: () => {
      toast.success("Doctor updated");
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { data } = await api.delete(`/doctors/${id}`);
      return data?.data;
    },
    onSuccess: () => {
      toast.success("Doctor deleted");
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return {
    ...query,
    createDoctor: createMutation.mutateAsync,
    updateDoctor: updateMutation.mutateAsync,
    deleteDoctor: deleteMutation.mutateAsync,
    creating: createMutation.isPending,
    updating: updateMutation.isPending,
    deleting: deleteMutation.isPending,
  };
}
