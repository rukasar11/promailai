import { Injectable,inject  } from '@angular/core';
// import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map } from 'rxjs/operators';
import {
  Firestore,
  collection,
  query,
  orderBy,
  addDoc,
  collectionData,
  Timestamp
} from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ChatService {
  // constructor(private afs: AngularFirestore) {}
  
  private firestore: Firestore = inject(Firestore);

  private chatPopupSubject = new BehaviorSubject<boolean>(false);
  chatPopup$ = this.chatPopupSubject.asObservable();
  
  showChatPopup() {
    this.chatPopupSubject.next(true);
  }

  // getMessages() {
  //   return this.afs.collection('messages', ref => ref.orderBy('timestamp'))
  //     .valueChanges();
  // }

  getMessages() {
    const messagesRef = collection(this.firestore, 'messages');
    const messagesQuery = query(messagesRef, orderBy('timestamp'));
    return collectionData(messagesQuery, { idField: 'id' });
  }

  // sendMessage(sender: string, text: string) {
  //   return this.afs.collection('messages').add({
  //     sender,
  //     text,
  //     timestamp: new Date()
  //   });
  // }
  
  sendMessage(sender: string, text: string) {
    const messagesRef = collection(this.firestore, 'messages');
    return addDoc(messagesRef, {
      sender,
      text,
      timestamp: Timestamp.now() // Modular Firestore timestamp
    });
  }

}
