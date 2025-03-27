import { ConsoleLogger, Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import * as fsPromises from 'fs/promises';
import Config from '../../helper/config';
import * as moment from 'moment';

export enum LOG_LEVELS {
  DEBUG = 'DEBUG',
  ERROR = 'ERROR',
  INFO = 'INFO',
  WARNING = 'WARNING',
}

@Injectable()
export class CustomLoggerService extends ConsoleLogger {
  log(message: any, context?: string): void {
    const entry = `${context}\t${message}`;
    this.logToFile(entry);
    super.log(message, context);
  }

  error(message: any, stackOrContext?: string): void {
    const entry = `${stackOrContext}\t${message}`;
    this.logToFile(entry, LOG_LEVELS.ERROR);
    super.error(message, stackOrContext);
  }

  warn(message: any, stackOrContext?: string): void {
    const entry = `${stackOrContext}\t${message}`;
    this.logToFile(entry, LOG_LEVELS.WARNING);
    super.warn(message, stackOrContext);
  }

  async logToFile(entry: string, logLevel: LOG_LEVELS = LOG_LEVELS.INFO) {
    const dateToday = moment();
    const env = Config.app.env();
    const formattedEntry = `[${dateToday.format('YYYY-MM-DD HH:mm:ss')}]\t${env}.${logLevel}\t${entry}\n`;
    let fileName = 'custom-log-file.log';
    if (env !== 'local') {
      fileName = `custom-log-file-${dateToday.format('YYYY-MM-DD')}.log`;
    }
    try {
      if (!fs.existsSync(path.join(__dirname, '..', '..', 'logs'))) {
        await fsPromises.mkdir(path.join(__dirname, '..', '..', 'logs'));
      }
      await fsPromises.appendFile(
        path.join(__dirname, '..', '..', 'logs', fileName),
        formattedEntry,
      );
    } catch (e) {
      if (e instanceof Error) console.error(e.message);
    }
  }
}
