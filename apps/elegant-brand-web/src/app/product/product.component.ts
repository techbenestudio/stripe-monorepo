import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'nx-stripe-workshop-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductComponent {
  @Input()
  productId!: number;

  @Input()
  name!: string;

  @Input()
  price!: number;

  @Input()
  img!: string;
}
