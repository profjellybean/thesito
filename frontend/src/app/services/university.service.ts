import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
@Injectable({
  providedIn: 'root',
})
export class UniversityService {
  private readonly apiUrl = 'https://api.ror.org/organizations';

  constructor(private http: HttpClient) {}

  getUniversities(query: string): Observable<any> {
    const params = { query: query };
    return this.http.get<any>(this.apiUrl, { params: params });
  }
}
