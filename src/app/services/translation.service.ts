import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  // private apiUrl = '/translate';

  // private apiUrl = 'https://api-free.deepl.com/v2/translate';  // DeepL API endpoint
  // private apiKey = '01d25672-2d78-49ab-89e4-e00c70d6e3b0:fx';  // Store API key in environment file
  private apiUrl = 'http://localhost:3000/translate';

  constructor(private http: HttpClient) { }

  translate(text: string, targetLang: string) {
    const payload = {
      text,
      target_lang: targetLang,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    const body = new URLSearchParams();
    body.set('text', text);
    body.set('target_lang', targetLang);

    return this.http.post(this.apiUrl, body.toString(), { headers });
  }
}
