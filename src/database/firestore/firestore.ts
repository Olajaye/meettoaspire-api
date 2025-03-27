import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import Config from '../../helper/config';

@Injectable()
export class Firestore {
  public app: admin.app.App;

  constructor() {
    try {
      const firebaseConfig  = Config.firebase();
      
      this.app = admin.initializeApp({
        credential: admin.credential.cert({
          projectId : firebaseConfig.project_id,
          privateKey : firebaseConfig.private_key,
          clientEmail : firebaseConfig.client_email
        }),
        databaseURL: `https://${firebaseConfig.project_id}.firebaseio.com`,
        // storageBucket: `${firebaseConfig.projectId}.appspot.com`,
      });
    } catch (error) {
      console.error('Failed to initialize Firebase:', error);
      throw error;
    }
  }
}
