/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import * as express from 'express';

const app = express();

app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to fashion-backend!' });
});

app.use('/api/static', express.static(__dirname + '/assets'));

app.use(express.json());

const elegantProducts = [
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

app.get('/api/elegant', (req, res) => {
  res.send({
    products: elegantProducts,
  });
});

const sportyProducts = [
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

app.get('/api/sporty', (req, res) => {
  res.send({
    products: sportyProducts,
  });
});

app.post('/api/stripe-init', async (req, res) => {
  const stripe = require('stripe')(
    'sk_test_xxx' // your key here
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

const port = process.env.port || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
