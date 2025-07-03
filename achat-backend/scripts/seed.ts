import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import { User } from '../src/users/entities/user.entity';
import { Company } from '../src/companies/entities/company.entity';
import { Chat } from '../src/chats/entities/chat.entity';
import { ChatType } from '../src/chats/enums/chat.enum';
import { Message } from '../src/messages/entities/message.entity';
import { Notification } from '../src/notifications/entities/notification.entity';
import { BusinessScope } from '../src/companies/entities/business-scope.entity';
import { EntityTypes } from '../src/users/enums/user.enum';
import {
  NotificationType,
  NotificationStatus,
} from '../src/notifications/enums/notification.enum';
import {
  CompanyApprovalStatus,
  CompanyStatus,
  LegalForms,
  Certifications,
} from '../src/companies/enums/company.enum';
import { Bid } from '../src/bids/entities/bid.entity';
import { PurchaseRequest } from '../src/purchase-requests/entities/purchase-request.entity';
import { Departement } from '../src/departements/entities/departement.entity';
import { Feedback } from '../src/feedbacks/entities/feedback.entity';
import { Answer } from '../src/forms/entities/answer.entity';
import { FormField } from '../src/forms/entities/formfield.entity';
import { Form } from '../src/forms/entities/form.entity';
import { FormFieldLocalization } from '../src/forms/entities/formfield-localization.entity';
import { Document } from '../src/documents/entities/doc.entity';
import { Task } from '../src/tasks/entities/task.entity';
import { BidStatus } from '../src/bids/enums/bids.enum';
import {
  PRVisibilityType,
  PurchaseRequestStatus,
} from '../src/purchase-requests/enums/purchase-request.enum';
import { FormFieldType } from '../src/forms/enums/forms.enum';
import { DocumentType } from '../src/documents/enum/doc.enum';
import { Report } from '../src/reports/entities/report.entity';
import { ReportStatus } from '../src/reports/enums/report-status.enum';
import { Reply } from '../src/reports/entities/reply.entity';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'mountassir',
  password: process.env.DB_PASSWORD || '12345',
  database: process.env.DB_NAME || 'OCP-achat',
  entities: [
    User,
    Company,
    Chat,
    Message,
    Notification,
    BusinessScope,
    Bid,
    PurchaseRequest,
    Departement,
    Feedback,
    Answer,
    FormField,
    Form,
    FormFieldLocalization,
    Document,
    Task,
    Report,
    Reply,
  ],
  synchronize: true,
});

