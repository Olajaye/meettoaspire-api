import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { DataAccessorModule } from './common-modules/data-accessor/data-accessor.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CustomLoggerModule } from './common-modules/custom-logger/custom-logger.module';

@Module({
  imports: [
    DatabaseModule, 
    DataAccessorModule, 
    AuthModule, 
    UsersModule,
    CustomLoggerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
