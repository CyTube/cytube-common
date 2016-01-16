import knex from 'knex'
import bookshelf from 'bookshelf';

/** @module cytube-common/database/database */

/**
 * List of model classes to initialize.
 *
 * @type Array<string>
 */
const MODELS = [
    './models/user'
];

/**
 * Represents an interface to the database.  Holds the connection pool and ORM
 */
class Database {
    /**
     * Create a new Database and initializes it.
     *
     * @param {Object} dbConfig Knex configuration object
     * @see {@link http://knexjs.org/#Installation-client}
     */
    constructor(dbConfig) {
        this.dbConfig = dbConfig;
        this.init();
    }

    /**
     * Initialize the database connection and ORM.
     *
     * @private
     */
    init() {
        this.knex = knex(this.dbConfig);
        this.bookshelf = bookshelf(this.knex);
        this.bookshelf.plugin('registry');
        this.initModels();
    }

    /**
     * Initialize the database models.
     *
     * @private
     */
    initModels() {
        this.models = {};
        this.collections = {};
        MODELS.forEach(modulePath => {
            const { modelClass, collectionClass } = require(modulePath)(this.bookshelf);
            if (modelClass) {
                this.models[modelClass.prototype.modelName] = modelClass;
            }

            if (collectionClass) {
                this.collections[collectionClass.prototype.collectionName] = collectionClass;
            }
        });
    }
}

export default Database
