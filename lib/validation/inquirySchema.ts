import { z } from "zod";

export const inquirySchema = z
  .object({
    company: z.string().min(1, "请填写公司名称"),
    contactName: z.string().min(1, "请填写联系人"),
    phone: z.string().optional(),
    wechat: z.string().optional(),
    whatsapp: z.string().optional(),
    email: z.string().email("邮箱格式不正确").optional().or(z.literal("")),
    eventType: z.string().min(1, "请选择活动类型"),
    eventDate: z.string().min(1, "请填写活动时间"),
    attendeeCount: z.coerce.number().int().positive("请填写预计人数"),
    city: z.string().optional(),
    budgetRange: z.string().optional(),
    specialNeeds: z.string().optional(),
  })
  .refine((data) => data.phone || data.wechat || data.whatsapp || data.email, {
    message: "请至少填写一种联系方式",
    path: ["phone"],
  });

export type InquiryInput = z.infer<typeof inquirySchema>;
