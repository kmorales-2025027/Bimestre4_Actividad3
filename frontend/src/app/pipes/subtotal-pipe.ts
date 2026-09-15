import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'subtotal',
  standalone: true,
})
export class SubtotalPipe implements PipeTransform {
  transform(precio: number | string, cantidad: number | string): string {
    const precioNumber = Number(precio);
    const cantidadNumber = Number(cantidad);

    if (!Number.isFinite(precioNumber) || !Number.isFinite(cantidadNumber)) {
      return '0.00';
    }
    return (precioNumber * cantidadNumber).toFixed(2);
  }
}
