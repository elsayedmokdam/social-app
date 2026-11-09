"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DBRepository = void 0;
class DBRepository {
    model;
    constructor(model) {
        this.model = model;
    }
    async create({ data, options, }) {
        return await this.model.create(data);
    }
}
exports.DBRepository = DBRepository;
