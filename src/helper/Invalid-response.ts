import { ApiProperty } from '@nestjs/swagger';

export class InValidResponse<T> {
  @ApiProperty({ example: false })
  public status = false;

  @ApiProperty({ example: 'Error' })
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
