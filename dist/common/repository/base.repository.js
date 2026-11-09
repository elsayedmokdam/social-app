"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DBRepository = void 0;
class DBRepository {
    model;
    constructor(model) {
        this.model = model;
    }
    async create({ data, options, }) {
        return await this.model.create(data, options);
    }
    async createOne({ data, options = {}, }) {
        const [doc] = await this.create({ data: [data], options });
        return doc;
    }
    async findOne({ filter = {}, projection, options, }) {
        const doc = this.model.findOne(filter, projection);
        if (options?.populate) {
            doc?.populate(options.populate);
        }
        if (options?.lean) {
            doc?.lean(options.lean);
        }
        return await doc.exec();
    }
    async findById({ id, projection, options, }) {
        const doc = this.model.findById(id, projection);
        if (options?.populate) {
            doc?.populate(options.populate);
        }
        if (options?.lean) {
            doc?.lean(options.lean);
        }
        return await doc.exec();
    }
    async find({ filter, projection, options, }) {
        let { page = 1, limit = 10, sort, populate, lean = false } = options ?? {};
        page = Math.ceil(page < 1 ? 1 : page);
        limit = Math.ceil(limit < 1 ? 1 : limit);
        const skip = (page - 1) * limit;
        let query = this.model
            .find(filter)
            .select(projection ?? {})
            .skip(skip)
            .limit(page);
        if (sort)
            query = query.sort(sort);
        if (populate)
            query = query.populate(populate);
        const [data, total] = await Promise.all([
            lean ? query.lean().exec() : query.exec(),
            this.model.countDocuments(filter),
        ]);
        return {
            count: data.length,
            data,
            meta: {
                page: page,
                limit: limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async updateOne({ filter, update, options, }) {
        return await this.model.updateOne(filter, update, options);
    }
    async updateMany({ filter, update, options, }) {
        return await this.model.updateMany(filter, update, options);
    }
    async findOneAndUpdate({ filter = {}, update, options, }) {
        return await this.model.findOneAndUpdate(filter, update, {
            returnDocument: "after",
            ...options,
        });
    }
    async findByIdAndUpdate({ id, update, options, }) {
        return await this.model.findOneAndUpdate(id, update, {
            returnDocument: "after",
            ...options,
        });
    }
    async deleteOne({ filter, }) {
        return await this.model.deleteOne(filter);
    }
    async deleteMany({ filter, }) {
        return await this.model.deleteMany(filter);
    }
    async findOneAndDelete({ filter = {}, }) {
        return await this.model.findOneAndDelete(filter);
    }
    async findByIdAndDelete({ id, }) {
        return await this.model.findByIdAndDelete(id);
    }
}
exports.DBRepository = DBRepository;
