import firebase from 'firebase';
import { getOwner } from '@ember/application';

export default class FirebaseService {
 constructor(createArgs) {
   Object.assign(this, createArgs);

   const config = getOwner(createArgs).resolveRegistration('config:environment');

   if (!config || typeof config.firebase !== 'object') {
     throw new Error('Please set the `firebase` property in your environment config.');
   }

   this.config = config.firebase;
   this.app = null;
   this.db = null;
   this.connect();
 }

 connect() {
   if (this.app !== null) {
     return;
   }
   let app;

   try {
     app = firebase.app();
   } catch (e) {
     app = firebase.initializeApp(this.config);
   }

   this.app = app;
   this.db = app.firestore();

   this.db.settings({
     timestampsInSnapshots: true
   });
 }

 static create(createArgs) {
   return new this(createArgs);
 }
}
