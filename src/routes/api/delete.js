const { createSuccessResponse, createErrorResponse } = require('./../../response');
const { Fragment } = require('../../model/fragments');
const logger = require('../../logger');

module.exports = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user;

    // const fragment = await Fragment.byId(ownerId, id);
    // if (!fragment) {
    //   return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    // }
    await Fragment.delete(ownerId, id);
    logger.info({ ownerId, id }, 'Fragment deleted');
    res.status(200).json(createSuccessResponse());
  } catch (error) {
    if (error.message) {
      res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }
    logger.error('Error fetching fragment', { message: error.message });
    res.status(500).json(createErrorResponse(500, 'Error occurred while deleting fragment'));
  }
};
