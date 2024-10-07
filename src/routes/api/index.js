// src/routes/api/index.js

/**
 * The main entry-point for the v1 version of the fragments API.
 */
const express = require('express');
// Create a router on which to mount our API endpoints
const router = express.Router();
const  rawBody  = require('../rawBody')
const  post  = require(`./post`)

// Define our first route, which will be: GET /v1/fragments
router.get('/fragments', require('./get'));
// Other routes (POST, DELETE, etc.) will go here later on...
router.post('/fragments', rawBody(), post);
router.get('/fragments/:id',require('./getByID')); // Route to get a fragment by its ID


module.exports = router;