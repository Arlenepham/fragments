// src/routes/api/get.js
const { createSuccessResponse,createErrorResponse } = require('./../../response')
const { Fragment } = require('../../model/fragments');
const logger = require('../../logger');


/**
 * Get a list of fragments for the current user
 */
module.exports = async (req, res) => {
  try {
    const ownerId = req.user; 
    const expand = req.query.expand === '1'; 

    
    logger.debug(`Fetching fragments for user: ${ownerId}`);
    
    // Fetch the user's fragments (only IDs by default, no need for full fragment details)
    const fragments = await Fragment.byUser(ownerId, expand); // Pass 'false' to only get IDs
    
    // Return a list of fragment IDs in the response
    res.status(200).json(createSuccessResponse({fragments}));
    
  } catch (error) {
    logger.error('Error fetching fragments', { error: error.message });
    res.status(500).json(createErrorResponse(500, 'Internal Server Error'));
  }
};
