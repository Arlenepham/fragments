const { createSuccessResponse, createErrorResponse } = require('./../../response');
const { Fragment } = require('../../model/fragments');
const logger = require('../../logger');

// module.exports = async (req, res) => {
//   try {
//     const { id } = req.params; // Extract the ID from request parameters
//     const ownerId = req.user;

//     // Fetch the specific fragment by owner ID and fragment ID
//     const fragment = await Fragment.byId(ownerId, id);
//     if (!fragment) {
//       return res.status(404).json(createErrorResponse(404, 'Fragment not found')); // Return JSON for 404
//     }
//     // Check if the request is specifically for metadata (GET /fragments/:id/info)
//     if (req.path.endsWith('/info')) {
//       const fragmentMetadata = {
//         id: fragment.id,
//         ownerId: fragment.ownerId,
//         created: fragment.created,
//         updated: fragment.updated,
//         type: fragment.type,
//         size: fragment.size,
//       };

//       res.status(200).json(createSuccessResponse({ fragment: fragmentMetadata }));
//     } else {
//       const fragmentData = await fragment.getData();
//       res.status(200).json(createSuccessResponse({ fragment: fragmentData.toString() }));
//     }
//   } catch (error) {
//     logger.error('Error fetching fragment', { message: error.message });
//     res.status(500).json(createErrorResponse(500, 'Internal Server Error')); // Return JSON for 500 error
//   }
// };

module.exports = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user;

    const fragment = await Fragment.byId(ownerId, id);
    if (!fragment) {
      throw new Error('Fragment not found');
    }
    const new_fragment = new Fragment(fragment);


    // Check if the request is specifically for metadata (GET /fragments/:id/info)
    if (req.path.endsWith('/info')) {
      res.status(200).json(createSuccessResponse({
        fragment: {
            id: new_fragment.id,
            created: new_fragment.created,
            updated: new_fragment.updated, 
            ownerId: new_fragment.ownerId,
            type: new_fragment.type,
            size: new_fragment.size 
        }
    }));
    } else {
      const fragmentData = await new_fragment.getData();

      // Set Content-Type to match the fragment's type
      res.setHeader('Content-Type', new_fragment.type);

      res.status(200).send(fragmentData); // Send raw data
    }
  } catch (error) {
    if (error.message === 'Fragment not found') {
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }
    logger.error('Error fetching fragment', { message: error.message });
    res.status(500).json(createErrorResponse(500, error.message));
  }
};
