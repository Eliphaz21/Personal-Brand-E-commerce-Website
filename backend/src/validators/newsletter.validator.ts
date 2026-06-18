import { z } from 'zod';

export const subscribeNewsletterSchema = z.object({
  body: z.object({
    email: z.string().email('Please provide a valid email address'),
    name: z.string().max(80, 'Name is too long').optional(),
  }),
});

export const newsletterMessageSchema = z.object({
  body: z.object({
    email: z.string().email('Please provide a valid email address'),
    guestName: z.string().min(2, 'Name must be at least 2 characters').max(80).optional(),
    subject: z.string().min(1, 'Subject is required').max(200),
    body: z.string().min(1, 'Message is required').max(5000),
  }),
});

export const broadcastNewsletterSchema = z.object({
  body: z.object({
    subject: z.string().min(1, 'Subject is required').max(200),
    body: z.string().min(1, 'Message is required').max(10000),
  }),
});
