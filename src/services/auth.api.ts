/**
 * OTP-only identity. Mock adapter: any valid Indian mobile, OTP = site.demoOtp.
 * Real backend: POST /auth/otp/send { mobile } → { requestId }, POST /auth/otp/verify { requestId, otp } → { token, customer }.
 */
import { site } from '@/config/site';
import { http, ApiError } from './api';
import { isValidIndianMobile, sleep, uid } from '@/lib/utils';
import type { Customer } from '@/types';

export const authApi = {
  async sendOtp(mobile: string): Promise<{ requestId: string; resendAfterSec: number }> {
    if (!site.useMockApi) return http('/auth/otp/send', { method: 'POST', body: JSON.stringify({ mobile }) });
    await sleep(500);
    if (!isValidIndianMobile(mobile)) throw new ApiError('Enter a valid 10-digit Indian mobile number', 400);
    return { requestId: uid('otp_'), resendAfterSec: 30 };
  },

  async verifyOtp(requestId: string, otp: string, mobile: string): Promise<{ token: string; customer: Customer }> {
    if (!site.useMockApi) return http('/auth/otp/verify', { method: 'POST', body: JSON.stringify({ requestId, otp }) });
    await sleep(600);
    if (otp !== site.demoOtp) throw new ApiError(`That code did not match. Demo code: ${site.demoOtp}`, 401);
    const digits = mobile.replace(/\D/g, '').slice(-10);
    return {
      token: uid('tok_'),
      customer: {
        id: uid('cus_'),
        name: '',
        primaryMobile: digits,
        updatesMobile: digits,
        language: 'ta',
        whatsappUpdates: true,
        walletBalance: 210,
        memberSince: new Date().toISOString(),
      },
    };
  },
};
