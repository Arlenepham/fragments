const logger = require('../../logger');
const { Fragment } = require('../../model/fragments');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const contentType = require('content-type');

const post = async (req, res) => {
    try {
        // Parse the Content-Type header
        const contentTypeHeader = req.headers['content-type'];
        const { type } = contentType.parse(contentTypeHeader);

        // Check if the Content-Type is supported
        if (!Fragment.isSupportedType(type)) {
            logger.warn(`Unsupported Content-Type: ${type}`);
            return res.status(415).json(createErrorResponse(415, `Unsupported Content-Type`));
        }

        logger.debug('Creating a new fragment');

        // Create a new fragment with the ownerId and type
        const fragment = new Fragment({ ownerId: req.user, type });
        try{
            await fragment.setData(req.body);
        } catch(err)
        {
            logger.error({ message: err.message }, 'Error saving fragment during POST');
            return res.status(500).json(createErrorResponse(500, 'Internal Server Error'));
        }
     
        // Set the correct Location header in the HTTP response after creating a new resource
        const apiUrl = process.env.API_URL || `http://${req.headers.host}`;
        const locationUrl = `${apiUrl}/v1/fragments/${fragment.id}`; // Constructing the full URL to the newly created fragment

        logger.info('Fragment created successfully', { fragmentId: fragment.id, location: locationUrl });

        // Send the success response
        res.status(201)
            .location(locationUrl) // Set the Location header
            .json(createSuccessResponse({
                fragment: {
                    id: fragment.id,
                    created: fragment.created, 
                    updated: fragment.updated, 
                    ownerId: fragment.ownerId,
                    type: fragment.type,
                    size: fragment.size // Assuming size is available and calculated
                }
            }));
    } catch (error) {
        logger.error('Error creating fragment', { error: error.message });
        res.status(500).json(createErrorResponse(500, 'Internal Server Error'));
    }
};

module.exports = post;
