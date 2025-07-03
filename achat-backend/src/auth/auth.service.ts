import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Request } from 'express';
import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';
import { LogsType } from 'src/logs/enums/logs.enum';
import { LogsService } from 'src/logs/logs.service';
import { MailService } from 'src/mail/mail.service';
import { SessionService } from 'src/session/session.service';
import { User } from 'src/users/entities/user.entity';
import { EntityTypes } from 'src/users/enums/user.enum';
import { UsersService } from 'src/users/users.service';
import { EntityManager, Repository } from 'typeorm';
import { SupplierRegisterDto } from './dto/auth.dto';
import { RoleService } from './services/role.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly sessionService: SessionService,
    private readonly logsService: LogsService,
    private readonly roleService: RoleService,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly mailService: MailService,
  ) {}

  private getVerificationExpiry(): Date {
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 24);
    return expiryDate;
  }

  private async generateUniqueUsername(
    baseUsername: string,
    transactionalEntityManager: EntityManager,
  ): Promise<string> {
    let username = baseUsername;
    let counter = 1;

    while (true) {
      // Check if username exists
      const existingUser = await transactionalEntityManager.findOne(User, {
        where: { username },
      });

      if (!existingUser) {
        return username;
      }

      // If username exists, append number and try again
      username = `${baseUsername}${counter}`;
      counter++;
    }
  }
  private generateBaseUsername(firstName: string, lastName: string): string {
    // Remove special characters and spaces, convert to lowercase
    const cleanFirstName = firstName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanLastName = lastName.toLowerCase().replace(/[^a-z0-9]/g, '');

    return `${cleanFirstName}.${cleanLastName}`;
  }
  async login(username: string, password: string, request: Request) {
    try {
      // Find user by username or email
      const user = await this.usersRepository.findOne({
        where: [{ username }, { email: username }],
        select: ['id', 'username', 'email', 'password', 'is_active', 'two_factor_enabled', 'entity_type'],
      });

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      if (!user.is_active) {
        throw new UnauthorizedException('Account is deactivated');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password || '');
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Get user permissions
      const permissions = await this.roleService.getUserPermissions(user.id);

      const token = await this.jwtService.signAsync({
        id: user.id,
        username: user.username,
        permissions,
      });

      // Create session with 2FA status
      const twoFactorVerified = !user.two_factor_enabled;
      await this.sessionService.createSession(
        user,
        token,
        request,
        twoFactorVerified,
      );

      await this.logsService.createLog({
        action_type: LogsType.AUTH,
        action: `User ${user.username} logged in successfully`,
        user_id: user.id,
      });

      return {
        access_token: token,
        requires_2fa: user.two_factor_enabled && !twoFactorVerified,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      console.log(error);
      throw new HttpException('Login Failed', HttpStatus.UNAUTHORIZED);
    }
  }

  async refresh(refreshToken: string) {
    // For now, we'll remove refresh token functionality as it's handled by session expiry
    // This can be reimplemented later if needed with a separate refresh token table
    throw new HttpException('Refresh token not supported in current implementation', HttpStatus.NOT_IMPLEMENTED);
  }

  async resendVerificationEmail(email: string) {
    const user = await this.usersRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.is_verified) {
      throw new BadRequestException('Email is already verified');
    }

    user.verification_token = this.usersService.generateVerificationToken();
    user.verification_expires = this.getVerificationExpiry();

    await this.usersRepository.save(user);
    await this.logsService.createLog({
      action_type: LogsType.PROFILE,
      previous_status: 'unverified',
      action: `Requested a new verification email for ${user.email}`,
      user_id: user.id,
    });
  }

  async registerSupplier(userData: SupplierRegisterDto) {
    try {
      return await this.usersRepository.manager.transaction(
        async (transactionalEntityManager) => {
          // Check for existing user with same email or username
          const existingUser = await transactionalEntityManager.findOne(User, {
            where: [{ email: userData.email }],
          });

          if (existingUser) {
            throw new ConflictException('User with this email already exists');
          }

          // Generate unique username
          const baseUsername = this.generateBaseUsername(
            userData.first_name,
            userData.last_name,
          );
          const username = await this.generateUniqueUsername(
            baseUsername,
            transactionalEntityManager,
          );

          // Generate verification token and expiry
          const verificationToken =
            this.usersService.generateVerificationToken();
          const verificationExpires = this.getVerificationExpiry();

          // Hash password
          const hashedPassword = await bcrypt.hash(userData.password, 12);

          // Create new user with verification details
          const newUser = transactionalEntityManager.create(User, {
            ...userData,
            username,
            password: hashedPassword,
            full_name: `${userData.first_name} ${userData.last_name}`,
            entity_type: EntityTypes.SUPPLIER,
            verification_token: verificationToken,
            verification_expires: verificationExpires,
            is_verified: false,
            is_active: false,
            is_restricted: true,
          });

          // Save the user
          const savedUser = await transactionalEntityManager.save(
            User,
            newUser,
          );

          // Assign default supplier role
          const supplierRole = await this.roleService.getRoleByName('SUPPLIER');
          if (supplierRole) {
            await this.roleService.assignRoleToUser(savedUser.id, supplierRole.id);
          }

          // Send verification email
          // await this.mailService.sendVerificationEmail({
          //   to: savedUser.email,
          //   firstName: savedUser.first_name,
          //   verificationLink: `${process.env.APP_URL}/verify-email?token=${verificationToken}`,
          // });

          // Create audit log
          await this.logsService.createLog({
            action_type: LogsType.PROFILE,
            action: `Created supplier account for ${savedUser.email}`,
            user_id: savedUser.id,
          });

          return savedUser;
        },
      );
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      console.error('Registration error:', error);
      throw new HttpException('Failed to register', HttpStatus.BAD_REQUEST);
    }
  }

  async verifyEmail(token: string) {
    try {
    } catch (error) {
      throw new HttpException('Failed to verify email', HttpStatus.BAD_REQUEST);
    }
  }

  async setup2FA(user: User) {
    const secret = authenticator.generateSecret();
    const otpAuthUrl = authenticator.keyuri(
      user.full_name,
      'OCP Achat - Dev',
      secret
    );

    // Generate QR code with logo
    const qrCodeUrl = await QRCode.toDataURL(otpAuthUrl, {
      errorCorrectionLevel: 'H',
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
      width: 400,
      rendererOpts: {
        quality: 1,
      },
      maskPattern: 7,
    });

    await this.usersRepository.update(user.id, {
      temp_2fa_secret: secret,
    });

    return {
      qrCode: qrCodeUrl,
      secret: secret,
    };
  }

  async verify2FA(userId: number, token: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['temp_2fa_secret'],
    });

    if (!user?.temp_2fa_secret) {
      throw new BadRequestException('2FA setup not initiated');
    }

    const verified = authenticator.verify({
      token,
      secret: user.temp_2fa_secret,
    });

    if (!verified) {
      throw new BadRequestException('Invalid 2FA code');
    }

    // Save the verified secret and enable 2FA
    await this.usersRepository.update(userId, {
      two_factor_secret: user.temp_2fa_secret,
      temp_2fa_secret: null,
      two_factor_enabled: true,
    });

    return { message: '2FA enabled successfully' };
  }

  async verify2FALogin(
    userId: number,
    token: string,
    sessionId: number,
  ): Promise<boolean> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['two_factor_secret'],
    });
    if (!user?.two_factor_secret) {
      return true; // 2FA not enabled
    }

    const verified = authenticator.verify({
      token,
      secret: user.two_factor_secret,
    });

    if (!verified) {
      throw new BadRequestException('Invalid 2FA code');
    }

    await this.sessionService.updateSessionTwoFactorVerification(
      userId,
      true,
      sessionId,
    );

    return verified;
  }

  async disable2FA(userId: number, token: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['two_factor_secret'],
    });

    if (!user?.two_factor_secret) {
      throw new BadRequestException('2FA is not enabled');
    }

    const verified = authenticator.verify({
      token,
      secret: user.two_factor_secret,
    });

    if (!verified) {
      throw new BadRequestException('Invalid 2FA code');
    }

    // Disable 2FA
    await this.usersRepository.update(userId, {
      two_factor_secret: null,
      two_factor_enabled: false,
    });

    await this.logsService.createLog({
      action_type: LogsType.PROFILE,
      action: '2FA disabled',
      user_id: userId,
    });

    return { message: '2FA disabled successfully' };
  }
}
