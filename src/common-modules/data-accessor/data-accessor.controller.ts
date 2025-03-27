import { Body, Controller, Post } from '@nestjs/common';
import { DataAccessorService } from './data-accessor.service';
import { DataAccessRequestDTO } from './dto/data-access-request.dto';
import { ApiOkResponse } from '@nestjs/swagger';
import { DataAccessDTO } from './dto/data-access.dto';

@Controller('data-accessor')
export class DataAccessorController {
  constructor(private readonly dataAccessorService: DataAccessorService) {}

  @ApiOkResponse({type: DataAccessDTO})
  @Post()
  async getUserTypes(@Body() requestOptions: DataAccessRequestDTO) {
    return await this.dataAccessorService.getEnumsAndTableData(requestOptions)
  }
}
