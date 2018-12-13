import Firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
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
     app = Firebase.app();
   } catch (e) {
     app = Firebase.initializeApp(this.config);
   }

   this.app = app;
   let db = this.db = app.firestore();

   db.settings({
     timestampsInSnapshots: true
   });

   this.readyPromise = db.enablePersistence({ experimentalTabSynchronization: true })
     .catch(function(err) {
        console.log('Firestore failed to enable offline support');
        console.error(err);
      });
 }

 static create(createArgs) {
   return new this(createArgs);
 }
}
