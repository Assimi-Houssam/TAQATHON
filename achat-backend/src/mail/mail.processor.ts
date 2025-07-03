import { Process, Processor } from '@nestjs/bull';
import { MailService } from './mail.service';
import { Job } from 'bull';

@Processor('Mailing_queue')
export class MailProcessor {
  constructor(private readonly mailService: MailService) {}

  @Process('welcome')
  async sendWelcomeMail(job: Job) {
    await this.mailService.sendMail(job.data);
  }

  @Process('verification')
  async sendVerificationMail(job: Job) {
    await this.mailService.sendMail(job.data);
  }

  @Process('reset_password')
  async sendResetPasswordMail(job: Job) {
    await this.mailService.sendMail(job.data);
  }

  @Process('new_purchase_request')
  async sendNewPurchaseRequestMail(job: Job) {
    await this.mailService.sendMail(job.data);
  }

  @Process('invited_to_purchase_request')
  async sendInvitedToPurchaseRequestMail(job: Job) {
    await this.mailService.sendMail(job.data);
  }

  @Process('purchase_request_postponed')
  async sendPurchaseRequestPostponedMail(job: Job) {
    await this.mailService.sendMail(job.data);
  }

  @Process('purchase_request_cancelled')
  async sendPurchaseRequestCancelledMail(job: Job) {
    await this.mailService.sendMail(job.data);
  }

  @Process('purchase_request_accepted')
  async sendPurchaseRequestAcceptedMail(job: Job) {
    await this.mailService.sendMail(job.data);
  }

  @Process('purchase_request_rejected')
  async sendPurchaseRequestRejectedMail(job: Job) {
    await this.mailService.sendMail(job.data);
  }

  @Process('purchase_request_finished')
  async sendPurchaseRequestFinishedMail(job: Job) {
    await this.mailService.sendMail(job.data);
  }

  @Process('company_verified')
  async sendCompanyVerifiedMail(job: Job) {
    await this.mailService.sendMail(job.data);
  }

  @Process('company_pending_for_verification')
  async sendCompanyPendingForVerificationMail(job: Job) {
    await this.mailService.sendMail(job.data);
  }

  @Process('company_verification_rejected')
  async sendCompanyVerificationRejectedMail(job: Job) {
    await this.mailService.sendMail(job.data);
  }

  @Process('bid_won')
  async sendBidWonMail(job: Job) {
    await this.mailService.sendMail(job.data);
  }

  @Process('bid_lost')
  async sendBidLostMail(job: Job) {
    await this.mailService.sendMail(job.data);
  }

  @Process('bid_disqualified')
  async sendBidDisqualifiedMail(job: Job) {
    await this.mailService.sendMail(job.data);
  }

  @Process('bid_created')
  async sendBidCreatedMail(job: Job) {
    await this.mailService.sendMail(job.data);
  }

  @Process('account_needs_a_company')
  async sendAccountNeedsACompanyMail(job: Job) {
    await this.mailService.sendMail(job.data);
  }

  @Process('account_locked')
  async sendAccountLockedMail(job: Job) {
    await this.mailService.sendMail(job.data);
  }
}
