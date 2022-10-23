const express = require('express');
const { db } = require('../firestore');

const router = express.Router();

// create a new genre
router.post('/', async (req, res) => {

    // first validate request from client 
    const { error } = validateGenre(req.body);
    if(error) return res.status(400).send(error.details[0].message); 

    const genre = { name: req.body.name }

    try {
        const genreRef = await db.collection('genres').add(genre);
        res.send('Added successfully ' + genreRef.id);
    } catch (error) {
        res.send('something went wrong: ' + error.message);
    }
    
});

// get all available genres
router.get('/', async (req, res) => {

    try {
        const genreSnapshot = await db.collection('genres').get();
        const genres = [];
        genreSnapshot.forEach(doc => {
        genres.push(doc.data());
        });

        res.send(genres);

    } catch (error) {
        res.send('something went wrong ' + error.message);        
    }    
});

// get a single genre with a given id
router.get('/:id', async (req, res) => {
    const genreId = req.params.id;
    const genre = await db.collection('genres').doc(genreId).get();

    if(!genre.exists) return res.status(404).send('Genre with the given ID not found...');

    res.send(genre.data());
});

const validateGenre = (genre) => {
	const schema = Joi.object({
	    name: Joi.string().max(15).required()
	});
    return schema.validate(genre);
}

module.exports = router;