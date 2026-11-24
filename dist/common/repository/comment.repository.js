"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentRepository = void 0;
const models_1 = require("../../DB/models");
const base_repository_1 = require("./base.repository");
class CommentRepository extends base_repository_1.DBRepository {
    constructor() {
        super(models_1.CommentModel);
    }
}
exports.CommentRepository = CommentRepository;
