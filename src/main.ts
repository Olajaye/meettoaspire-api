import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { setupSwagger } from './helper/swagger.config';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as session from 'express-session';
import * as cookieParser from 'cookie-parser';
import * as passport from 'passport';
import { join } from 'path';
import Config from './helper/config';
import { setupRedoc } from './helper/middlewares/redoc.middleware';
import { CustomLoggerService } from './common-modules/custom-logger/custom-logger.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {});
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');
  app.useLogger(app.get(CustomLoggerService));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      stopAtFirstError: true,
      forbidNonWhitelisted:true
    }),
  );
  app.use(cookieParser());
  app.use(
    session({
      secret: 'my-secret',
      resave: false,
      saveUninitialized: false,
    }),
  );
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: "1",
  });
  app.use(passport.initialize());
  app.use(passport.session());
  app.enableCors();

  // Log memory usage
  const memoryUsage = process.memoryUsage();
  console.log('Memory Usage:');
  console.log(`RSS: ${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Heap Total: ${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Heap Used: ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`);
  console.log(`External: ${(memoryUsage.external / 1024 / 1024).toFixed(2)} MB`);

  // setupRedoc(app);
  setupSwagger(app)
  await app.listen(Config.app.port());
}
bootstrap();
