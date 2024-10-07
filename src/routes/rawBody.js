const express = require('express');
const contentType = require('content-type');
const { Fragment } = require('../model/fragments');

const rawBody = () =>
    express.raw({
      inflate: true,
      limit: '5mb',
      type: (req) => {
        // See if we can parse this content type. If we can, `req.body` will be
        // a Buffer (e.g., `Buffer.isBuffer(req.body) === true`). If not, `req.body`
        // will be equal to an empty Object `{}` and `Buffer.isBuffer(req.body) === false`
        const { type } = contentType.parse(req);
        return Fragment.isSupportedType(type);
      },
    });

module.exports = rawBody;