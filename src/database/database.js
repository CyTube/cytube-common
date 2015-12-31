import knex from 'knex'
import bookshelf from 'bookshelf';

const MODELS = [
    './models/user'
];

export default class Database {
    constructor(dbConfig) {
        this.dbConfig = dbConfig;
        this.init();
    }

    init() {
        this.knex = knex(this.dbConfig);
        this.bookshelf = bookshelf(this.knex);
        this.bookshelf.plugin('registry');
        this.initModels();
    }

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
