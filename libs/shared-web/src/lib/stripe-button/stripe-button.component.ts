import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IProduct } from '../product.models';

declare const Stripe: any;
type PaymentState = 'INIT' | 'LOADING' | 'SUCCESS' | 'ERROR';

@Component({
  selector: 'nx-stripe-workshop-stripe-button',
  templateUrl: './stripe-button.component.html',
  styleUrls: ['./stripe-button.component.css'],
})
export class StripeButtonComponent implements OnInit {
  @Input() amount = 0;
  @Input() productId = 0;
  @Input() currency = 'huf';
  @Input() label = 'Demo';

  static counter = 0;

  buttonId: number;
  stripe: any; // It is possible to install TypeScript typings for Stripe; we'll skip that for now
  canPay$ = new BehaviorSubject(true);
  paymentState$ = new BehaviorSubject('LOADING' as PaymentState);

  constructor(private http: HttpClient) {
    this.buttonId = StripeButtonComponent.counter++;
    this.stripe = Stripe(
      'pk_test_xxx', // your key here
      {
        apiVersion: '2020-08-27',
      }
    );
  }

  async ngOnInit() {
    const paymentRequest = this.stripe.paymentRequest({
      country: 'HU',
      currency: 'huf',
      total: {
        label: this.label,
        amount: this.amount * 100, // i.e. to pay 9.99, we have to pass 999 to Stripe
      },
      requestPayerName: true,
      requestPayerEmail: true,
    });
    const elements = this.stripe.elements();
    const prButton = elements.create('paymentRequestButton', {
      paymentRequest,
    });

    const result = await paymentRequest.canMakePayment();
    if (result) {
      prButton.mount('#stripe-button-' + this.buttonId);
      paymentRequest.on('paymentmethod', (ev: any) => this.pay(ev));
    } else {
	  // One-click payment is not available (app is not running on HTTPS or the browser has no access to saved cards)
      this.canPay$.next(false);
    }
    this.paymentState$.next('INIT');
  }

  async pay(ev: any) {
    this.paymentState$.next('LOADING');
    this.http
      .post<{ clientSecret: string }>('/api/stripe-init', {
        id: this.productId
      })
      .subscribe(async ({ clientSecret }) => {
        // Confirm the PaymentIntent without handling potential next actions (yet).
        const { paymentIntent, error: confirmError } =
          await this.stripe.confirmCardPayment(
            clientSecret,
            { payment_method: ev.paymentMethod.id },
            { handleActions: false }
          );

        if (confirmError) {
          // Report to the browser that the payment failed, prompting it to
          // re-show the payment interface, or show an error message and close
          // the payment interface.
          ev.complete('fail');
          this.paymentState$.next('ERROR');
        } else {
          // Report to the browser that the confirmation was successful, prompting
          // it to close the browser payment method collection interface.
          ev.complete('success');
          // Check if the PaymentIntent requires any actions and if so let Stripe.js
          // handle the flow.
          if (paymentIntent.status === 'requires_action') {
            // Let Stripe.js handle the rest of the payment flow.
            const { error } = await this.stripe.confirmCardPayment(
              clientSecret
            );
            if (error) {
              this.paymentState$.next('ERROR');
            } else {
              this.success();
            }
          } else {
            this.success();
          }
        }
      });
  }

  async success() {
    this.paymentState$.next('SUCCESS');
    // In a real-word app, we would probably also tell the backend about this and/or the backend could listen to a Stripe webhook.
  }
}