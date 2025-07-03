import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Company } from 'src/companies/entities/company.entity';
import { PurchaseRequest } from 'src/purchase-requests/entities/purchase-request.entity';
import { InjectQueue } from '@nestjs/bull';
import { InjectRepository } from '@nestjs/typeorm';
import { LogsService } from 'src/logs/logs.service';
import { Repository } from 'typeorm';
import { Queue } from 'bull';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import { Mail } from './mail.interface';
import axios from 'axios';
import { User } from 'src/users/entities/user.entity';
import { Bid } from 'src/bids/entities/bid.entity';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(
    @InjectQueue('Mailing_queue') private readonly emailQueue: Queue,
    private readonly logsService: LogsService,
    private readonly configService: ConfigService,
  ) {
    handlebars.registerHelper('eq', function (a, b) {
      return a === b;
    });
    
    // Initialize nodemailer transporter for local SMTP
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST', 'mailhog'),
      port: this.configService.get<number>('SMTP_PORT', 1025),
      secure: false, // Use TLS
      auth: {
        user: this.configService.get<string>('SMTP_USER', ''),
        pass: this.configService.get<string>('SMTP_PASS', ''),
      },
    });
  }
  private static loadTemplate(
    templateName: string,
    language: string, // fr or en
  ): handlebars.TemplateDelegate {
    const templatesFolderPath = path.resolve('src/mail/templates');
    const templatePath = path.join(templatesFolderPath, language, templateName);
    const templateSource = fs.readFileSync(templatePath, 'utf8');
    return handlebars.compile(templateSource);
  }

  async sendMail(data: Mail) {
    if (process.env.NODE_ENV === 'production') {
      // Production mode - use external email API
      const form = new FormData();

      form.append(
        'from',
        data.from || 'Fondation OCP - Achat <no-reply@1337.ma>',
      );
      form.append('to', data.to);
      form.append('subject', data.subject);
      form.append('html', data.html.toString());

      if (data.attachments) {
        data.attachments.forEach((attachment, index) => {
          const blob = new Blob([attachment.content], {
            type: attachment.contentType,
          });
          form.append(`attachment[${index}]`, blob, attachment.filename);
        });
      }

      try {
        const response = await axios.post(process.env.MAIL_HOST, form, {
          headers: {
            Authorization: 'App ' + process.env.MAIL_KEY,
          },
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
        });
        return {
          status: 'OK',
          data: response.data,
        };
      } catch (error: any) {
        console.error('Failed to send email:', error);
        return {
          status: 'ERROR',
          data: error,
        };
      }
    } else {
      // Development mode - use local SMTP (MailHog)
      try {
        const mailOptions = {
          from: data.from || 'Fondation OCP - Achat <no-reply@achat.local>',
          to: data.to,
          subject: data.subject,
          html: data.html.toString(),
          attachments: data.attachments?.map(attachment => ({
            filename: attachment.filename,
            content: attachment.content,
            contentType: attachment.contentType,
          })),
        };

        const result = await this.transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', result.messageId);
        return {
          status: 'OK',
          data: result,
        };
      } catch (error: any) {
        console.error('Failed to send email via SMTP:', error);
        return {
          status: 'ERROR',
          data: error,
        };
      }
    }
  }

  async sendUserVerifiedMail(user: User, verificationUrl: string) {
    const template = MailService.loadTemplate(
      'verification.hbs',
      user.language,
    );
    const html = template({
      name: user.first_name,
      verificationUrl: verificationUrl,
    });

    return this.emailQueue.add('verification', {
      to: user.email,
      subject: 'Verify Your Email',
      html: html,
    });
  }

  async sendWelcomeMail(user: User) {
    const template = MailService.loadTemplate('welcome.hbs', user.language);
    const html = template({
      name: user.first_name + ' ' + user.last_name,
    });

    return this.emailQueue.add('welcome', {
      to: user.email,
      subject: 'Welcome to FOCP Supplier Portal',
      html: html,
    });
  }

  async sendResetPasswordMail(user: User, resetPasswordUrl: string) {
    const template = MailService.loadTemplate(
      'reset-password.hbs',
      user.language,
    );
    const html = template({
      name: user.first_name + ' ' + user.last_name,
      resetPasswordUrl: resetPasswordUrl,
    });

    return this.emailQueue.add('reset_password', {
      to: user.email,
      subject: 'Reset Your Password',
      html: html,
    });
  }

  async sendNewPurchaseRequestMail(
    purchaseRequest: PurchaseRequest,
    company: Company,
  ) {
    const template = MailService.loadTemplate(
      'PR-created.hbs',
      company.owner.language,
    );
    const html = template({
      supplierName: company.legal_name,
      prNumber: purchaseRequest.request_code,
      prTitle: purchaseRequest.title,
      category: purchaseRequest.category,
      dueDate: purchaseRequest.bidding_deadline,
      description: purchaseRequest.description,
    });

    return this.emailQueue.add('new_purchase_request', {
      to: company.owner.email,
      subject: 'New Purchase Request Available',
      html: html,
    });
  }

  async sendInviteSupplierToPurchaseRequestMail(
    purchaseRequest: PurchaseRequest,
    company: Company,
  ) {
    const template = MailService.loadTemplate(
      'PR-invitation-supplier.hbs',
      company.owner.language,
    );
    const html = template({
      supplierName: company.legal_name,
      prNumber: purchaseRequest.request_code,
    });

    return this.emailQueue.add('invited_to_purchase_request', {
      to: company.owner.email,
      subject: 'Invitation to participate in a purchase request',
      html: html,
    });
  }

  async sendInviteAgentToPurchaseRequestMail(
    agent: User,
    purchaseRequest: PurchaseRequest,
    company: Company,
  ) {
    const template = MailService.loadTemplate(
      'PR-invitation-agent.hbs',
      company.owner.language,
    );
    const html = template({
      supplierName: company.legal_name,
      prNumber: purchaseRequest.request_code,
    });

    return this.emailQueue.add('invited_to_purchase_request', {
      to: company.owner.email,
      subject: 'Invitation to participate in a purchase request',
      html: html,
    });
  }

  async sendPurchaseRequestPostponedMail(
    purchaseRequest: PurchaseRequest,
    company: Company,
  ) {
    const template = MailService.loadTemplate(
      'PR-postponed.hbs',
      company.owner.language,
    );
    const html = template({
      supplierName: company.legal_name,
      prNumber: purchaseRequest.request_code,
    });

    return this.emailQueue.add('purchase_request_postponed', {
      to: company.owner.email,
      subject: 'Purchase Request Postponed',
      html: html,
    });
  }

  async sendPurchaseRequestCancelledMail(
    purchaseRequest: PurchaseRequest,
    company: Company,
  ) {
    const template = MailService.loadTemplate(
      'PR-cancelled.hbs',
      company.owner.language,
    );
    const html = template({
      supplierName: company.legal_name,
      prNumber: purchaseRequest.request_code,
    });

    return this.emailQueue.add('purchase_request_cancelled', {
      to: company.owner.email,
      subject: 'Purchase Request Cancelled',
      html: html,
    });
  }

  async sendPurchaseRequestAcceptedMail(
    purchaseRequest: PurchaseRequest,
    company: Company,
  ) {
    const template = MailService.loadTemplate(
      'PR-accepted.hbs',
      company.owner.language,
    );
    const html = template({
      supplierName: company.legal_name,
      prNumber: purchaseRequest.request_code,
    });

    return this.emailQueue.add('purchase_request_accepted', {
      to: company.owner.email,
      subject: 'Purchase Request Accepted',
      html: html,
    });
  }

  async sendPurchaseRequestRejectedMail(
    purchaseRequest: PurchaseRequest,
    company: Company,
  ) {
    const template = MailService.loadTemplate(
      'PR-rejected.hbs',
      company.owner.language,
    );
    const html = template({
      supplierName: company.legal_name,
      prNumber: purchaseRequest.request_code,
    });

    return this.emailQueue.add('purchase_request_rejected', {
      to: company.owner.email,
      subject: 'Purchase Request Rejected',
      html: html,
    });
  }

  async sendPurchaseRequestFinishedMail(
    purchaseRequest: PurchaseRequest,
    company: Company,
  ) {
    const template = MailService.loadTemplate(
      'PR-finished.hbs',
      company.owner.language,
    );
    const html = template({
      supplierName: company.legal_name,
      prNumber: purchaseRequest.request_code,
    });

    return this.emailQueue.add('purchase_request_finished', {
      to: company.owner.email,
      subject: 'Purchase Request Completed',
      html: html,
    });
  }

  async sendCompanyVerifiedMail(company: Company) {
    const template = MailService.loadTemplate(
      'company-verified.hbs',
      company.owner.language,
    );
    const html = template({
      companyName: company.legal_name,
      ownerName: company.owner.first_name,
    });

    return this.emailQueue.add('company_verified', {
      to: company.owner.email,
      subject: 'Company Verification Approved',
      html: html,
    });
  }

  async sendCompanyPendingForVerificationMail(company: Company) {
    const template = MailService.loadTemplate(
      'company-needs-verification.hbs',
      company.owner.language,
    );
    const html = template({
      companyName: company.legal_name,
      ownerName: company.owner.first_name,
    });

    return this.emailQueue.add('company_pending_for_verification', {
      to: company.owner.email,
      subject: 'Company Verification Pending',
      html: html,
    });
  }

  async sendCompanyVerificationRejectedMail(company: Company, reason: string) {
    const template = MailService.loadTemplate(
      'company-verification-rejected.hbs',
      company.owner.language,
    );
    const html = template({
      companyName: company.legal_name,
      ownerName: company.owner.first_name,
      reason: reason,
    });

    return this.emailQueue.add('company_verification_rejected', {
      to: company.owner.email,
      subject: 'Company Verification Rejected',
      html: html,
    });
  }

  async sendBidWonMail(purchaseRequest: PurchaseRequest, company: Company) {
    const template = MailService.loadTemplate(
      'bid-won.hbs',
      company.owner.language,
    );
    const html = template({
      companyName: company.legal_name,
      prNumber: purchaseRequest.request_code,
    });

    return this.emailQueue.add('bid_won', {
      to: company.owner.email,
      subject: 'Congratulations! Your Bid Was Selected',
      html: html,
    });
  }

  async sendBidLostMail(purchaseRequest: PurchaseRequest, company: Company) {
    const template = MailService.loadTemplate(
      'bid-lost.hbs',
      company.owner.language,
    );
    const html = template({
      companyName: company.legal_name,
      prNumber: purchaseRequest.request_code,
    });

    return this.emailQueue.add('bid_lost', {
      to: company.owner.email,
      subject: 'Bid Status Update',
      html: html,
    });
  }

  async sendBidDisqualifiedMail(
    purchaseRequest: PurchaseRequest,
    company: Company,
    reason: string,
  ) {
    const template = MailService.loadTemplate(
      'bid-disqualified.hbs',
      company.owner.language,
    );
    const html = template({
      companyName: company.legal_name,
      prNumber: purchaseRequest.request_code,
      reason: reason,
    });

    return this.emailQueue.add('bid_disqualified', {
      to: company.owner.email,
      subject: 'Bid Disqualified',
      html: html,
    });
  }

  async sendBidCreatedMail(bid: Bid) {
    const template = MailService.loadTemplate(
      'bid-created.hbs',
      bid.company.owner.language,
    );
    const html = template({
      companyName: bid.company.legal_name,
      prNumber: bid.purchase_request.request_code,
      bidReference: bid.bid_reference,
    });

    return this.emailQueue.add('bid_created', {
      to: bid.company.owner.email,
      subject: 'New Bid Submitted',
      html: html,
    });
  }

  async sendAccountNeedsACompanyMail(user: User) {
    const template = MailService.loadTemplate(
      'account-needs-company.hbs',
      user.language,
    );
    const html = template({
      name: user.first_name + ' ' + user.last_name,
    });

    return this.emailQueue.add('account_needs_a_company', {
      to: user.email,
      subject: 'Action Required: Company Information Needed',
      html: html,
    });
  }

  async sendAccountLockedMail(user: User, reason: string) {
    const template = MailService.loadTemplate(
      'account-banned.hbs',
      user.language,
    );
    const html = template({
      name: user.first_name + ' ' + user.last_name,
      reason: reason,
    });

    return this.emailQueue.add('account_locked', {
      to: user.email,
      subject: 'Account Access Restricted',
      html: html,
    });
  }
}
