import { INestApplication } from '@nestjs/common';
import redoc from 'redoc-express';
import Config from '../config';

export function setupRedoc(app: INestApplication) {
  const redocOptions = {
    title: String(Config.app.name()),
    version: '1.0',
    specUrl: '/api-docs-json',
  };

  app.use('/docs', redoc(redocOptions));
}