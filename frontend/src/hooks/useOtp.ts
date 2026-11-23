import { OtpService } from "../service/otp.service";
import { useMutation } from "@tanstack/react-query";

export function useVerifyOtp() {
  return useMutation({
    mutationFn: OtpService.verify,
    onError: (error) => {
      console.error('Lỗi:', error);
    }
  })
}
export function useSendOtp() {
  return useMutation({
    mutationFn: OtpService.sendOtp,
    onError: (error) => {
      console.error('Lỗi:', error);
    }
  })
}