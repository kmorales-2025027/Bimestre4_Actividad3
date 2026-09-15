import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { CartResponse, CartData } from '../models/cart.model';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/carrito`;

  getFullCart(): Observable<CartResponse[]> {
    return this.http.get<CartResponse[]>(`${this.apiUrl}/`);
  }

  getCart(id: number): Observable<CartResponse> {
    return this.http.get<CartResponse>(`${this.apiUrl}/${id}`);
  }

  postCart(cart: CartData): Observable<CartResponse> {
    return this.http.post<CartResponse>(`${this.apiUrl}/`, cart);
  }

  putCart(id: number, cart: CartData): Observable<CartResponse> {
    return this.http.put<CartResponse>(`${this.apiUrl}/${id}`, cart);
  }

  deleteCart(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
