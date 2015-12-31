import crypto from 'crypto';
import Promise from 'bluebird';

function sha256(input) {
    const hash = crypto.createHash('sha256');
    hash.update(input);
    return hash.digest('base64');
}

module.exports = function initUserModel(bookshelf) {
    const User = bookshelf.Model.extend({
        modelName: 'User',
        tableName: 'users',
        hasTimestamps: false
    }, {
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
