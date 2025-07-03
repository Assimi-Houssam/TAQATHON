import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { passwordSchema } from 'src/users/dto/schemas/password-schema';

// Login DTO
const SupplierLoginDtoSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export class SupplierLoginDto extends createZodDto(SupplierLoginDtoSchema) {}

// Register DTO
const SupplierRegisterSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: passwordSchema(),
  confirmation_password: passwordSchema(),
  first_name: z.string().min(4, 'First name is required'),
  last_name: z.string().min(4, 'Last name is required'),
  })
  .refine((data) => data.password == data.confirmation_password, {
    message: "Passwords don't match",
  });

export class SupplierRegisterDto extends createZodDto(SupplierRegisterSchema) {}

// Refresh Token DTO
const RefreshTokenDtoSchema = z.object({
  refresh_token: z.string().min(1, 'Refresh token is required'),
});

export class RefreshTokenDto extends createZodDto(RefreshTokenDtoSchema) {}
