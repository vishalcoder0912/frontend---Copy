import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "../lib/api";

export default function useStaff(options = {}) {
  const { search = "", department_id = "", status = "", position = "", page = 1, limit = 20 } = options;
  
  const queryKey = ["staff", { search, department_id, status, position, page, limit }];
  
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (department_id) params.append("department_id", department_id);
      if (status) params.append("status", status);
      if (position) params.append("position", position);
      params.append("page", String(page));
      params.append("limit", String(limit));
      
      try {
        const response = await api.get(`/staff?${params}`);
        return response.data?.data || response.data;
      } catch (error) {
        const message = error.response?.data?.message || error.message || "Failed to fetch staff";
        toast.error(message);
        throw new Error(message);
      }
    },
    retry: 1,
    staleTime: 30000,
  });

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      try {
        const response = await api.post("/staff", payload);
        toast.success("Staff member added successfully");
        return response.data;
      } catch (error) {
        const message = error.response?.data?.message || error.message || "Failed to add staff";
        toast.error(message);
        throw new Error(message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      try {
        const response = await api.put(`/staff/${id}`, payload);
        toast.success("Staff member updated successfully");
        return response.data;
      } catch (error) {
        const message = error.response?.data?.message || error.message || "Failed to update staff";
        toast.error(message);
        throw new Error(message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      try {
        const response = await api.delete(`/staff/${id}`);
        toast.success("Staff member deleted successfully");
        return response.data;
      } catch (error) {
        const message = error.response?.data?.message || error.message || "Failed to delete staff";
        toast.error(message);
        throw new Error(message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
  });

  return {
    ...query,
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
    createStaff: createMutation.mutateAsync,
    updateStaff: updateMutation.mutateAsync,
    deleteStaff: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
