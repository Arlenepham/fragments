const { createSuccessResponse, createErrorResponse } = require('./../../response');
const { Fragment } = require('../../model/fragments');
const logger = require('../../logger');
const contentType = require('content-type');

module.exports = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user;

    const fragment = await Fragment.byId(ownerId, id);
    if (!fragment) {
      throw new Error('Fragment not found');
    }
    const contentTypeHeader = req.headers['content-type'];
    const { type } = contentType.parse(contentTypeHeader);
    const new_fragment = new Fragment(fragment);
    if (type !== new_fragment.type) {
      logger.warn(`${type} does not match with existing type (${new_fragment.type})`);
      throw new Error('Type mismatch');
    }
    try {
      await new_fragment.setData(req.body);
    } catch (err) {
      logger.error({ message: err.message }, 'Error saving fragment during PUT');
      return res.status(500).json(createErrorResponse(500, 'Internal Server Error'));
    }
    logger.info('Fragment updated successfully');

    // Send the success response
    res.status(201).json(
      createSuccessResponse({
        fragment: {
          id: new_fragment.id,
          created: new_fragment.created,
          updated: new_fragment.updated,
          ownerId: new_fragment.ownerId,
          type: new_fragment.type,
          size: new_fragment.size,
          formats: [new_fragment.type],
        },
      })
    );
  } catch (error) {
    if (error.message === 'Fragment not found') {
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }
    if (error.message === 'Type mismatch') {
      return res
        .status(400)
        .json(createErrorResponse(400, `A fragment's type can not be changed after it is created`));
    }

    logger.error('Error creating put request', { message: error.message });
    res.status(500).json(createErrorResponse(500, error.message));
  }
};
