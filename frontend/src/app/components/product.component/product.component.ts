import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { finalize } from 'rxjs';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';

@Component({
  imports: [CommonModule, ReactiveFormsModule],
  selector: 'app-product',
  styleUrl: './product.component.css',
  templateUrl: './product.component.html',
})
export class ProductComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly detector = inject(ChangeDetectorRef);

  readonly productForm = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(60)]],
    precio: [0, [Validators.required, Validators.min(0.01), Validators.pattern(/^\d+(\.\d{1,2})?$/)]], // Solo se puede incrementar cada 0.01
    stock: [0, [Validators.required, Validators.min(0)]],
  });

  products: Product[] = [];
  editingProductId: number | null = null;
  isLoading = false;
  isSubmiting = false;
  errorMessage = '';
  formMessage = '';
  retryMessage = 'Actualizar';

  ngOnInit(): void {
    this.loadProducts();
  }

  searchError(field: string, error: string): boolean {
    const control = this.productForm.get(field);
    return ((control?.touched || control?.dirty) && control?.hasError(error)) || false;
  }

  loadProducts(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.productService
      .getProducts()
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.detector.detectChanges(); // Forzamos la renderización para que desaparezca el mensaje de cargando
        }),
      )
      .subscribe({
        next: (response) => {
          this.products = response;
          this.retryMessage = 'Actualizar';
        },
        error: (error) => {
          this.errorMessage = this.getErrorMessage(error, 'No fue posible cargar los productos.');
          this.retryMessage = 'Intenta Nuevamente';
        },
      });
  }

  submit(): void {
    this.formMessage = '';

    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const product = this.productForm.getRawValue();

    const request = this.editingProductId === null
      ? this.productService.postProduct(product)
      : this.productService.putProduct(this.editingProductId, product);

    const successMessage = this.editingProductId === null
      ? 'Producto registrado exitosamente.'
      : 'Producto actualizado exitosamente.';

    this.isSubmiting = true;
    request.pipe(
      finalize(() => {
        this.isSubmiting = false;
        this.detector.detectChanges();
      }),
    )
    .subscribe({
      next: () => {
        this.cancelEdit();
        this.formMessage = successMessage;
        this.loadProducts();
      },
      error: (error) => {
        this.errorMessage = this.getErrorMessage(error, 'No se pudo guardar el producto.');
      },
    });
  }

  editProduct(product: Product): void {
    this.formMessage = '';
    this.editingProductId = product.id;

    this.productForm.setValue({
      nombre: product.nombre,
      precio: Number(product.precio),
      stock: Number(product.stock),
    });
  }

  cancelEdit(): void {
    this.editingProductId = null;
    this.productForm.reset({ nombre: '', precio: 0, stock: 0 });
  }

  deleteProduct(product: Product): void {
    const confirmed = window.confirm(`¿Deseas eliminar el producto "${product.nombre}"?`);

    if (!confirmed) {
      return;
    }

    this.productService
      .deleteProduct(product.id)
      .subscribe({
        next: () => {
          if (this.editingProductId === product.id) {
            this.cancelEdit();
          }
          this.formMessage = 'Producto eliminado exitosamente.';
          this.loadProducts();
        },
        error: (error) => {
          this.errorMessage = this.getErrorMessage(error, 'No se pudo eliminar el producto.');
        },
      });
  }

  addToCart(product: Product): void {
    const cartItem = { id_producto: product.id, cantidad: 1 };

    this.cartService
      .postCart(cartItem)
      .pipe(finalize(() => {
        this.loadProducts();
        this.detector.detectChanges();
      }))
      .subscribe({
        next: () => {
          this.formMessage = `"${product.nombre}" se ha agregado al carrito.`;
        },
        error: (error) => {
          this.errorMessage = this.getErrorMessage(error, 'No se pudo agregar al carrito.');
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
