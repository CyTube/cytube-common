import crypto from 'crypto';
import Promise from 'bluebird';

/** @module cytube-common/database/models/user */

/**
 * Compute the SHA-256 hash of the input, digested as a base64 string.
 *
 * @param {string} input Input to hash
 * @returns {string} Base64 encoded SHA-256 digest
 */
function sha256(input) {
    const hash = crypto.createHash('sha256');
    hash.update(input);
    return hash.digest('base64');
}

/**
 * Initialize the <code>User</code> model.
 *
 * @function initUserModel
 * @param {Bookshelf} bookshelf Bookshelf instance
 * @returns {Object} <code>{modelClass: User}</code>
 */
module.exports = function initUserModel(bookshelf) {
    /**
     * Model representing a registered user.
     *
     * @class User
     */
    const User = bookshelf.Model.extend({
        modelName: 'User',
        tableName: 'users',
        hasTimestamps: false
    }, {
        /**
         * Verifies that a provided session cookie is valid.
         *
         * @param {string} sessionCookie Session cookie to validate
         * @returns {Promise<User|Error>} Promise that resolves to a
         * <code>User</code> model or rejects with an <code>Error</code>
         * describing why the verification failed.
         * @memberof User
         * @static
         */
        verifySession: function verifySession(sessionCookie) {
            if (typeof sessionCookie !== 'string') {
                return Promise.reject(new TypeError(
                        'Expected sessionCookie to be a string'
                ));
            }

            const [name, expiration, salt, hash] = sessionCookie.split(':');
            if (!name || !expiration || !salt || !hash) {
                return Promise.reject(new Error(
                    'Invalid session cookie'
                ));
            }

            if (Date.now() > parseInt(expiration, 10)) {
                return Promise.reject(new Error('Session expired'));
            }

            return this.forge({ name: name }).fetch().then(user => {
                const hashInput = [
                    user.get('name'),
                    user.get('password'),
                    expiration,
                    salt
                ].join(':');

                if (sha256(hashInput) !== hash) {
                    throw new Error('Invalid session cookie');
                }

                return user;
            });
        }
    });

    bookshelf.model('User', User);

    return {
        modelClass: User
    };
};
