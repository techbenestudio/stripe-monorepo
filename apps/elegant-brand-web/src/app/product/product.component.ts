import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'nx-stripe-workshop-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductComponent {
  @Input()
  name!: string;

  @Input()
  price!: number;

  @Input()
  img!: string;
}
