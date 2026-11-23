import api from "@/lib/axios";

export const OtpService = {
    async sendOtp(phone: string)
    {
        const { data } = await api.post('auth/send-otp',{phone})
        return data
    },
    
    async verify(body: {phone: string, otp: string})
    {
        const {data} = await api.post('auth/verify-otp', body)
        return data
    }
}