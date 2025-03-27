import { Global, Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { FirestoreService } from './firestore/firestore.service';
import { Firestore } from './firestore/firestore';
import { CustomLoggerService } from 'src/common-modules/custom-logger/custom-logger.service';


@Global()
@Module({
  providers: [
    DatabaseService,
    Firestore,
    FirestoreService,
    CustomLoggerService
  ],
  exports: [DatabaseService, Firestore, FirestoreService],
})
export class DatabaseModule {}
