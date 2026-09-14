import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { finalize } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  imports: [CommonModule, ReactiveFormsModule],
  selector: 'app-product.component',
  styleUrl: './product.component.css',
  templateUrl: './product.component.html',
})
export class ProductComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly productService = inject(ProductService);

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
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response) => {
          this.products = response;
        },
        error: (error) => {
          this.errorMessage = this.getErrorMessage(error, 'No fue posible cargar los productos.');
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
    request.pipe(finalize(() => (this.isSubmiting = false))).subscribe({
      next: () => {
        this.cancelEdit();
        this.formMessage = successMessage;
        this.loadProducts();
      },
      error: (error) => {
        this.formMessage = this.getErrorMessage(error, 'No se pudo guardar el producto.');
      },
    });
  }

  editProduct(product: Product): void {
    this.formMessage = '';
    this.editingProductId = product.id;

    this.productForm.setValue({
      nombre: product.nombre,
      precio: product.precio,
      stock: product.stock,
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
      .pipe()
      .subscribe({
        next: () => {
          if (this.editingProductId === product.id) {
            this.cancelEdit();
          }
          this.formMessage = 'Producto eliminado exitosamente.';
        },
        error: (error) => {
          this.formMessage = this.getErrorMessage(error, 'No se pudo eliminar el producto.');
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
