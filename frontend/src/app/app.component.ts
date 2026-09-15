import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProductComponent } from './components/product.component/product.component';
import { CartComponent } from './components/cart.component/cart.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ProductComponent, CartComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  protected readonly title = signal('frontend');
}
