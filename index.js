const express = require('express');
const customers = require('./routers/customers');
const genres = require('./routers/genres');
const movies = require('./routers/movies');
const rentals = require('./routers/rentals');
// const { db } = require('./firestore');

const app = express();
app.use(express.json());

app.use('/api/customers', customers);
app.use('/api/genres', genres);
app.use('/api/movies', movies);
app.use('/api/rentals', rentals);

app.listen(3030, () => {
    console.log('listening on port 3030');
});



