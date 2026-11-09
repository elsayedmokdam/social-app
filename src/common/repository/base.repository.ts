import {
  CreateOptions,
  DeleteResult,
  FlattenMaps,
  HydratedDocument,
  PopulateOptions,
  ProjectionType,
  QueryFilter,
  QueryOptions,
  UpdateQuery,
  UpdateWriteOpResult,
} from "mongoose";
import { AnyKeys, Model } from "mongoose";
import { MongoDBId } from "../types";
import { FindOptions, FindResult } from "../interface";
import { UpdateWithAggregationPipeline } from "mongoose";
import { MongooseUpdateQueryOptions } from "mongoose";

export abstract class DBRepository<TRawDocType> {
  constructor(protected model: Model<TRawDocType>) {}

  // ============== CREATE ==============
  // ------- Prototype Overloading ------
  // Create One (Without Options):
  async create({
    data,
  }: {
    data: AnyKeys<TRawDocType>;
  }): Promise<HydratedDocument<TRawDocType>>;

  // Create Many (Without Options):
  async create({
    data,
    options,
  }: {
    data: AnyKeys<TRawDocType>[];
    options?: CreateOptions;
  }): Promise<HydratedDocument<TRawDocType>[]>;

  //------- Method implementations ------
  async create({
    data,
    options,
  }: {
    data: AnyKeys<TRawDocType> | AnyKeys<TRawDocType>[];
    options?: CreateOptions;
  }): Promise<HydratedDocument<TRawDocType> | HydratedDocument<TRawDocType>[]> {
    return await this.model.create(data as any, options);
  }

  // CreateOne (With Options):
  async createOne({
    data,
    options = {},
  }: {
    data: AnyKeys<TRawDocType>;
    options?: CreateOptions;
  }): Promise<HydratedDocument<TRawDocType>> {
    const [doc] = await this.create({ data: [data] as any, options });
    return doc!;
  }

  // ============== FIND ONE ==============
  // ------- Prototype Overloading ------
  // Find One (Without lean = false):
  async findOne({
    filter,
    projection,
    options,
  }: {
    filter: QueryFilter<TRawDocType>;
    projection?: ProjectionType<TRawDocType> | null | undefined;
    options?: (QueryOptions<TRawDocType> & { lean?: false }) | null | undefined;
  }): Promise<HydratedDocument<TRawDocType> | null>;

  // Find One (With lean = true):
  async findOne({
    filter,
    projection,
    options,
  }: {
    filter: QueryFilter<TRawDocType>;
    projection?: ProjectionType<TRawDocType> | null | undefined;
    options?: (QueryOptions<TRawDocType> & { lean?: true }) | null | undefined;
  }): Promise<FlattenMaps<HydratedDocument<TRawDocType>> | null>;

  // ------ Method implementations ------
  async findOne({
    filter = {},
    projection,
    options,
  }: {
    filter: QueryFilter<TRawDocType>;
    projection?: ProjectionType<TRawDocType> | null | undefined;
    options?:
      | (QueryOptions<TRawDocType> & { lean?: boolean })
      | null
      | undefined;
  }): Promise<
    | HydratedDocument<TRawDocType>
    | FlattenMaps<HydratedDocument<TRawDocType>>
    | null
  > {
    const doc = this.model.findOne(filter, projection);
    if (options?.populate) {
      doc?.populate(options.populate as PopulateOptions[]);
    }

    if (options?.lean) {
      doc?.lean(options.lean);
    }
    return await doc.exec();
  }

  // ============== FIND BY ID ==============
  // ------- Prototype Overloading ------
  // Find One (Without lean = false):
  async findById({
    id,
    projection,
    options,
  }: {
    id: MongoDBId;
    projection?: ProjectionType<TRawDocType> | null | undefined;
    options?: (QueryOptions<TRawDocType> & { lean?: false }) | null | undefined;
  }): Promise<HydratedDocument<TRawDocType> | null>;

  // Find One (With lean = true):
  async findById({
    id,
    projection,
    options,
  }: {
    id: MongoDBId;
    projection?: ProjectionType<TRawDocType> | null | undefined;
    options?: (QueryOptions<TRawDocType> & { lean?: true }) | null | undefined;
  }): Promise<FlattenMaps<HydratedDocument<TRawDocType>> | null>;

  // ------ Method implementations ------
  async findById({
    id,
    projection,
    options,
  }: {
    id: MongoDBId;
    projection?: ProjectionType<TRawDocType> | null | undefined;
    options?:
      | (QueryOptions<TRawDocType> & { lean?: boolean })
      | null
      | undefined;
  }): Promise<
    | HydratedDocument<TRawDocType>
    | FlattenMaps<HydratedDocument<TRawDocType>>
    | null
  > {
    const doc = this.model.findById(id, projection);
    if (options?.populate) {
      doc?.populate(options.populate as PopulateOptions[]);
    }

    if (options?.lean) {
      doc?.lean(options.lean);
    }
    return await doc.exec();
  }

