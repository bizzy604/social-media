"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLoaders = void 0;
const dataloader_1 = __importDefault(require("dataloader"));
const createLoaders = (prisma) => {
    // User loader - batches user queries by ID
    const userLoader = new dataloader_1.default(async (userIds) => {
        const users = await prisma.user.findMany({
            where: {
                id: { in: [...userIds] },
            },
        });
        // Map the users to the correct order of the requested IDs
        const userMap = users.reduce((map, user) => {
            map[user.id] = user;
            return map;
        }, {});
        return userIds.map(id => userMap[id] || null);
    });
    // Post loader - batches post queries by ID
    const postLoader = new dataloader_1.default(async (postIds) => {
        const posts = await prisma.post.findMany({
            where: {
                id: { in: [...postIds] },
            },
        });
        // Map the posts to the correct order of the requested IDs
        const postMap = posts.reduce((map, post) => {
            map[post.id] = post;
            return map;
        }, {});
        return postIds.map(id => postMap[id] || null);
    });
    return {
        userLoader,
        postLoader,
    };
};
exports.createLoaders = createLoaders;
//# sourceMappingURL=index.js.map