async function seed() {
  try {
    await AppDataSource.initialize();
    console.log('Connected to database');

    // Drop all tables
    await AppDataSource.dropDatabase();
    console.log('Database dropped');

    // Recreate tables
    await AppDataSource.synchronize();
    console.log('Tables created');

    // Create documents
    const documents = Array(10)
      .fill(null)
      .map(() => {
        const document = new Document();
        document.fileName = faker.system.fileName();
        document.originalName = faker.system.fileName();
        document.mimeType = 'application/pdf';
        document.size = faker.number.int({ min: 1000, max: 10000000 });
        document.type = faker.helpers.arrayElement(Object.values(DocumentType));
        document.description = faker.lorem.sentence();
        return document;
      });

    const savedDocuments = await AppDataSource.manager.save(
      Document,
      documents,
    );

    // Create business scopes
    const businessScopes = [
      {
        name: 'Manufacturing',
        description:
          'Production of goods using labor, machines, tools, and chemical or biological processing',
      },
      {
        name: 'Construction',
        description: 'Building and engineering of infrastructure and buildings',
      },
      {
        name: 'IT Services',
        description: 'Information technology and software development services',
      },
      {
        name: 'Consulting',
        description: 'Professional advice and expertise services',
      },
      {
        name: 'Retail',
        description: 'Sale of goods to consumers',
      },
    ].map((scope) => {
      const businessScope = new BusinessScope();
      businessScope.name = scope.name;
      businessScope.description = scope.description;
      return businessScope;
    });

    const savedBusinessScopes = await AppDataSource.manager.save(
      BusinessScope,
      businessScopes,
    );

    // Create users
    const users = Array(50)
      .fill(null)
      .map(() => {
        const user = new User();
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        user.first_name = firstName;
        user.last_name = lastName;
        user.full_name = `${firstName} ${lastName}`;
        user.username = faker.internet.username();
        user.bio = faker.helpers.arrayElement([
          'coach, business owner',
          'inventor, founder, creator',
          'teacher, artist',
          'account enthusiast',
          'fork lover  ♻️',
          'rosemary devotee  🏆',
        ]);
        user.country = faker.location.country();
        user.address = faker.location.streetAddress();
        user.email = faker.internet.email();
        user.entity_type = faker.helpers.arrayElement(
          Object.values(EntityTypes),
        );
        // Limit phone number to 15 characters
        user.phone_number = faker.phone.number().slice(0, 15);
        user.language = faker.helpers.arrayElement(['fr', 'en']);
        user.title = faker.person.jobTitle();
        user.birth_date = faker.date.future();
        user.postal_city = faker.location.city();
        user.postal_country = faker.location.country();
        user.is_active = true;
        user.is_verified = true;
        user.status = faker.helpers.arrayElement(['online', 'offline', 'away']);
        return user;
      });

    const savedUsers = await AppDataSource.manager.save(User, users);

    // Create companies with owners from saved users
    const companies = Array(20)
      .fill(null)
      .map(() => {
        const company = new Company();
        company.legal_name = faker.company.name() + ' ' + faker.string.uuid();
        company.commercial_name =
          faker.company.name() + ' ' + faker.string.uuid();
        company.ICE = faker.string.numeric(15);
        company.CNSS = faker.string.numeric(10);
        company.SIRET_number = faker.string.numeric(14);
        company.VAT_number = faker.string.alphanumeric(10);
        company.TIN_number = faker.string.alphanumeric(10);
        company.industry_code = faker.string.numeric(5);
        company.legal_form = faker.helpers.arrayElement(
          Object.values(LegalForms),
        );
        company.certifications = faker.helpers.arrayElements(
          Object.values(Certifications),
          { min: 1, max: 3 },
        );
        // Limit phone numbers to 15 characters
        company.company_phone = faker.phone.number().slice(0, 15);
        company.company_2nd_phone = faker.phone.number().slice(0, 15);
        company.email = faker.internet.email();
        company.website = faker.internet.url();
        company.description = faker.company.catchPhrase();
        company.country = faker.location.country();
        company.city = faker.location.city();
        company.address = faker.location.streetAddress();
        company.postal_code = faker.location.zipCode();
        company.approval_status = CompanyApprovalStatus.APPROVED;
        company.active_status = CompanyStatus.ACTIVE;
        company.owner = savedUsers[0];
        company.business_scopes = faker.helpers.arrayElements(
          savedBusinessScopes,
          { min: 1, max: 3 },
        );
        return company;
      });

    const savedCompanies = await AppDataSource.manager.save(Company, companies);

    // Assign companies to users (excluding company owners)
    const usersWithoutCompanies = savedUsers.filter(
      (user) => !savedCompanies.some((company) => company.owner.id === user.id),
    );

    for (const user of usersWithoutCompanies) {
      user.company = faker.helpers.arrayElement(savedCompanies);
    }

    await AppDataSource.manager.save(User, usersWithoutCompanies);

    // Create purchase requests
    const purchaseRequests = Array(100)
      .fill(null)
      .map((_, index) => {
        const purchaseRequest = new PurchaseRequest();
        purchaseRequest.request_code = `PR${String(index + 1).padStart(4, '0')}`;
        purchaseRequest.title = faker.commerce.productName();
        purchaseRequest.description = faker.lorem.paragraph();
        purchaseRequest.status = faker.helpers.arrayElement(
          Object.values(PurchaseRequestStatus),
        );
        purchaseRequest.category = faker.commerce.department();
        purchaseRequest.purchase_visibility = faker.helpers.arrayElement(
          Object.values(PRVisibilityType),
        );
        purchaseRequest.delivery_date = faker.date.future();
        purchaseRequest.delivery_address = faker.location.streetAddress();
        purchaseRequest.biding_date = faker.date.future();
        purchaseRequest.biding_address = faker.location.streetAddress();
        purchaseRequest.bidding_deadline = faker.date.future();
        purchaseRequest.owner = savedUsers[0];
        purchaseRequest.documents = faker.helpers.arrayElements(
          savedDocuments,
          { min: 1, max: 3 },
        );
        purchaseRequest.agents = faker.helpers.arrayElements(savedUsers, {
          min: 1,
          max: 3,
        });
        purchaseRequest.companies = faker.helpers.arrayElements(
          savedCompanies,
          { min: 1, max: 5 },
        );
        return purchaseRequest;
      });

    const savedPurchaseRequests = await AppDataSource.manager.save(
      PurchaseRequest,
      purchaseRequests,
    );

    // Create bids
    const bids = Array(50)
      .fill(null)
      .map((_, index) => {
        const bid = new Bid();
        bid.bid_reference = `BID${String(index + 1).padStart(4, '0')}`;
        bid.bid_status = faker.helpers.arrayElement(Object.values(BidStatus));
        bid.bid_description = faker.lorem.paragraph();
        bid.delivery_date = faker.date.future();
        bid.delivery_address = faker.location.streetAddress();
        bid.biding_date = faker.date.future();
        bid.biding_address = faker.location.streetAddress();
        bid.purchase_request = faker.helpers.arrayElement(
          savedPurchaseRequests,
        );
        bid.company = faker.helpers.arrayElement(savedCompanies);
        return bid;
      });

    const savedBids = await AppDataSource.manager.save(Bid, bids);

    // Create chats for bids
    const chats = savedBids.map((bid) => {
      const chat = new Chat();
      chat.chat_name = `Chat for ${bid.bid_reference}`;
      chat.chat_type = ChatType.GROUP;
      chat.chat_description = `Discussion for bid ${bid.bid_reference}`;
      chat.bid = bid;
      chat.is_locked = false;
      chat.created_by = bid.purchase_request.owner.id;

      // Get potential members excluding the owner
      const potentialMembers = savedUsers.filter(
        (user) => user.id !== bid.purchase_request.owner.id,
      );
      const additionalMembers = faker.helpers.arrayElements(potentialMembers, {
        min: 1,
        max: 3,
      });

      // Create array of User entities for chat members
      chat.chat_members = [bid.purchase_request.owner, ...additionalMembers];

      return chat;
    });

    // Save chats and update bid relationships
    const savedChats = await AppDataSource.manager.save(Chat, chats);

    // Update bids with chat relationships
    for (let i = 0; i < savedBids.length; i++) {
      savedBids[i].chat = savedChats[i];
    }
    await AppDataSource.manager.save(Bid, savedBids);

    // Create messages
    const messages = savedChats.flatMap((chat) => {
      const messageCount = faker.number.int({ min: 5, max: 20 });
      return Array(messageCount)
        .fill(null)
        .map(() => {
          const message = new Message();
          message.content = faker.lorem.paragraph();
          message.sender = faker.helpers.arrayElement(chat.chat_members);
          message.chat = chat;
          return message;
        });
    });

    const savedMessages = await AppDataSource.manager.save(Message, messages);

    // Create feedbacks
    const feedbacks = savedBids
      .filter(() => faker.datatype.boolean()) // Only create feedback for some bids
      .map((bid) => {
        const feedback = new Feedback();
        feedback.description = faker.lorem.paragraph();
        feedback.rating = faker.number.int({ min: 1, max: 5 });
        feedback.supplier = bid.company;
        feedback.purchase_request = bid.purchase_request;
        feedback.agent = savedUsers[0];
        feedback.bid = bid;
        return feedback;
      });

    // Save feedbacks and update bid relationships
    const savedFeedbacks = await AppDataSource.manager.save(
      Feedback,
      feedbacks,
    );

    // Update bids with feedback relationships
    for (const feedback of savedFeedbacks) {
      const bid = feedback.bid;
      bid.feedback = feedback;
      await AppDataSource.manager.save(Bid, bid);
    }

    // Create notifications
    const notifications = savedBids.flatMap((bid) => {
      const notificationCount = faker.number.int({ min: 1, max: 3 });
      return Array(notificationCount)
        .fill(null)
        .map(() => {
          const notification = new Notification();
          notification.notification_type = faker.helpers.arrayElement(
            Object.values(NotificationType),
          );
          notification.is_public = faker.datatype.boolean();
          notification.notification_message = faker.lorem.sentence();
          notification.notification_status = NotificationStatus.UNREAD;
          notification.creator = savedUsers[0];
          notification.users = faker.helpers.arrayElements(savedUsers, {
            min: 1,
            max: 5,
          });
          notification.bid = bid;
          notification.purchase_request = bid.purchase_request;
          return notification;
        });
    });

    const savedNotifications = await AppDataSource.manager.save(
      Notification,
      notifications,
    );

    // Create tasks
    const tasks = savedUsers.flatMap((user) => {
      const taskCount = faker.number.int({ min: 1, max: 5 });
      return Array(taskCount)
        .fill(null)
        .map(() => {
          const task = new Task();
          task.title = faker.word.words(3);
          task.description = faker.lorem.sentence();
          task.completed = faker.datatype.boolean();
          task.deleted = faker.datatype.boolean();
          task.user = user;
          return task;
        });
    });

    const savedTasks = await AppDataSource.manager.save(Task, tasks);

    // Create forms
    const forms = [
      {
        name: 'Company Registration Form',
        description: 'Form for registering a new company',
        isLocked: false,
      },
      {
        name: 'Supplier Onboarding Form',
        description: 'Form for onboarding new suppliers',
        isLocked: false,
      },
      {
        name: 'Purchase Request Form',
        description: 'Form for submitting purchase requests',
        isLocked: false,
      },
    ].map((formData) => {
      const form = new Form();
      form.name = formData.name;
      form.description = formData.description;
      form.isLocked = formData.isLocked;
      return form;
    });

    const savedForms = await AppDataSource.manager.save(Form, forms);

    // Create form fields
    const formFields = [
      {
        label: 'Company Name',
        type: FormFieldType.TEXT,
        required: true,
        order: 1,
        forms: savedForms[0],
      },
      {
        label: 'Business Registration Number',
        type: FormFieldType.TEXT,
        required: true,
        order: 2,
        forms: savedForms[0],
      },
      {
        label: 'Company Description',
        type: FormFieldType.TEXTAREA,
        required: true,
        order: 3,
        forms: savedForms[0],
      },
      {
        label: 'Industry Type',
        type: FormFieldType.SELECT,
        required: true,
        order: 4,
        selectOptions: JSON.stringify([
          'Manufacturing',
          'Services',
          'Trading',
          'Construction',
        ]),
        forms: savedForms[0],
      },
    ].map((fieldData) => {
      const field = new FormField();
      field.label = fieldData.label;
      field.type = fieldData.type;
      field.required = fieldData.required;
      field.order = fieldData.order;
      field.selectOptions = fieldData.selectOptions;
      field.forms = fieldData.forms;
      return field;
    });

    const savedFormFields = await AppDataSource.manager.save(
      FormField,
      formFields,
    );

    // Create form field localizations
    const formFieldLocalizations = savedFormFields.flatMap((field) => {
      return ['fr', 'ar'].map((locale) => {
        const localization = new FormFieldLocalization();
        localization.formField = field;
        localization.locale = locale;
        localization.label = `${field.label} (${locale})`;
        return localization;
      });
    });

    const savedFormFieldLocalizations = await AppDataSource.manager.save(
      FormFieldLocalization,
      formFieldLocalizations,
    );

    // Create departments
    const departmentData = [
      {
        name: 'Information Technology',
        code: 'IT',
        description: faker.company.catchPhrase(),
      },
      {
        name: 'Finance',
        code: 'FIN',
        description: faker.company.catchPhrase(),
      },
      {
        name: 'Human Resources',
        code: 'HR',
        description: faker.company.catchPhrase(),
      },
      {
        name: 'Operations',
        code: 'OPE',
        description: faker.company.catchPhrase(),
      },
      {
        name: 'Procurement',
        code: 'PRO',
        description: faker.company.catchPhrase(),
      },
      { name: 'Legal', code: 'LEG', description: faker.company.catchPhrase() },
      {
        name: 'Marketing',
        code: 'MAR',
        description: faker.company.catchPhrase(),
      },
    ];

    const departments = departmentData.map((data) => {
      const department = new Departement();
      department.name = data.name;
      department.code = data.code;
      department.description = data.description;
      department.isActive = true;
      return department;
    });

    const savedDepartments = await AppDataSource.manager.save(
      Departement,
      departments,
    );

    // Create form answers
    const answers = savedFormFields.flatMap((field) => {
      return Array(5)
        .fill(null)
        .map(() => {
          const answer = new Answer();
          answer.formfield = field;
          answer.content =
            field.type === FormFieldType.SELECT
              ? JSON.parse(field.selectOptions)[0]
              : faker.lorem.sentence();
          return answer;
        });
    });

    const savedAnswers = await AppDataSource.manager.save(Answer, answers);

    // Create reports
    const reports = Array(10)
      .fill(null)
      .map(() => {
        const report = new Report();
        report.report_reference = faker.string.alphanumeric(8).toUpperCase();
        report.title = faker.word.words({ count: { min: 3, max: 6 } });
        report.description = faker.lorem.paragraph();
        report.creator = faker.helpers.arrayElement(savedUsers);
        report.status = faker.helpers.arrayElement(Object.values(ReportStatus));
        return report;
      });

    const savedReports = await AppDataSource.manager.save(Report, reports);

    // Create replies for reports
    const replies = savedReports.flatMap((report) => {
      const replyCount = faker.number.int({ min: 1, max: 5 });
      return Array(replyCount)
        .fill(null)
        .map(() => {
          const reply = new Reply();
          reply.message = faker.lorem.paragraph();
          const creator = faker.helpers.arrayElement(savedUsers);
          reply.creator = creator;
          reply.createdBy = creator.id;
          reply.report = report;
          reply.reportId = report.id;
          return reply;
        });
    });

    const savedReplies = await AppDataSource.manager.save(Reply, replies);

    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
