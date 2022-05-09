import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StripeButtonComponent } from './stripe-button/stripe-button.component';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [CommonModule, HttpClientModule],
  declarations: [
    StripeButtonComponent
  ],
  exports: [
    StripeButtonComponent
  ],
})
export class SharedWebModule {}
