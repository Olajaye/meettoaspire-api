import { Module } from '@nestjs/common';
import { DataAccessorService } from './data-accessor.service';
import { DataAccessorController } from './data-accessor.controller';
import { DatabaseService } from 'src/database/database.service';

@Module({
  providers: [DataAccessorService, DatabaseService],
  controllers: [DataAccessorController]
})
export class DataAccessorModule {}
