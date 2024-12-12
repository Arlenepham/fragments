const markdownIt = require('markdown-it');
const { Fragment } = require('../../model/fragments'); 
const logger = require('../../logger');
const { createErrorResponse } = require('./../../response');
const md = new markdownIt();
const { htmlToText } = require('html-to-text');
const yaml = require('js-yaml');
const removeMd = require('remove-markdown')

module.exports = async (req, res) => {
  const { id, ext } = req.params;
  const ownerId = req.user; // Ensure req.user is properly populate

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
    const new_fragment = new Fragment(fragment);

    const fragmentData = await new_fragment.getData();
    
    if (!fragmentData) {
      logger.error('No data returned for fragment', { fragmentId: id });
      return res.status(404).json(createErrorResponse(404, 'Fragment data not found'));
    }

    if (fragment.type == 'text/plain')
    {
      if (ext != 'txt') {
        return res.status(400).json(createErrorResponse(400, 'Unsupported file extension'));
      }
      res.setHeader('Content-Type', new_fragment.type);
      res.status(200).send(fragmentData); 
    }

    else if (fragment.type == 'text/markdown')
    {
      if (ext != 'md' &&  ext != 'html'&& ext !='txt') {
        return res.status(400).json(createErrorResponse(400, 'Unsupported file extension'));
      }
      if(ext == 'md'){

        res.setHeader('Content-Type', 'markdown')
        res.status(200).send(fragmentData);
      }
      if (ext == 'txt') {
        
        let dataString = fragmentData.toString()
        const sendData = removeMd(dataString)
        res.setHeader('Content-Type', 'text/plain');
        res.status(200).send(sendData);      
      }
      if (ext == 'html')
      {
        const htmlData = md.render(fragmentData.toString());
        // const htmlData = marked(fragmentData)
        res.setHeader('Content-Type', 'text/html');
        res.status(200).type('html').send(htmlData);
      }
    }
    else if (fragment.type == 'text/html')
    {
      if (ext != 'html'&& ext !='txt') {
        return res.status(400).json(createErrorResponse(400, 'Unsupported file extension'));
      }
      if (ext == 'html')
        {
          //const htmlData = md.render(fragmentData.toString());
          res.status(200).type('html').send(fragmentData);
        }
      if (ext == 'txt')
      {
        //const htmlData = md.render(fragmentData.toString());
        let data = fragmentData.toString()
        const sendData = htmlToText(data);
        res.status(200).type('text').send(sendData);
      }
    }
    else if (fragment.type == 'text/csv')
      {
        if (ext != 'csv'&& ext !='txt'&&ext != 'json' ) {
          return res.status(400).json(createErrorResponse(400, 'Unsupported file extension'));
        }
        if (ext == 'csv'){
          res.status(200).type('csv').send(fragmentData);
        }
        if (ext == 'txt')
          {
            res.status(200).type('text').send(fragmentData);
          }
        if (ext == 'json')
        {
          const lines = fragmentData.toString().split("\n");
          const jsonObject = {};
          lines.forEach(line => {
            const [key, value] = line.split(",").map(item => item.trim()); // Split by comma and trim whitespace
            jsonObject[key] = value;
          });
        res.status(200).type('json').send(JSON.stringify(jsonObject));
        }
      }
    else if (fragment.type == 'application/json')
      { 
        if (ext != 'json'&& ext !='yaml'&&ext != 'yml' && ext != 'txt' ) {
          return res.status(400).json(createErrorResponse(400, 'Unsupported file extension'));
        }
        if (ext == 'json')
          {
          res.status(200).send(fragmentData);
          }
        if (ext == 'yaml' || ext == 'yml')
          {
            // Parse the JSON string to an object
            let jsonObject = JSON.parse(fragmentData.toString());
            // Convert JSON object to YAML string
            const yamlString = yaml.dump(jsonObject);
            res.status(200).type('yaml').send(yamlString);
          }
          if (ext == 'txt')
          {
            const jsonString = Buffer.from(fragmentData).toString('utf-8');
            let jsonObject
            jsonObject = JSON.parse(jsonString);
            const sendData = JSON.stringify(jsonObject, null, 2);
            res.status(200).type('text').send(sendData);
          }
      }
  } catch (error) {
    logger.error('Error fetching fragment', { message: error.message });
    res.status(500).json(createErrorResponse(500, error.message));
  }
};
