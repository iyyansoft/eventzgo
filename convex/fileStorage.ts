import { v } from "convex/values";
import { mutation } from "./_generated/server";

/**
 * Store a file in Convex storage and return the storage ID
 */
export const generateUploadUrl = mutation({
    args: {},
    handler: async (ctx) => {
        // Generate a short-lived upload URL
        return await ctx.storage.generateUploadUrl();
    },
});

/**
 * Save file metadata after upload
 */
export const saveFileMetadata = mutation({
    args: {
        storageId: v.string(),
        fileName: v.string(),
        fileType: v.string(),
        fileSize: v.number(),
        category: v.string(), // "gstCertificate", "panCard", etc.
    },
    handler: async (ctx, args) => {
        // Store file metadata
        const fileId = await ctx.db.insert("uploadedFiles", {
            storageId: args.storageId,
            fileName: args.fileName,
            fileType: args.fileType,
            fileSize: args.fileSize,
            category: args.category,
            uploadedAt: Date.now(),
        });

        return {
            fileId,
            storageId: args.storageId,
        };
    },
});

/**
 * Get file URL from storage ID
 */
export const getFileUrl = mutation({
    args: {
        storageId: v.string(),
    },
    handler: async (ctx, args) => {
        const url = await ctx.storage.getUrl(args.storageId);
        return url;
    },
});
