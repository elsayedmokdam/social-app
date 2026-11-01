"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationService = void 0;
class AuthenticationService {
    constructor() { }
    signup = async (data) => {
        console.log({ data });
        return "Test";
    };
}
exports.AuthenticationService = AuthenticationService;
exports.default = new AuthenticationService();
