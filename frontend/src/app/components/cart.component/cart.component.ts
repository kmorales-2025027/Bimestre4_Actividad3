import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { CartResponse } from '../../models/cart.model';
import { finalize } from 'rxjs';
import { SubtotalPipe } from '../../pipes/subtotal-pipe';
import { TotalCartPipe } from '../../pipes/total-cart-pipe';

@Component({
  imports: [CommonModule, ReactiveFormsModule, SubtotalPipe, TotalCartPipe],
  selector: 'app-cart',
  styleUrl: './cart.component.css',
  templateUrl: './cart.component.html',
})
export class CartComponent implements OnInit {
  private readonly cartService = inject(CartService);
  private readonly detector = inject(ChangeDetectorRef);

  cart: CartResponse[] = [];
  isLoading = false;
  errorMessage = '';
  actionMessage = '';
  retryMessage = 'Actualizar';

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.cartService
      .getFullCart()
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.detector.detectChanges();
        }),
      )
      .subscribe({
        next: (response) => {
          this.cart = response;
          this.retryMessage = 'Actualizar';
        },
        error: (error) => {
          this.errorMessage = this.getErrorMessage(error, 'No fue posible cargar el carrito.');
          this.retryMessage = 'Intenta Nuevamente';
        },
      });
  }

  deleteCart(item: CartResponse): void {
    const confirmed = window.confirm(`¿Deseas quitar el producto "${item.nombre}" del carrito?`);

    if (!confirmed) {
      return;
    }

    this.cartService.deleteCart(item.id).subscribe({
      next: () => {
        this.actionMessage = 'El producto se ha eliminado del carrito.';
        this.loadCart();
      },
      error: (error) => {
        this.errorMessage = this.getErrorMessage(error, 'No se pudo quitar el producto.');
      },
    });
  }

  private getErrorMessage(error: any, fallback: string): string {
    if (error.status === 0) {
      return 'No se pudo conectar con el backend.';
    }

    return error.error?.message ?? fallback;
  }
}
