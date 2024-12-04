// Use crypto.randomUUID() to create unique IDs, see:
// https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
const { randomUUID } = require('crypto');
//const {logger} = require('../logger')
// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
//const contentType = require('content-type');

// Functions for working with fragment metadata/data using our DB
const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('./data');

class Fragment {
  static supportedTypes = ['text/plain', 'application/json', `text/markdown`, `text/html`]; // Define supported types

  constructor({ id, ownerId, created, updated, type, size = 0 }) {
    this.id = id ? id : randomUUID();
    if (!ownerId) {
      throw new Error('Missing required properties');
    }
    if (typeof size !== 'number' || size < 0) {
      throw new Error(`Size must be a number and greater than 0`);
    }
    if (!Fragment.isSupportedType(type)) {
      throw new Error(`Unsupported type`);
    }

    this.ownerId = ownerId;
    this.created = created ? created : new Date().toISOString();
    this.updated = updated ? updated : new Date().toISOString();
    this.type = type;
    this.size = size;
    this._mimeType = this.getMimeType(type);
  }

  getMimeType(type) {
    return type.split(';')[0].trim(); // Extract base type
  }

  /**
   * Get all fragments (id or full) for the given user
   * @param {string} ownerId user's hashed email
   * @param {boolean} expand whether to expand ids to full fragments
   * @returns Promise<Array<Fragment>>
   */
  static async byUser(ownerId, expand = false) {
    const fragment = listFragments(ownerId, expand);
    if (!fragment) {
      throw new Error(`Fragment not found for user ${ownerId}`);
    }
    return fragment;
  }

  /**
   * Gets a fragment for the user by the given id.
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<Fragment>
   */
  static async byId(ownerId, id) {
    const fragment = await readFragment(ownerId, id);
    if (!fragment) {
      throw new Error(`Fragment not found`);
    }
    return fragment;
  }

  /**
   * Delete the user's fragment data and metadata for the given id
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<void>
   */
  static async delete(ownerId, id) {
    try {
      await Fragment.byId(ownerId, id);
      await deleteFragment(ownerId, id);
    } catch (error) {
      throw new Error(
        `Failed to delete fragment with id ${id} for user ${ownerId}: ${error.message}`
      );
    }
  }

  /**
   * Saves the current fragment to the database
   * @returns Promise<void>
   */
  async save() {
    this.updated = new Date().toISOString(); // Update the timestamp before saving
    await writeFragment(this); // Save the fragment metadata

    // If there is data, save it as well
    if (this.data) {
      await writeFragmentData(this.ownerId, this.id, this.data);
    }
  }

  /**
   * Gets the fragment's data from the database
   * @returns Promise<Buffer>
   */
  async getData() {
    // Fetch the data from storage if not in memory
    if (!this.data) {
      this.data = await readFragmentData(this.ownerId, this.id);
    }
    return this.data; // Return the data property
  }

  /**
   * Set's the fragment's data in the database
   * @param {Buffer} data
   * @returns Promise<void>
   */
  async setData(data) {
    if (arguments.length === 0 || !(data instanceof Buffer)) {
      throw new Error('Data must be a Buffer'); // Validate input
    }
    this.data = data; // Set the new data
    this.size = data.length; // Update size based on new data
    //this.updated = new Date(); // Update the timestamp to reflect the new data
    await this.save(); // Save the updated fragment
  }

  /**
   * Returns the mime type (e.g., without encoding) for the fragment's type:
   * "text/html; charset=utf-8" -> "text/html"
   * @returns {string} fragment's mime type (without encoding)
   */
  get mimeType() {
    return this._mimeType; // Getter for mimeType
  }

  /**
   * Returns true if this fragment is a text/* mime type
   * @returns {boolean} true if fragment's type is text/*
   */
  get isText() {
    return this.mimeType.startsWith('text/');
  }

  /**
   * Returns the formats into which this fragment type can be converted
   * @returns {Array<string>} list of supported mime types
   */
  get formats() {
    return [this._mimeType]; // Getter for formats, derived from _mimeType
  }

  /**
   * Returns true if we know how to work with this content type
   * @param {string} value a Content-Type value (e.g., 'text/plain' or 'text/plain: charset=utf-8')
   * @returns {boolean} true if we support this Content-Type (i.e., type/subtype)
   */
  static isSupportedType(value) {
    const baseType = value.split(';')[0]; // Get the base type before any charset
    return this.supportedTypes.includes(baseType);
  }
}

module.exports.Fragment = Fragment;
