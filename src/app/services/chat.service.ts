import { Injectable,inject  } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
import { Observable,BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ChatService {
  // constructor(private afs: AngularFirestore) {}
  
  private firestore: Firestore = inject(Firestore);
  private http: HttpClient = inject(HttpClient);
  private chatPopupSubject = new BehaviorSubject<boolean>(false);
  chatPopup$ = this.chatPopupSubject.asObservable();
  
  showChatPopup() {
    this.chatPopupSubject.next(true);
  }

  getMessages() {
    const messagesRef = collection(this.firestore, 'messages');
    const messagesQuery = query(messagesRef, orderBy('timestamp'));
    return collectionData(messagesQuery, { idField: 'id' });
  }
  
  sendMessage(sender: string, text: string) {
    const messagesRef = collection(this.firestore, 'messages');
    return addDoc(messagesRef, {
      sender,
      text,
      timestamp: Timestamp.now() // Modular Firestore timestamp
    });
  }

  generateReplyFromDeepSeek(emailText: string): Observable<string> {
    const apiUrl = 'https://api.deepseek.com/v1/chat'; // replace with actual endpoint
    const payload = {
      messages: [
        {
          role: 'user',
          content: `Reply to this email professionally and helpfully: ${emailText}`
        }
      ],
      model: 'deepseek-chat', // replace with the correct model if different
      temperature: 0.7
    };

    return this.http.post<string>(apiUrl, payload);
  }
 
}
