import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import { patchNestJsSwagger } from 'nestjs-zod';
import { ZodValidationPipe } from '../utils/zod-validation.pipe';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.enableCors({
  //   origin: ['https://achat.ocp-group.ma/', 'https://1337.ma/'],
  //   methods: ['GET', 'POST', 'DELETE', 'PATCH'],
  //   credentials: true,
  // });
  app.use(cookieParser());
  app.useGlobalPipes(new ZodValidationPipe());
  app.use(bodyParser.json({ limit: '15mb' }));
  app.use(bodyParser.urlencoded({ limit: '15mb', extended: true }));
  app.use(bodyParser.raw({ limit: '15mb' }));
  app.setGlobalPrefix('/api');

  patchNestJsSwagger();

  const config = new DocumentBuilder()
    .setTitle('AChat API')
    .setDescription('The AChat API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  app.enableCors({
    origin: '*',
    credentials: true,
  });

  await app.listen(process.env.BACKEND_PORT || 1337);
}
bootstrap();
