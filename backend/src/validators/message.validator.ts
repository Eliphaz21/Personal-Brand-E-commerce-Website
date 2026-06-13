import { z } from 'zod';

export const createMessageSchema = z.object({
  body: z.object({
    guestName: z.string().optional(),
    guestEmail: z.string().email('Invalid email address').optional(),
    subject: z.string().min(1, 'Subject is required').max(200, 'Subject is too long'),
    body: z.string().min(1, 'Message body is required').max(5000, 'Message is too long'),
  }),
});

export const replyMessageSchema = z.object({
  body: z.object({
    adminReply: z.string().min(1, 'Reply message is required'),
  }),
});
