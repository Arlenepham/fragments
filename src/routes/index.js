// src/routes/index.js

const express = require('express');

// version and author from package.json
const { version, author } = require('../../package.json');
// Our authentication middleware
const { authenticate } = require('../auth');
const { createSuccessResponse } = require('./../response')
//const { rawBody } = require('./rawBody')
//const { post } = require(`./api/fragments`)
// Create a router that we can use to mount our API
const router = express.Router();

/**
 * Expose all of our API routes on /v1/* to include an API version.
 */
/**
 * Expose all of our API routes on /v1/* to include an API version.
 * Protect them all with middleware so you have to be authenticated
 * in order to access things.
 */
router.use(`/v1`, authenticate(), require('./api'));
/**
 * Define a simple health check route. If the server is running
 * we'll respond with a 200 OK.  If not, the server isn't healthy.
 */
router.get('/health', (req, res) => {
  const successResponse = createSuccessResponse()
  res.status(200).json(successResponse);
});
router.get('/', (req, res) => {
  // Client's shouldn't cache this response (always request it fresh)
  res.setHeader('Cache-Control', 'no-cache');
  // Send a 200 'OK' response
  res.status(200).json({
    status: 'ok',
    author,
    // Use your own GitHub URL for this!
    githubUrl: 'https://github.com/Arlenepham/fragments',
    version,
  });
  //router.post('/fragments', rawBody(), post);
});
// src/routes/index.js

const { hostname } = require('os');
router.get('/', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.status(200).json(
    createSuccessResponse({
      // TODO: make sure these are changed for your name and repo
      author: 'Arlene Pham',
      githubUrl: 'https://github.com/Arlenepham/fragments',
      version,
      // Include the hostname in the response
      hostname: hostname(),
    })
  );
});

module.exports = router;
