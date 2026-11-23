import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  RepairService,
} from "@/service/repair.service";

export const repairKeys = {
    all: ['repair'] as const,
    lists: ()=>[...repairKeys.all, 'list'] as const,
    detail: (id: string) => [...repairKeys.all, 'detail', id] as const,
}

export function useCreateRepair() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      RepairService.create,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["repair"],
      });
    },

    onError: (error) => {
      console.error('Lỗi khi tạo phiếu sửa chữa:', error);
    }
  });
}

