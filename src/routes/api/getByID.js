const { createSuccessResponse,createErrorResponse } = require('./../../response')
const { Fragment} = require('../../model/fragments');
const logger = require('../../logger');


module.exports = async (req, res) => {
    try {
        const { id } = req.params; // Extract the ID from request parameters
        const ownerId = req.user; 

        // Fetch the specific fragment by owner ID and fragment ID
        const fragment = await Fragment.byId(ownerId, id);
        if (!fragment) {
            return res.status(404).json(createErrorResponse(404, 'Fragment not found')); // Return JSON for 404
        }

        //getData() fetches the actual content of the fragment
        const fragmentData = await fragment.getData();

        // Send the success response with fragment data in JSON format
        res.status(200).json(createSuccessResponse({
            fragment: fragmentData.toString(), // Convert Buffer  to string if necessary
        }));
    } catch (error) {
        logger.error('Error fetching fragment', { message: error.message });
        res.status(500).json(createErrorResponse(500, 'Internal Server Error')); // Return JSON for 500 error
    }
};
