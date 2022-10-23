const express = require('express');
const { db } = require('../firestore');
const Joi = require('joi');

const router = express.Router();

//create a new rental
router.post('/', async (req, res) => {

    // first validate request from client
    const { error } = validateRental(req.body);
    if(error) return res.status(400).send(error.details[0].message); 

    try {
        //first check if the customer renting the movie exists
        const customerId = req.body.customerId;
        const customer = await db.collection('customers').doc(customerId).get();
        if(!customer.exists) return res.status(404).send('Customer with the given ID not found...');

        //first check if the movie to be rented exists
        const movieId = req.body.movieId;
        const movieRef = db.collection('movies').doc(movieId);
        const _movie = await movieRef.get();
        if(!_movie.exists) return res.status(404).send('Movie with the given ID not found...');

        //if movie exists but out of stock, return a corresponding message
        if(_movie.data().numberInStock === 0) return res.send('Movie is out of stock...');         
    
        const rental = {
            customer: customer.data(),
            movie: {
                title: _movie.data().title,
                genre: _movie.data().genre.name
            } 
        }
        
        //complete the rental and the updating of number of the movie left in stock in a single, atomic operation.
        const trans = await db.runTransaction(async () => {
            await db.collection('rentals').add(rental);
            await movieRef.update({numberInStock: _movie.data().numberInStock - 1});
        });
        
        res.send('Rent successful ' + trans);
    } catch (error) {
        res.send('something went wrong ' + error);
        console.log(error);
    }
});

//get all available rentals
router.get('/', async (req, res) => {

    try {
        const rentalSnapshot = await db.collection('rentals').get();
        const rentals = [];
        rentalSnapshot.forEach(doc => {
        rentals.push(doc.data());
        });

        res.send(rentals);

    } catch (error) {
        res.send('something went wrong ' + error.message);        
    }    
});

// get a single rental with a given id
router.get('/:id', async (req, res) => {
    const rentalId = req.params.id;
    const rental = await db.collection('rentals').doc(rentalId).get();

    if(!rental.exists) return res.status(404).send('Rental with the given ID not found...');

    res.send(rental.data());
});

const validateRental = (rental) => {
	const schema = Joi.object({
	    customerId: Joi.string().required(),
	    movieId: Joi.string().required()
	});

    return schema.validate(rental);
}

module.exports = router;