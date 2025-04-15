import { Injectable } from '@angular/core';

declare const google: any;
declare const gapi: any;

@Injectable({
  providedIn: 'root'
})
export class GmailService {
  private readonly CLIENT_ID = '61178546523-sf6cpcn5bhgjl2bnoascmk8fiqn4bvv4.apps.googleusercontent.com';
  private readonly API_KEY = 'AIzaSyDTy97x1TudHyfTLAOXF3bXGPw4mbVZ510';
  private readonly SCOPES = 'https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/gmail.compose';
  // private readonly SCOPES = 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.compose';
  private tokenClient: any;
  private accessToken: string = '';
  private initialized: boolean = false;

  constructor() {
    const savedToken = sessionStorage.getItem('gmailAccessToken');
    if (savedToken) {
      this.accessToken = savedToken;
      this.initClient().then(() => {
        gapi.client.setToken({ access_token: this.accessToken });
      });
    }
  }

  async initClient(): Promise<void> {
    if (this.initialized) return;

    await this.loadGapiScript();

    await new Promise<void>((resolve, reject) => {
      gapi.load('client', async () => {
        try {
          await gapi.client.init({
            apiKey: this.API_KEY,
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest']
          });
          console.log('✅ gapi.client initialized:', gapi.client);
          this.initialized = true;
          resolve();
        } catch (error) {
          console.error('❌ gapi.client initialization failed:', error);
          reject(error);
        }
      });
    });
  }

  async getLatestEmail(): Promise<{ subject: string, snippet: string }> {
    const res = await gapi.client.gmail.users.messages.list({
      userId: 'me',
      maxResults: 1,
      labelIds: ['INBOX'],
    });

    const message = res.result.messages?.[0];
    if (!message) return { subject: '', snippet: '' };

    const msg = await gapi.client.gmail.users.messages.get({
      userId: 'me',
      id: message.id,
    });

    const headers = msg.result.payload.headers;
    const subject = headers.find((h: any) => h.name === 'Subject')?.value || 'No subject';
    const snippet = msg.result.snippet;

    return { subject, snippet };
  }

  async authenticate(): Promise<void> {
    await this.initClient();

    return new Promise((resolve, reject) => {
      this.tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: this.CLIENT_ID,
        scope: this.SCOPES,
        callback: (response: any) => {
          if (response.error) {
            reject(response);
          } else {
            console.log('✅ Gmail Access Token:', response.access_token);
            this.accessToken = response.access_token;
            sessionStorage.setItem('gmailAccessToken', this.accessToken);
            gapi.client.setToken({ access_token: response.access_token });
            resolve();
          }
        }
      });

      this.tokenClient.requestAccessToken();
    });
  }


  isSignedIn(): boolean {
    return !!this.accessToken;
  }

  signOut(): void {
    google.accounts.id.disableAutoSelect();
    this.accessToken = '';
    sessionStorage.clear();
  }

  async listMessages(label: string,pageToken: string = ''): Promise<{ messages: any[]; nextPageToken?: string }> {
    if (!this.accessToken) {
      throw new Error('User is not authenticated.');
    }
    const labelMap: any = {
      CATEGORY_PRIMARY: ['INBOX', 'CATEGORY_PERSONAL'],
      CATEGORY_SOCIAL: ['CATEGORY_SOCIAL'],
      CATEGORY_PROMOTIONS: ['CATEGORY_PROMOTIONS']
    };

    const labelIds = labelMap[label] || ['INBOX'];  // fallback


    const response = await gapi.client.gmail.users.messages.list({
      userId: 'me',
      maxResults: 5,
      labelIds,
      pageToken
    });

    // return response.result.messages || [];
    return {
      messages: response.result.messages || [],
      nextPageToken: response.result.nextPageToken
    };
  }

  async getMessage(messageId: string): Promise<any> {
    const response = await gapi.client.gmail.users.messages.get({
      userId: 'me',
      id: messageId
    });
    return response.result;
  }

  private loadGapiScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      const scriptId = 'gapiScript';
      if (document.getElementById(scriptId)) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => resolve();
      script.onerror = () => reject('Failed to load gapi script');
      document.body.appendChild(script);
    });
  }
  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    console.log('📤 Sending email to:', to); 

    const email =
      `To: ${to}\r\n` +
      `Subject: ${subject}\r\n` +
      `Content-Type: text/html; charset=UTF-8\r\n\r\n` +
      `${body}`;
  
    const encodedEmail = btoa(email).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  
    await gapi.client.gmail.users.messages.send({
      userId: 'me',
      resource: {
        raw: encodedEmail
      }
    });
  }

  async deleteMessage(messageId: string): Promise<void> {
    await gapi.client.gmail.users.messages.trash({
      userId: 'me',
      id: messageId
    });
  }
  
  async archiveMessage(messageId: string): Promise<void> {
    await gapi.client.gmail.users.messages.modify({
      userId: 'me',
      id: messageId,
      removeLabelIds: ['INBOX']
    });
  }  
  
  async getLatestEmailWithId(): Promise<{ subject: string, snippet: string, id: string }> {
    const res = await gapi.client.gmail.users.messages.list({
      userId: 'me',
      maxResults: 1,
      labelIds: ['INBOX'],
    });
  
    const message = res.result.messages?.[0];
    if (!message) return { subject: '', snippet: '', id: '' };
  
    const msg = await gapi.client.gmail.users.messages.get({
      userId: 'me',
      id: message.id,
    });
  
    const headers = msg.result.payload.headers;
    const subject = headers.find((h: any) => h.name === 'Subject')?.value || 'No subject';
    const snippet = msg.result.snippet;
  
    return { subject, snippet, id: message.id };
  }
}
