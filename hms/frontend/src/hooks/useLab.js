import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "../lib/api";

export default function useLab(params = {}) {
  const queryClient = useQueryClient();

  const queryResult = useQuery({
    queryKey: ["lab", params],
    retry: false,
    staleTime: 30000,
    queryFn: async () => {
      const { data } = await api.get("/lab", { params });
      return data?.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async ({ payload, isFormData = false }) => {
      const config = isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : {};
      const { data } = await api.post("/lab", payload, config);
      return data?.data;
    },
    onSuccess: () => {
      toast.success("Lab order created successfully");
      queryClient.invalidateQueries({ queryKey: ["lab"] });
    },
    onError: (error) => toast.error(error.response?.data?.message || error.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload, isFormData = false }) => {
      const config = isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : {};
      const { data } = await api.put(`/lab/${id}`, payload, config);
      return data?.data;
    },
    onSuccess: () => {
      toast.success("Lab order updated successfully");
      queryClient.invalidateQueries({ queryKey: ["lab"] });
    },
    onError: (error) => toast.error(error.response?.data?.message || error.message),
  });

  const analyzeMutation = useMutation({
    mutationFn: async ({ id, result }) => {
      const { data } = await api.post(`/lab/${id}/analyze`, { result });
      return data?.data;
    },
    onSuccess: () => {
      toast.success("Lab result analyzed");
      queryClient.invalidateQueries({ queryKey: ["lab"] });
    },
    onError: (error) => toast.error(error.response?.data?.message || error.message),
  });

  const deleteFileMutation = useMutation({
    mutationFn: async ({ id, fileIndex }) => {
      const { data } = await api.delete(`/lab/${id}/file/${fileIndex}`);
      return data?.data;
    },
    onSuccess: () => {
      toast.success("File deleted");
      queryClient.invalidateQueries({ queryKey: ["lab"] });
    },
    onError: (error) => toast.error(error.response?.data?.message || error.message),
  });

  return {
    ...queryResult,
    createLabOrder: createMutation.mutateAsync,
    updateLabOrder: updateMutation.mutateAsync,
    analyzeLabResult: analyzeMutation.mutateAsync,
    deleteLabFile: deleteFileMutation.mutateAsync,
    creating: createMutation.isPending,
    updating: updateMutation.isPending,
    analyzing: analyzeMutation.isPending,
    deletingFile: deleteFileMutation.isPending,
  };
}
