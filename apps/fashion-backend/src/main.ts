/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import * as express from 'express';

const app = express();

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

const port = process.env.port || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
