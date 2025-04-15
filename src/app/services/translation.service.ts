import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})  
export class TranslationService {

  constructor(private http: HttpClient) {}

  // API_BASE = 'https://translate.argosopentech.com';
  API_BASE = 'https://libretranslate.com'; // or any other working mirror

  private readonly API_KEY = 'AIzaSyDTy97x1TudHyfTLAOXF3bXGPw4mbVZ510';

  detectLanguage(text: string): Observable<any> {
    // return this.http.post<any>('https://libretranslate.de/detect', {
    //   q: text
    // });
    const cleanText = this.extractPlainTextFromHTML(text);
    const rowtext = this.cleanText(cleanText);
    const snippet = rowtext.substring(0, 300);
    console.log('Detecting language from snippet:', snippet);
    // return this.http.post<any>(`${this.API_BASE}/detect`, { q: rowtext });
    const url = 'https://libretranslate.com/detect';
    const body = {
      q: snippet
    };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  
    return this.http.post<any>(url, body, { headers });  
  }

  private extractPlainTextFromHTML(html: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  }

  cleanText(rawText: string): string {
    return rawText
      .replace(/\n+/g, ' ')         // Replace newlines with space
      .replace(/\s+/g, ' ')         // Collapse multiple spaces
      .trim();                      // Trim leading/trailing spaces
  }

  translateToEnglish(text: string, sourceLang: string): Observable<any> {
    // return this.http.post<any>('https://libretranslate.de/translate', {
    //   q: text,
    //   source: sourceLang,
    //   target: 'en',
    //   format: 'text'
    // });
    return this.http.post<any>(`${this.API_BASE}/translate`, {
      q: text,
      source: sourceLang,
      target: 'en',
      format: 'text'
    });
  }

}
