import * as bcrypt from 'bcryptjs';
import * as _ from 'lodash';
import * as crypto from 'crypto';
import * as moment from 'moment';

export enum DATE_COMPARE_OPTION {
  BEFORE,
  SAME,
  AFTER,
}
const Utils = {
  env(envVariable, defaultValue: string | undefined = undefined) {
    return process.env[envVariable] ? process.env[envVariable] : defaultValue;
  },

  async hashString(
    stringToEncrypt: string,
    saltOrRounds = process.env.BCRYPT_SALT,
  ): Promise<string> {
    return await bcrypt.hash(stringToEncrypt, Number(saltOrRounds));
  },

  async hashStringMatch(
    plainString: string,
    hashedString: string,
  ): Promise<boolean> {
    return await bcrypt.compare(plainString, hashedString);
  },

  isDebugMode(): boolean {
    return process.env.API_DEBUG === 'true';
  },
  
  isProductionEnv(): boolean {
    return process.env.APP_ENV === 'production';
  },
  generateRandomCode: (digits: number): string => {
    return [...Array(digits)].map((_) => (Math.random() * 10) | 0).join('');
  },
  assignExcept: (source, excludeKeys: string[]): object => {
    const target = {};
    for (const key in source) {
      if (!excludeKeys.includes(key)) {
        target[key] = source[key];
      }
    }
    return target;
  },
  splitFullName(fullName: string): {
    firstName: string;
    middleName: string;
    lastName: string;
  } {
    const parts = fullName.trim().split(/\s+/);
    const firstName = parts.shift() ?? '';
    const lastName = parts.pop() ?? '';
    const middleName = parts.join(' ');
    return {
      firstName,
      middleName,
      lastName,
    };
  },
  async isValidImageUrl(imageUrl): Promise<boolean> {
    try {
      const image = await fetch(imageUrl, { method: 'HEAD' }).then(
        async (res) => await res.blob(),
      );
      return image.type.startsWith('image/');
    } catch (e: unknown) {
      return false;
    }
  },

  sortObjectByKeys(objectToSort: any) {
    if (!objectToSort || typeof objectToSort != 'object') {
      return objectToSort;
    }
    return _.pick(
      objectToSort,
      Object.keys(objectToSort).sort((a, b) => a.localeCompare(b)),
    );
  },

  minutesToMilliseconds(timeInMinutes: number) {
    return timeInMinutes * 60 * 1000;
  },

  async generateResetToken(): Promise<string> {
    const tokenLength = 32;
    const token = crypto.randomBytes(tokenLength).toString('hex');
    return token;
  },

  compareDates(
    subjectDate: Date,
    dateToCompare: Date,
    compareOption: DATE_COMPARE_OPTION = DATE_COMPARE_OPTION.SAME,
  ): boolean {
    switch (compareOption) {
      case DATE_COMPARE_OPTION.BEFORE:
        return moment(subjectDate).isBefore(moment(dateToCompare));

      case DATE_COMPARE_OPTION.AFTER:
        return moment(subjectDate).isAfter(moment(dateToCompare));

      default:
        return moment(subjectDate).isSame(moment(dateToCompare));
    }
  },
  getCorsOrigin(): string {
    switch (Utils.env('APP_ENV')) {
      case 'local':
        return '*';
      case 'development':
        return 'https://eyrienobra.vercel.app';
      case 'production':
      default:
        return 'https://www.eyrienobra.com';
    }
  }
};
export default Utils;