  // ============== FIND ==============
  // ------ Prototype Overloading ------
  // Find (with lean = false)
  async find(args: {
    filter?: QueryFilter<TRawDocType>;
    projection?: ProjectionType<TRawDocType> | null;
    options?: FindOptions<TRawDocType> & { lean?: false };
  }): Promise<FindResult<HydratedDocument<TRawDocType>>>;

  // Find (With lean = true)
  async find(args: {
    filter?: QueryFilter<TRawDocType>;
    projection?: ProjectionType<TRawDocType> | null;
    options: FindOptions<TRawDocType> & { lean: true };
  }): Promise<FindResult<FlattenMaps<HydratedDocument<TRawDocType>>>>;

  // ------ Method implementations ------
  async find({
    filter,
    projection,
    options,
  }: {
    filter?: QueryFilter<TRawDocType>;
    projection?: ProjectionType<TRawDocType> | null;
    options?: FindOptions<TRawDocType>;
  }): Promise<
    | FindResult<HydratedDocument<TRawDocType>>
    | FindResult<FlattenMaps<HydratedDocument<TRawDocType>>>
  > {
    let { page = 1, limit = 10, sort, populate, lean = false } = options ?? {};

    page = Math.ceil(page < 1 ? 1 : page);
    limit = Math.ceil(limit < 1 ? 1 : limit);

    const skip = (page - 1) * limit;

    let query = this.model
      .find(filter)
      .select(projection ?? {})
      .skip(skip)
      .limit(page);

    if (sort) query = query.sort(sort);

    if (populate) query = query.populate(populate);

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
    } as
      | FindResult<HydratedDocument<TRawDocType>>
      | FindResult<FlattenMaps<HydratedDocument<TRawDocType>>>;
  }

  // ============== UPDATE ONE ==============
  // ------ Method Implementations ------
  async updateOne({
    filter,
    update,
    options,
  }: {
    filter: QueryFilter<TRawDocType>;
    update: UpdateQuery<TRawDocType> | UpdateWithAggregationPipeline;
    options?: MongooseUpdateQueryOptions<TRawDocType> | null;
  }): Promise<UpdateWriteOpResult> {
    return await this.model.updateOne(filter, update, options);
  }

  // ============== UPDATE MANY ==============
  // ------ Method Implementations ------
  async updateMany({
    filter,
    update,
    options,
  }: {
    filter: QueryFilter<TRawDocType>;
    update: UpdateQuery<TRawDocType> | UpdateWithAggregationPipeline;
    options?: MongooseUpdateQueryOptions<TRawDocType> | null;
  }): Promise<UpdateWriteOpResult> {
    return await this.model.updateMany(filter, update, options);
  }

  // ============== FIND ONE AND UPDATE ==============
  // ------ Method Implementations ------
  async findOneAndUpdate({
    filter = {},
    update,
    options,
  }: {
    filter?: QueryFilter<TRawDocType>;
    update?: UpdateQuery<TRawDocType>;
    options?: QueryOptions<TRawDocType> | null;
  }): Promise<HydratedDocument<TRawDocType> | null> {
    return await this.model.findOneAndUpdate(filter, update, {
      returnDocument: "after",
      ...options,
    });
  }

  // ============== FIND BY ID AND UPDATE ==============
  // ------ Method Implementations ------
  async findByIdAndUpdate({
    id,
    update,
    options,
  }: {
    id: MongoDBId;
    update?: UpdateQuery<TRawDocType>;
    options?: QueryOptions<TRawDocType> | null;
  }): Promise<HydratedDocument<TRawDocType> | null> {
    return await this.model.findOneAndUpdate(id, update, {
      returnDocument: "after",
      ...options,
    });
  }

  // ============== DELETE ONE ==============
  // ------ Method Implementations ------
  async deleteOne({
    filter,
  }: {
    filter: QueryFilter<TRawDocType>;
  }): Promise<DeleteResult> {
    return await this.model.deleteOne(filter);
  }

  // ============== DELETE MANY ==============
  // ------ Method Implementations ------
  async deleteMany({
    filter,
  }: {
    filter?: QueryFilter<TRawDocType>;
  }): Promise<DeleteResult> {
    return await this.model.deleteMany(filter);
  }

  // ============== FIND ONE AND DELETE ==============
  // ------ Method Implementations ------
  async findOneAndDelete({
    filter = {},
  }: {
    filter?: QueryFilter<TRawDocType>;
  }): Promise<HydratedDocument<TRawDocType> | null> {
    return await this.model.findOneAndDelete(filter);
  }

  // ============== FIND BY ID AND DELETE ==============
  // ------ Method Implementations ------
  async findByIdAndDelete({
    id,
  }: {
    id: MongoDBId;
  }): Promise<HydratedDocument<TRawDocType> | null> {
    return await this.model.findByIdAndDelete(id);
  }
}
