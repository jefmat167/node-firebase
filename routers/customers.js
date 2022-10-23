const express = require('express');
const { db } = require('../firestore');
const Joi = require('joi');

const router = express.Router();

//create a new customer
router.post('/', async (req, res) => {

    // first validate request from client
    const { error } = validateCustomer(req.body);
    if(error) return res.status(400).send(error.details[0].message); 

    const customer = {
        name: req.body.name,
        isGold: req.body.isGold,
        phone: req.body.phone
    }

    try {
        const customerRef = await db.collection('customers').add(customer);
        res.send('Added successfully ' + customerRef.id);
    } catch (error) {
        res.send('something went wrong ' + error.message);
    }
    
});

// get all available customers
router.get('/', async (req, res) => {

    try {
        const customerSnapshot = await db.collection('customers').get();
        const customers = [];
        customerSnapshot.forEach(doc => {
        customers.push(doc.data());
        });

        res.send(customers);

    } catch (error) {
        res.send('something went wrong ' + error.message);        
    }    
});

// get a single customer with a given id
router.get('/:id', async (req, res) => {
    const customerId = req.params.id;
    const customer = await db.collection('customers').doc(customerId).get();

    if(!customer.exists) return res.status(404).send('Customer with the given ID not found...');

    res.send(customer.data());
});

const validateCustomer = (customer) => {
	const schema = Joi.object({
	    name: Joi.string().max(15).required(),
	    isGold: Joi.boolean().required(),
	    phone: Joi.string().required()
	});
    return schema.validate(customer);
}

module.exports = router;