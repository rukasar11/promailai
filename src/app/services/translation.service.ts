import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private apiUrl = 'http://localhost:3000/nvidia-chat';
  private apiKey = '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'; // Replace with a secure environment variable

  constructor(private http: HttpClient) {}

  translate(text: string, targetLang: string): Observable<any> {
    alert(1);
    const prompt = `Translate the following text to ${targetLang}:\n\n${text}`;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    });
    alert(2);
    const payload = {
      model: 'google/gemma-7b', // or 'mistralai/mixtral-8x22b'
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 1000
    };

    return this.http.post(this.apiUrl, payload, { headers });
  }
}
