import { ApiProperty } from '@nestjs/swagger';

export class ValidResponse<T> {
  @ApiProperty({ example: true })
  public status = true;

  @ApiProperty({ example: 'Successful' })
  public message: string;

  @ApiProperty()
  public data: T | null;
  constructor(message: string, data: T | null = null) {
    this.message = message;
    this.data = data;
  }

  public getProperties(theCLASS) {
    return {
      status: { type: 'boolean' },
      message: { type: 'string' },
      data: { type: theCLASS },
    };
  }
}
