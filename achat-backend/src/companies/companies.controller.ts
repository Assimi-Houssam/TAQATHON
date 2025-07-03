import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetUser } from 'decorators/get-user.decorator';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { DocumentService } from 'src/documents/doc.service';
import { User } from 'src/users/entities/user.entity';
import { CompaniesService } from './companies.service';
import {
  AddNewBusinessScopeDto,
  AssignBusinessScopeToCompanyDto,
  UpdateBusinessScopeDto,
} from './dto/business-scope.dto';
import {
  CreateCompanyDto,
  GetCompaniesDto,
  InviteUserDto,
  ToggleLockCompanyDto,
  VerifyCompanyDto,
} from './dto/companies.dto';
import { Company } from './entities/company.entity';

@Controller('companies')
@UseGuards(AuthGuard, RolesGuard)
export class CompaniesController {
  constructor(
    private readonly companiesService: CompaniesService,
    private readonly documentService: DocumentService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new company' })
  @ApiResponse({ status: 201, description: 'Company created' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  async createCompany(
    @Body() createCompanyDto: CreateCompanyDto,
    @GetUser() user: User,
  ) {
    return this.companiesService.createCompany(createCompanyDto, user.id);
  }

  @Post('invite-user')
  @ApiOperation({ summary: 'Invite user to company' })
  @ApiResponse({ status: 200, description: 'User invited' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async inviteUser(
    @Body() inviteUserDto: InviteUserDto,
    @GetUser() currentUser: User,
  ) {
    return this.companiesService.inviteUser(inviteUserDto.email, currentUser);
  }

  @Post(':companyId/manage-invitation/:boolean')
  @ApiOperation({ summary: 'Manage invitation' })
  @ApiResponse({ status: 200, description: 'Invitation managed' })
  @ApiResponse({ status: 404, description: 'Invitation not found' })
  async manageInvitation(
    @Param('companyId', ParseIntPipe) companyId: number,
    @Param('accept') accept: string,
    @GetUser() currentUser: User,
  ) {
    return this.companiesService.manageInvitation(
      companyId,
      currentUser,
      accept == 'true',
    );
  }

  @Delete(':id/remove-user/:userId')
  @ApiOperation({ summary: 'Remove user from company' })
  @ApiResponse({ status: 200, description: 'User removed' })
  @ApiResponse({ status: 404, description: 'Company or user not found' })
  async removeUser(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
    @GetUser() currentUser: User,
  ) {
    return this.companiesService.removeUser(id, userId, currentUser);
  }

  @Delete(':id/leave')
  @ApiOperation({ summary: 'Leave company' })
  @ApiResponse({ status: 200, description: 'Company left' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async leaveCompany(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() currentUser: User,
  ) {
    return this.companiesService.leaveCompany(id, currentUser);
  }

  @Post(':id/logo')
  @UseInterceptors(
    FileInterceptor('logo', {
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
  @ApiOperation({ summary: 'Upload company logo' })
  @ApiResponse({ status: 200, description: 'Logo updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file type or size' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not a company member' })
  async uploadLogo(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @GetUser() currentUser: User,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.companiesService.updateLogo(id, file, currentUser);
  }

  @Delete(':id/logo')
  @ApiOperation({ summary: 'Delete company logo' })
  @ApiResponse({ status: 200, description: 'Logo deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not a company member' })
  async deleteLogo(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() currentUser: User,
  ) {
    return this.companiesService.deleteLogo(id, currentUser);
  }

  @Post(':id/toggle-lock')
  @ApiOperation({ summary: 'Toggle company lock status' })
  @ApiResponse({
    status: 200,
    description: 'Company lock status toggled successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  //   @Roles(KeycloakRole.?)
  async toggleLockCompany(
    @Param('id', ParseIntPipe) id: number,
    @Body() toggleLockDto: ToggleLockCompanyDto,
    @GetUser() currentUser: User,
  ) {
    return this.companiesService.toggleLockCompany(
      id,
      toggleLockDto,
      currentUser,
    );
  }

  @Post(':id/verify')
  @ApiOperation({ summary: 'Verify a company' })
  @ApiResponse({ status: 200, description: 'Company verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  //   @Roles(KeycloakRole.?)
  async verifyCompany(
    @Param('id', ParseIntPipe) id: number,
    @Body() verifyCompanyDto: VerifyCompanyDto,
    @GetUser() currentUser: User,
  ) {
    return this.companiesService.verifyCompany(
      id,
      verifyCompanyDto,
      currentUser,
    );
  }

  // ----------------------------- Business Scope -----------------------------

  @Get('business-scope')
  @ApiOperation({ summary: 'Get all business scopes' })
  @ApiResponse({ status: 200, description: 'Return all business scopes' })
  @ApiResponse({ status: 404, description: 'Business scope not found' })
  async getBusinessScopes() {
    return this.companiesService.getBusinessScopes();
  }

  @Post('business-scope')
  @ApiOperation({ summary: 'Add new business scope' })
  @ApiResponse({ status: 200, description: 'Business scope added' })
  @ApiResponse({ status: 404, description: 'Business scope not found' })
  async addNewBusinessScope(@Body() businessScope: AddNewBusinessScopeDto) {
    return this.companiesService.addNewBusinessScope(businessScope);
  }

  @Patch('business-scope/:id')
  @ApiOperation({ summary: 'Update business scope' })
  @ApiResponse({ status: 200, description: 'Business scope updated' })
  @ApiResponse({ status: 404, description: 'Business scope not found' })
  async updateBusinessScope(
    @Param('id', ParseIntPipe) id: number,
    @Body() businessScope: UpdateBusinessScopeDto,
  ) {
    return this.companiesService.updateBusinessScope(id, businessScope);
  }

  @Delete('business-scope/:id')
  @ApiOperation({ summary: 'Delete business scope' })
  @ApiResponse({ status: 200, description: 'Business scope deleted' })
  @ApiResponse({ status: 404, description: 'Business scope not found' })
  async deleteBusinessScope(@Param('id', ParseIntPipe) id: number) {
    return this.companiesService.deleteBusinessScope(id);
  }

  @Post(':id/business-scope/assign')
  @ApiOperation({ summary: 'Assign business scope to company' })
  @ApiResponse({
    status: 200,
    description: 'Business scope assigned to company',
  })
  @ApiResponse({
    status: 404,
    description: 'Business scope or company not found',
  })
  async assignBusinessScopeToCompany(
    @Param('id', ParseIntPipe) id: number,
    @Body() assignBusinessScopeDto: AssignBusinessScopeToCompanyDto,
  ) {
    return this.companiesService.assignBusinessScopeToCompany(
      id,
      assignBusinessScopeDto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all companies' })
  @ApiResponse({ status: 200, description: 'Return companies' })
  async getCompanies(@Query() getCompaniesDto: GetCompaniesDto): Promise<{
    companies: Company[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    return this.companiesService.findAll(getCompaniesDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get company by id' })
  @ApiResponse({ status: 200, description: 'Return company' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  // @Roles(KeycloakRole.READ_OWN_COMPANY)
  async getCompany(@Param('id', ParseIntPipe) id: number): Promise<Company> {
    return this.companiesService.findCompany(id);
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'Get company members' })
  @ApiResponse({ status: 200, description: 'Returns company members' })
  // @Roles(KeycloakRole.READ_OWN_COMPANY)
  async getCompanyMembers(@Param('id', ParseIntPipe) id: number) {
    return this.companiesService.getCompanyMembers(id);
  }
}
