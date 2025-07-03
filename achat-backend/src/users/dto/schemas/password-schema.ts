import { z } from 'zod';

export const passwordSchema = () =>
  z
    .string()
    .regex(/^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[^A-Za-z0-9]).{8,}$/gs);
