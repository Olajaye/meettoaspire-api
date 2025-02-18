import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { $Enums } from '@prisma/client';
import moment from 'moment';
import Config from 'src/helper/config';

@Injectable()
export class MonoService {
  protected baseUrl: string | undefined;
  protected baseUrlV3: string | undefined;
  protected monoSecKey: string | undefined;
  protected lookUpSecretKey: string | undefined;

  constructor(private readonly httpService: HttpService) {
    this.baseUrl = Config.mono.baseurl();
    this.baseUrlV3 = Config.mono.baseurlV3();
    this.monoSecKey = Config.mono.secretKey();
    this.lookUpSecretKey = Config.mono.lookup.secretKey();
    if (!this.monoSecKey) {
      throw new InternalServerErrorException(
        'Fatal Error :: Mono secret key is not set',
      );
    }
  }

  async exchangeToken(monoAuthCode: string) {
    const url = `${this.baseUrl}/accounts/auth`;
    const requestPayload = { code: monoAuthCode };
    return this.sendMonoApiRequest('POST', url, requestPayload);
  }

  async verifyIdentity(
    idType: $Enums.IdentificationType,
    idNumber: string,
    metadata: {
      firstName?: string | null;
      lastName?: string | null;
    } = {},
  ) {

  
    const idChannel = idType.toLowerCase();
    const url = `https://api.withmono.com/v3/lookup/${idChannel}`;

   
    let requestPayload: any = { number: idNumber, channel: idChannel };

    if (idType === $Enums.IdentificationType.NIN) {
      requestPayload = { nin: idNumber };
    } else if (idType === $Enums.IdentificationType.INTL_PASSPORT) {
      requestPayload = {
        passport_number: idNumber,
        last_name: metadata.lastName,
      };
    }

    console.log(requestPayload)
    const response = await this.sendMonoApiRequest('POST', url, requestPayload);
    return response;
  }

  protected async sendMonoApiRequest(
    method: 'POST' | 'GET',
    fullUrl: string,
    requestPayload: object | null = null,
  ) {
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'mono-sec-key': this.monoSecKey,
    };
    try {
      let response;

      if (method === 'POST') {
        response = await firstValueFrom(
          this.httpService.post(fullUrl, requestPayload, { headers }),
        );
        console.log(response)
      } else if (method === 'GET') {
        response = await firstValueFrom(
          this.httpService.get(fullUrl, { headers }),
        );
      } else {
        throw new Error('Unsupported HTTP method');
      }

      return {
        statusCode: 200,
        message: response.data?.message ?? 'Success',
        data: response.data,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  private handleError(error: any) {
    const errorResponse = error.response;
    const defaultMessage = 'An error occurred while connecting to the Mono API';
    const message =
      errorResponse?.data?.message ?? `${defaultMessage}: ${error.message}`;

    return {
      statusCode: errorResponse?.status ?? 500,
      message,
      data: errorResponse?.data ?? null,
    };
  }
}
