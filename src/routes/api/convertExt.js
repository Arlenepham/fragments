const markdownIt = require('markdown-it');
const { Fragment } = require('../../model/fragments'); 
const logger = require('../../logger');
const { createErrorResponse } = require('./../../response');
const md = new markdownIt();

module.exports = async (req, res) => {
  const { id, ext } = req.params;
  const ownerId = req.user; // Ensure req.user is properly populated

  if (ext !== 'html') {
    return res.status(400).json(createErrorResponse(400, 'Unsupported file extension'));
  }

  try {
    // Check if the ownerId is valid before querying
    if (!ownerId) {
      logger.error('User is not authenticated');
      return res.status(401).json(createErrorResponse(401, 'Unauthorized'));
    }

    const fragment = await Fragment.byId(ownerId, id);
    if (!fragment) {
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }

    const fragmentData = await fragment.getData();
    if (!fragmentData) {
      logger.error('No data returned for fragment', { fragmentId: id });
      return res.status(404).json(createErrorResponse(404, 'Fragment data not found'));
    }
    const htmlData = md.render(fragmentData.toString());
    res.status(200).type('html').send(htmlData);
  } catch (error) {
    logger.error('Error fetching fragment', { message: error.message, stack: error.stack });
    res.status(500).json(createErrorResponse(500, 'Internal Server Error'));
  }
}
