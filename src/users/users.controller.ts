import { Controller, Post } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor() {}

  @ApiOkResponse()
  @Post()
  async getUserTypes() {
    return "HELLO"
  }
}
