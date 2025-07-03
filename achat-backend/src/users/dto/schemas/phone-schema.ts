import { z } from 'zod';

export const phoneSchema = () => z.string().regex(/^\+?[0-9]\d{1,14}$/);
