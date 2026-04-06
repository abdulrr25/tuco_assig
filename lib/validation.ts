import { z } from "zod";

// Phone: must start with + and have 7-15 digits
const phoneRegex = /^\+[1-9]\d{6,14}$/;

export const messageSchema = z.object({
  contact_id: z.string().min(1, "contact_id is required"),
  contact_name: z.string().min(1, "contact_name is required"),
  phone: z.string().regex(phoneRegex, "Invalid phone format. Use E.164, e.g. +14155551234"),
  message_text: z.string().min(1, "message_text is required"),
  campaign_id: z.string().min(1, "campaign_id is required"),
  priority: z.enum(["high", "normal", "low"]),
});

export type MessagePayload = z.infer<typeof messageSchema>;