import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import {
  Get,
  Put,
  Controller,
  Query,
  Delete,
  Param,
  Post,
  ParseIntPipe,
  Body,
  UseGuards,
  BadRequestException,
  UploadedFile,
  UseInterceptors,
  Res,
  Response,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { SupplierStatusAction } from './enums/user.enum';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetUser } from 'decorators/get-user.decorator';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { AuthService } from 'src/auth/auth.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentService } from 'src/documents/doc.service';
import { GetUsersDto } from './dto/get-users.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import { CompaniesService } from 'src/companies/companies.service';

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly documentService: DocumentService,
    private readonly companiesService: CompaniesService,
  ) {}

  @Get('ocp/agents')
  @ApiOperation({ summary: 'Get all agents' })
  @ApiResponse({ status: 200, description: 'Return all agents' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  async findAllAgents(@Query() query: GetUsersDto): Promise<{
    users: User[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    return this.usersService.findAllUsers(true, query);
  }

  @Get('ocp/suppliers')
  @ApiOperation({ summary: 'Get all suppliers' })
  @ApiResponse({ status: 200, description: 'Return all suppliers' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  async findAllSuppliers(@Query() query: GetUsersDto): Promise<{
    users: User[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    return this.usersService.findAllUsers(false, query);
  }

  @Get('ocp/profile/:id')
  @ApiOperation({ summary: 'Get profile by id' })
  @ApiResponse({ status: 200, description: 'Return profile' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async getProfile(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.usersService.findUser(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by id' })
  @ApiResponse({ status: 200, description: 'Return user' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findUser(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.usersService.findUser(id);
  }

  @Get(':userId/companies')
  @ApiOperation({ summary: 'Get user companies' })
  @ApiResponse({ status: 200, description: 'Return user companies' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserCompanies(@Param('userId', ParseIntPipe) userId: number) {
    return this.companiesService.getUserCompanies(userId);
  }

  @Get(':id/status')
  @ApiOperation({ summary: 'Get user online status' })
  @ApiResponse({ status: 200, description: 'Return user status' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserStatus(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getUserOnlineStatus(id);
  }

  @Delete('ocp/set-account-status/:id/:status')
  @ApiOperation({ summary: 'Activate or deactivate supplier' })
  @ApiResponse({ status: 204, description: 'Supplier status updated' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  async deactivateSupplier(
    @Param('id', ParseIntPipe) id: number,
    @Param('status') status: SupplierStatusAction,
  ): Promise<void> {
    await this.usersService.toggleSupplierStatus(id, status);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update supplier' })
  @ApiResponse({ status: 204, description: 'Supplier updated' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  async updateSupplier(
    @Param('id', ParseIntPipe) id: number,
    @Body() UpdateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateSupplierData(id, UpdateUserDto);
  }

  @Public()
  @Get('verify-email')
  @ApiOperation({ summary: 'Verify email' })
  @ApiResponse({ status: 200, description: 'Email verified' })
  @ApiResponse({ status: 400, description: 'Invalid token' })
  async verifyEmail(@Query('token') token: string) {
    return this.usersService.verifyEmail(token);
  }

  @Public()
  @Post('resend-verification')
  @ApiOperation({ summary: 'Resend verification email' })
  @ApiResponse({ status: 200, description: 'Verification email sent' })
  @ApiResponse({ status: 400, description: 'Invalid email' })
  async resendVerification(@Body('email') email: string) {
    await this.authService.resendVerificationEmail(email);
    return { message: 'Verification email sent' };
  }

  @Public()
  @Post('forgot-password')
  @ApiOperation({ summary: 'Forgot password' })
  @ApiResponse({ status: 200, description: 'Password reset link sent' })
  @ApiResponse({ status: 400, description: 'Invalid email' })
  async forgotPassword(@Body('email') email: string) {
    return this.usersService.forgotPassword(email);
  }

  @Public()
  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password' })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  @ApiResponse({ status: 400, description: 'Invalid token' })
  async resetPassword(@Body() resetPasswordDto: any) {
    await this.usersService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.password,
    );
    return { message: 'Password has been reset successfully' };
  }

  @Post('status/batch')
  async getUsersStatus(@Body() userIds: number[]) {
    return this.usersService.getUsersOnlineStatus(userIds);
  }

  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/^image\/(jpg|jpeg|png|gif)$/)) {
          return callback(
            new BadRequestException('Only image files are allowed!'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  @ApiOperation({ summary: 'Upload user avatar' })
  @ApiResponse({ status: 200, description: 'Avatar updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file type or size' })
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @GetUser() currentUser: User,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.usersService.updateAvatar(file, currentUser);
  }

  @Delete('avatar')
  @ApiOperation({ summary: 'Delete user avatar' })
  @ApiResponse({ status: 200, description: 'Avatar deleted successfully' })
  async deleteAvatar(@GetUser() currentUser: User) {
    return this.usersService.deleteAvatar(currentUser);
  }
}
