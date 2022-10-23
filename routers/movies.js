const express = require('express');
const Joi = require('joi');
const { db } = require('../firestore');

const router = express.Router();

// create a new movie
router.post('/', async (req, res) => {

    // first validate request from client
    const { error } = validateMovie(req.body);
    if(error) return res.status(400).send(error.details[0].message); 

    try {
        const genreId = req.body.genreId;
        const genre = await db.collection('genres').doc(genreId).get();

        if(!genre.exists) return res.status(404).send('Genre with the given ID not found...');
    
        const movie = {
            title: req.body.title,
            genre: genre.data(),
            numberInStock: req.body.numberInStock,
            dailyRentalRate: req.body.dailyRentalRate,
            price: req.body.price
        }
        const movieRef = await db.collection('movies').add(movie);
        res.send('Added successfully ' + movieRef.id);
    } catch (error) {
        res.send('something went wrong ' + error.message);
    }
});

// get all available movies
router.get('/', async (req, res) => {
    try {
        const movieSnapshot = await db.collection('movies').get();
        const genres = [];
        movieSnapshot.forEach(doc => {
        genres.push(doc.data());
        });

        res.send(genres);

    } catch (error) {
        res.send('something went wrong ' + error.message);        
    }    
});

//get a single movie with given id
router.get('/:id', async (req, res) => {
    const movieId = req.params.id;
    const movie = await db.collection('movies').doc(movieId).get();

    if(!movie.exists) return res.status(404).send('Genre with the given ID not found...');

    res.send(movie.data());
});

const validateMovie = (movie) => {
	const schema = Joi.object({
	    title: Joi.string().max(15).required(),
	    genreId: Joi.string().required(),
	    numberInStock: Joi.number().max(255).required(),
        dailyRentalRate: Joi.number().max(255).required(),
        price: Joi.number().max(255).required()
	});

    return schema.validate(movie);
}

module.exports = router;

