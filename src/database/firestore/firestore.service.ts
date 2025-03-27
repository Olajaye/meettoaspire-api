import { Injectable } from '@nestjs/common';
import { Firestore } from './firestore';
import { MessagingPayload } from 'firebase-admin/lib/messaging/messaging-api';
import * as admin from 'firebase-admin';
import { messaging } from "firebase-admin";
import TokenMessage = messaging.TokenMessage;
import { CustomLoggerService } from 'src/common-modules/custom-logger/custom-logger.service';

@Injectable()
export class FirestoreService {
  public db: FirebaseFirestore.Firestore;
  public usersCollection: FirebaseFirestore.CollectionReference;
  public chatsCollection: FirebaseFirestore.CollectionReference;
  public userChatsCollection: FirebaseFirestore.CollectionReference;

  constructor(
    private firebaseApp: Firestore,
    private logger: CustomLoggerService,
  ) {
    if (!firebaseApp) {
      throw new Error('Firebase app is not initialized.');
    }
    this.db = firebaseApp.app.firestore();
    this.chatsCollection = this.db.collection('chats');
    this.usersCollection = this.db.collection('users');
    this.userChatsCollection = this.db.collection('user_chats');
  }

  async sendPushNotification(payload: TokenMessage): Promise<void> {
    try {
      await admin
        .messaging()
        .send({ ...payload })
        .then((x) => this.logger.log('Notification sent to user', x));
    } catch (error) {
      this.logger.error('Error sending push notification:', error);
    }
  }
}
