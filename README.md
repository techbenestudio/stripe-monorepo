# Prerequisites

- A free ngrok account
- A Stripe account
- Node 14+ (nvm recommended)
- Google Chrome
- install nx tools with `npm i -g nx`
- install nx http-server with `npm i -g http-server`
- VS Code with the Nx Console extension installed. Git Graph extension is also recommended.
- [some assets we prepared](https://github.com/techbenestudio/stripe-monorepo)

# Creating the workspace

Pick a folder to work in and run:

```
npx create-nx-workspace@13.4.5 nx-stripe-workshop
```

- Choose the `angular` template, the app name should be `elegant-brand-web`; choose CSS as stylesheet format and `no` for the nx cloud
- It will install a lot of stuff - will take a while. Like, really.
- When done, open it in VS Code:

# BREAK

# Exploring the workspace, creating apps

```
cd ./nx-stripe-workshop
code .
```

Now we have an empty workspace with a single Angular app (and a cypress-based e2e testing project). Feel free to explore the project folders a bit before moving on.

Notice that it also initialized a git repo and made the first commit.

We'll also add another angular app and a node app as backend. To do the latter, we also add the node and express plugins to the workspace:

```
npm i -D @nrwl/node @nrwl/express
```

Now, in VS Code, open the Nx Console, pick generate, and then pick `@nrwl/express – application`

- Name: fashion-backend
- frontendProject: elegant-brand-web

The rest can stay as default. Click Run.

It's a good idea to commit changes after creating an empty app or lib in a workspace:

```
git add .
git commit -m "add backend"
```

In the Nx Console, pick generate, and then pick `@nrwl/angular – application`

- Name: sporty-brand-web
- backendProject: fashion-backend

The rest can stay as default. Click Run.

Open `apps/sporty-brand-web/proxy.conf.json` and change its contents to:

```
{
  "/api": {
    "target": "http://localhost:3333",
    "secure": false
  }
}
```

so that it targets the same API as the first app.


Again, it's a good idea to commit changes after creating an empty app or lib in a workspace:

```
git add .
git commit -m "add second app"
```

Time to run the apps...

- `nx serve <app name>` compiles and runs an app (with hot reload) – we'll use it to run both the frontend and the backend projects
- `nx test <app name>` and `nx lint <app name>` runs tests and linting respectively – we won't delve into this during the workshop

# Product listing in our apps - backend

Open `apps/fashion-backend/src/main.ts` and create two endpoints for our product listings. For the images we need to serve these as static images. Copy the `assets` folder from the git repo to `apps/fashion-backend/src/assets`. Add these lines to `main.ts`:

```
app.use('/api/static', express.static(__dirname + '/assets'));

app.get('/api/elegant', (req, res) => {
  res.send({
    products: [
      {
        id: 1,
        name: 'fancy shoes',
        img: '/api/static/fancy-shoes.jpg',
        price: 10000,
      },
      {
        id: 2,
        name: 'fancy overall',
        img: '/api/static/fancy-overall.jpg',
        price: 30000,
      },
      {
        id: 3,
        name: 'suit',
        img: '/api/static/suit.jpg',
        price: 100000,
      },
    ],
  });
});

app.get('/api/sporty', (req, res) => {
  res.send({
    products: [
      {
        id: 4,
        name: 'running shoes',
        img: '/api/static/running-shoe.jpg',
        price: 10000,
      },
      {
        id: 5,
        name: 'sweatpants',
        img: '/api/static/sweatpants.jpg',
        price: 30000,
      },
      {
        id: 6,
        name: 'arctic jacket',
        img: '/api/static/arctic-jacket.jpg',
        price: 100000,
      },
    ],
  });
});
```

Now run the backend with `nx serve fashion-backend`.

# BREAK

# Product listing in our apps - frontend

In the folder tree, select `apps/elegant-brand-web/src/app`, and right click, select `Nx generate`, type `component`, hit `enter`. 

- Component name: product
- Change detection: OnPush

Rest can be left default. Click Run. Not only does this add the files for the component, but also edits the app module to make it available to the application, by adding it to declarations.

On that note, delete `NxWelcomeComponent` from the app module, and delete `nx-welcome.component.ts`.

Also add `HttpClientModule` to the `imports` array. VS Code should be able to import it, but if it doesn't, this is the proper import statement:

`import { HttpClientModule } from '@angular/common/http';`

Now we get to type a bit:

## product.component.ts`

```
export class ProductComponent {

  @Input()
  name!: string;

  @Input()
  price!: number;

  @Input()
  img!: string;
}
```

Also change the import line

`import { Component, Input, ChangeDetectionStrategy } from '@angular/core';`

## product.component.html

```
<div class="product">
  <div class="heading">{{name}}</div>
  <img [src]="img">
  <div class="details">
    <span>{{price}} HUF</span>
    <button>BUY NOW</button>
  </div>
</div>
```

## product.models.ts

_(This is a new file that should be created in `elegant-brand-web/src/app`)_

```
export interface IProduct {
  name: string;
  price: number;
  img: string;
}
```

NOTE: both apps will need this, so we'll move it to a shared library later.

## app.component.ts

```
export class AppComponent implements OnInit {

  constructor(private http: HttpClient) {
  }

  ngOnInit(): void {
    this.http.get<{ products: IProduct[] }>('/api/elegant').subscribe(res => {
        this.products = res.products;
    })
  }

  products: IProduct[] | null = null;
}
```

(Use VS Code's actions to add missing import statements)

NOTE: in a real-world angular app, we would:

- create a separate component for the product listing; the app component is usually quite empty and is just used a as a container (for menus, headers, main etc.)
- certainly not put HTTP requests in components – using Redux is highly recommended. (In angular, the Ngrx library is the de facto standard for that.)

## app.component.html

```
<ng-container *ngIf='products; else loading'>
    <ng-container *ngFor='let product of products'>
        <nx-stripe-workshop-product [name]='product.name' [price]='product.price'></nx-stripe-workshop-product>
    </ng-container>
</ng-container>

<ng-template #loading>
    Loading...
</ng-template>
```

Angular's template syntax is not super straightforward to write at first, but it's easy to read; as long as we have `products`, we iterate over them and instantiate our product component for each. If they are not ready, we show a loading indicator.

## Put it all together...

In two separate terminals, run:

- `nx serve fashion-backend` (if it's not running already)
- `nx serve elegant-brand-web`

and open the webapp in a browser (http://localhost:4200/). We should see the product listing.

# BREAK

# Listing in the second app, creation of a shared library

In the folder tree, select `apps/sporty-brand-web/src/app`, and right click, select `Nx generate`, type `component`, hit `enter`. 

- Component name: product
- Change detection: OnPush

Rest can be left default. Click Run. Not only does this add the files for the component, but also edits the app module to make it available to the application, by adding it to declarations.

On that note, delete `NxWelcomeComponent` from the app module, and delete `nx-welcome.component.ts`.

Also add `HttpClientModule` to the `imports` array. VS Code should be able to import it, but if it doesn't, this is the proper import statement:

`import { HttpClientModule } from '@angular/common/http';`

Now we can just copy the content of `product.component.ts` and `product.component.html`. (Our two frontend apps will be basically the same this way – please use your imagination to pretend that the two apps differ a bit more than they are, as we don't have time to make them complex enough to actually do that 😊)

## Sharing product.models in a library

Now you may remember that the next thing we did was adding an interface for products. But we really don't want to copy-paste that! Time to create the shared library.

Click the Nx Console button in VS Code's sidebar, click Generate. Select `@nrwl/angular - library`.

- Name: shared-web
- the rest can stay as-is

Click Run.

Then in `apps/elegant-brand-web/src/app`, right-click `product.models.ts`, click Cut.

Then select `libs/shared-web/src/lib`, right click on the `lib` node and click Paste. Say no to updating imports for now.

In `libs/shared-web/src/index.ts`, add this line:

`export * from './lib/product.models';`

Then in `apps/elegant-brand-web/src/app/app.component.ts`, change `import { IProduct } from './product.models';` to `import { IProduct } from '@nx-stripe-workshop/shared-web';`

Now we can carry on working on the second app! Open `apps/sporty-brand-web/src/app` and make these changes:

## app.component.ts

```
export class AppComponent implements OnInit {

  constructor(private http: HttpClient) {
  }

  ngOnInit(): void {
    this.http.get<{ products: IProduct[] }>('/api/sporty').subscribe(res => {
        this.items = res.products;
    })
  }

  items: IProduct[] | null = null;
}
```

(Use VS Code's actions to add missing import statements)

## app.component.html

```
<ng-container *ngIf='items; else loading'>
    <ng-container *ngFor='let item of items'>
        <nx-stripe-workshop-item [name]='item.name' [price]='item.price'></nx-stripe-workshop-item>
    </ng-container>
</ng-container>

<ng-template #loading>
    Loading...
</ng-template>
```

## Give them a go!

(This is probably a good time to commit our changes.)

In two separate terminals, run:

- `nx serve fashion-backend` (if it's not running already)
- `nx serve elegant-brand-web` (if it's not running already)
- `nx serve sporty-brand-web --port 4201` (we change the port so that it can run side-by-side with the other app) 

and open the webapps in a browser (http://localhost:4200/ and http://localhost:4201/). We should see the product listing in both of them.


## Make them look apart
Copy 'style.css' from the repo to `apps/sporty-brand-web/src/styles.css` and `apps/sporty-brand-web/src/styles.css`. Thanks to some css trickery the same css can be used to style
both versions. You just need to add a class to the root of your application. Add the following classes in each apps `index.html`:
```
<html lang="en" class="elegant">
  ...
</html>


<html lang="en" class="sporty">
  ...
</html>
```


# Implementing Stripe Pay, testing Google Pay

First, stop our running apps. Then right-click `shared-web > src > lib` and select `Nx generate` => `component` again. Call it `stripe-button`, and add a checkmark to `export`; leave the rest as-is and click Run.

Add this script reference to `index.html` in both apps: `<script src="https://js.stripe.com/v3/"></script>`

Let's start with the backend code. First, install `stripe` with `npm i stripe` and then update our server app:

## main.ts

Put this before the first `app.get` call:

```
app.use(express.json());
```

Also refactor your product lists to variables, like this:

```
const elegantProducts =  [
    {
      id: 1,
      name: 'fancy shoes',
      img: '/api/static/fancy-shoes.jpg',
      price: 10000,
    },
    {
      id: 2,
      name: 'fancy overall',
      img: '/api/static/fancy-overall.jpg',
      price: 30000,
    },
    {
      id: 3,
      name: 'suit',
      img: '/api/static/suit.jpg',
      price: 100000,
    },
  ];

const sportyProducts =  [
  {
    id: 4,
    name: 'running shoes',
    img: '/api/static/running-shoe.jpg',
    price: 10000,
  },
  {
    id: 5,
    name: 'sweatpants',
    img: '/api/static/sweatpants.jpg',
    price: 30000,
  },
  {
    id: 6,
    name: 'arctic jacket',
    img: '/api/static/arctic-jacket.jpg',
    price: 100000,
  },
];


app.get('/api/elegant', (req, res) => {
  res.send({
    products: elegantProducts,
  });
});

app.get('/api/sporty', (req, res) => {
  res.send({
    products: sportyProducts,
  });
});
```

Finally, add our new endpoint – this will be called as part of the payment process.

```
app.post('/api/stripe-init', async (req, res) => {
  const stripe = require('stripe')(
    'sk_test_xxx' //your key here
  );

  const product = [...elegantProducts, ...sportyProducts].find(p => p.id === req.body.id);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: product.price * 100, // i.e. to pay 9.99, we have to pass 999 to Stripe
    currency: 'huf',
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});
```

> Note: one could think of passing in the price and currency to this method directly (instead of using the product ID and looking the price up) – but that would actually be a security risk, which could enable our users to set their own prices. This way, even if the client is tampered with, the backend makes sure that the correct price must be used.

Now extend our interface, then write our component:

## product.models.ts

```
export interface IProduct { 
    id: number; // this is the new bit
    name: string;
    price: number;
    img: string;
}
```

## stripe-button.component.ts

```
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
```

> NOTE: `canPay$` and `paymentState$` are represented as observables rather than plain fields to aid the change detection mechanism, which normally "loses track" inbetween async-await calls. Other possible solutions would be calling the change detector explicitly whenever we change these properties (which is quite error-prone) or refactoring the Stripe logic into a service, and then "plugging in" `canPay` and `paymentState` as component inputs (which always get proper change detection) – that would actually be the "real-world" preferred way of doing it, but during this workshop we just go for the simpler, observables-based solution.

## stripe-button.component.html

```
<div [id]="'stripe-button-' + buttonId" *ngIf="canPay$ | async; else fallback"></div>

<div [ngSwitch]="paymentState$ | async">
    <p *ngSwitchCase="'LOADING'">Loading...</p>
    <p *ngSwitchCase="'SUCCESS'">Thank you!</p>
    <p *ngSwitchCase="'ERROR'">Oh no :(</p>
</div>

<ng-template #fallback>
    <!-- Fallback button. In a full solution, clicking this should show a "regular" credit card form, using Stripe or anything else -->
    <button>Buy now</button>
</ng-template>

```

## shared-web.module.ts

Just add `import { HttpClientModule } from '@angular/common/http';` at the top and `HttpClientModule` to the `imports` array.

Then we can start using it in our apps:

- Import `SharedWebModule` in both app modules (`import { SharedWebModule } from '@nx-stripe-workshop/shared-web';` at the top and then add it to the `imports` array)
- Change the product components as follows:


## product.component.ts

Add this input:

```
  @Input()
  productId!: number;
```

## product.component.html

Replace the current button with this:

```
<nx-stripe-workshop-stripe-button [amount]="price" currency="HUF" [label]="name" [productId]="productId"></nx-stripe-workshop-stripe-button>
```

## elegant-brand-web/.../app.component.html

Set the `productId` attribute on this line:

```
<nx-stripe-workshop-product [name]='product.name' [price]='product.price' [productId]='product.id'></nx-stripe-workshop-product>
```

And we are done!

Time to try it out:

- Run `./ngrok http 4200` (in the folder where you have your ngrok binaries) to start our proxy (we need this to access the app through HTTPS, which is required for Stripe Pay). Take note of your URL (the one over https).
- Run `nx serve fashion-backend` and `nx serve elegant-brand-web --disable-host-check` in separate terminals. (The extra flag on the second call is needed for ngrok to be able to access our local Angular development server.)
- If you are signed into Chrome with your actual Google account, and that _account_ has a saved Google Pay card, you can open your ngrok URL now and you should see the Google Pay button next to our products. You can click on them, but don't click Pay – you wouldn't want to pay with your real card. Instead, create a new profile in Chrome by clicking your profile icon, and selecting "Continue without an account". (Again, if you are not signed into Chrome, you can skip this.)
- Save [a Stripe test card](https://stripe.com/docs/testing) in Chrome by visiting `chrome://settings/payments`. Be careful to avoid testing with your actual card!
- Open your ngrok URL in a browser. (Be sure to use the one with https.) The Stripe pay buttons should appear (which is basically the same as a Google Pay button, just different branding), and you should be able to complete your purchase. In case you added a test card requiring 3DS validation, the 3DS UI should trigger automatically as well.

> _Some more details on the button branding:_ Stripe uses a generic branding ("Stripe Pay") on the button for cards saved locally in the browser – this is what we tried now. If you sign in to Chrome with your Google Account and have Google Pay set up, you'll see the Google Pay branding. With this same codebase we have written, we _could_ also active the Apple Pay branding in Safari (for users that have Apple Pay set up), but that needs an additional domain verification step (which we couldn't even complete with a free ngrok account) – that is out of scope for this workshop.

> _Troubleshooting – if you see the fallback button:_ Verify that you have opened the HTTPS version of the ngrok URL and that you have a saved card set up _locally_ in Chrome. If both are true, and it still does not work, open [https://stripe.com/docs/stripe-js/elements/payment-request-button](https://stripe.com/docs/stripe-js/elements/payment-request-button). If you see the button _there_, then the issue is in your application. But if that page shows _"Either your browser does not support the Payment Request API, or you do not have a saved payment method."_ then either you _still_ didn't save the test card properly (which is unlikely at this point), or there are issues on Stripe's or Google's side outside your control (which, sadly, happens sometimes). If all else fails, you can at least _partially_ test your application by opening your ngrok URL with a Chrome profile that _does_ have a Google Pay card set up – that scenario is much less error prone than locally saved cards (and in the "real world", much more common anyway), so if nothing else, that one should make the button show up. Just be sure to not complete the payment flow to avoid charges on your real card.
