import { z } from 'zod';

export const addressSchema = z.object({
  recipientName: z.string().trim().min(2, 'Enter the recipient’s name').max(60),
  recipientMobile: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
  pincode: z.string().regex(/^[1-9]\d{5}$/, 'Enter a valid 6-digit pincode'),
  line1: z.string().trim().min(3, 'Enter flat / house number and building').max(120),
  line2: z.string().trim().min(3, 'Enter area, street or landmark').max(120),
  city: z.string().trim().min(2, 'Enter the city').max(60),
  state: z.string().trim().min(2, 'Enter the state').max(60),
  label: z.enum(['Home', 'Work', 'Other']),
});
export type AddressFormValues = z.infer<typeof addressSchema>;
