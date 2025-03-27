import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';
import Config from './config';

export function setupSwagger(app: INestApplication) {
  // Swagger Configuration
  const swaggerConfig = new DocumentBuilder()
    .setTitle("Meet To Aspire")
    .setDescription('An all-in-one online platform designed to connect expert to asperiant')
    .setVersion("1.0")
    .addBearerAuth()
    .addServer(String(Config.app.url()))
    .build();

  const swaggerUiOptions = {
    customSiteTitle: "Meet To Aspire" + ' Api Docs',
    useGlobalPrefix: false,
  };
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, document, swaggerUiOptions);
}
