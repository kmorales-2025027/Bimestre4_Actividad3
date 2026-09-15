import { Pipe, PipeTransform } from '@angular/core';
import { CartResponse } from '../models/cart.model';

@Pipe({
  name: 'totalCart',
  standalone: true,
})
export class TotalCartPipe implements PipeTransform {
  transform(cart: CartResponse[]): string {
    if (!cart || cart.length <= 0) {
      return '0.00';
    }

    let total: number = 0;

    cart.forEach(item => {
      total += Number(item.precio) * Number(item.cantidad);
    });

    return total.toFixed(2);
  }
}
