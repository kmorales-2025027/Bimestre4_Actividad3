import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Cart, CartData } from '../models/cart.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/carrito`;

  getFullCart(): Observable<Cart[]> {
    return this.http.get<Cart[]>(`${this.apiUrl}/`);
  }

  getCart(id: number): Observable<Cart> {
    return this.http.get<Cart>(`${this.apiUrl}/${id}`);
  }

  postCart(cart: CartData): Observable<Cart> {
    return this.http.post<Cart>(`${this.apiUrl}/`, cart);
  }

  putCart(id: number, cart: CartData): Observable<Cart> {
    return this.http.put<Cart>(`${this.apiUrl}/${id}`, cart);
  }

  deleteCart(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
