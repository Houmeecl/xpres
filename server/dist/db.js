"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.pool = void 0;
exports.createAnalyticsEvent = createAnalyticsEvent;
exports.getAnalyticsEvents = getAnalyticsEvents;
exports.getDailyEventCounts = getDailyEventCounts;
exports.getUserActivityStats = getUserActivityStats;
exports.getDocumentStats = getDocumentStats;
exports.getRevenueStats = getRevenueStats;
const serverless_1 = require("@neondatabase/serverless");
const neon_serverless_1 = require("drizzle-orm/neon-serverless");
const ws_1 = __importDefault(require("ws"));
const schema = __importStar(require("@shared/schema"));
const drizzle_orm_1 = require("drizzle-orm");
serverless_1.neonConfig.webSocketConstructor = ws_1.default;
if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}
exports.pool = new serverless_1.Pool({ connectionString: process.env.DATABASE_URL });
exports.db = (0, neon_serverless_1.drizzle)({ client: exports.pool, schema });
// Add the analytics methods to the DatabaseStorage class in storage.ts
// These need to be implemented to match the new interface methods
// These helper methods can be called from the DatabaseStorage class
async function createAnalyticsEvent(insertEvent) {
    const [event] = await exports.db
        .insert(schema.analyticsEvents)
        .values(insertEvent)
        .returning();
    return event;
}
async function getAnalyticsEvents(options) {
    let query = exports.db.select().from(schema.analyticsEvents);
    if (options) {
        if (options.startDate) {
            query = query.where((0, drizzle_orm_1.sql) `${schema.analyticsEvents.createdAt} >= ${options.startDate}`);
        }
        if (options.endDate) {
            query = query.where((0, drizzle_orm_1.sql) `${schema.analyticsEvents.createdAt} <= ${options.endDate}`);
        }
        if (options.eventType) {
            query = query.where((0, drizzle_orm_1.eq)(schema.analyticsEvents.eventType, options.eventType));
        }
        if (options.userId) {
            query = query.where((0, drizzle_orm_1.eq)(schema.analyticsEvents.userId, options.userId));
        }
    }
    const events = await query.orderBy((0, drizzle_orm_1.sql) `${schema.analyticsEvents.createdAt} DESC`);
    return events;
}
async function getDailyEventCounts(options) {
    let query = exports.db.select({
        date: (0, drizzle_orm_1.sql) `DATE(${schema.analyticsEvents.createdAt})`,
        count: (0, drizzle_orm_1.sql) `COUNT(*)`,
    })
        .from(schema.analyticsEvents);
    if (options) {
        if (options.startDate) {
            query = query.where((0, drizzle_orm_1.sql) `${schema.analyticsEvents.createdAt} >= ${options.startDate}`);
        }
        if (options.endDate) {
            query = query.where((0, drizzle_orm_1.sql) `${schema.analyticsEvents.createdAt} <= ${options.endDate}`);
        }
        if (options.eventType) {
            query = query.where((0, drizzle_orm_1.eq)(schema.analyticsEvents.eventType, options.eventType));
        }
    }
    const results = await query.groupBy((0, drizzle_orm_1.sql) `DATE(${schema.analyticsEvents.createdAt})`)
        .orderBy((0, drizzle_orm_1.sql) `DATE(${schema.analyticsEvents.createdAt})`);
    return results.map(r => ({
        date: r.date.toString(),
        count: Number(r.count)
    }));
}
async function getUserActivityStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 7);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const [totalCount] = await exports.db
        .select({ count: (0, drizzle_orm_1.sql) `COUNT(*)` })
        .from(schema.users);
    const [todayCount] = await exports.db
        .select({ count: (0, drizzle_orm_1.sql) `COUNT(*)` })
        .from(schema.users)
        .where((0, drizzle_orm_1.sql) `${schema.users.createdAt} >= ${today}`);
    const [weekCount] = await exports.db
        .select({ count: (0, drizzle_orm_1.sql) `COUNT(*)` })
        .from(schema.users)
        .where((0, drizzle_orm_1.sql) `${schema.users.createdAt} >= ${oneWeekAgo}`);
    const [monthCount] = await exports.db
        .select({ count: (0, drizzle_orm_1.sql) `COUNT(*)` })
        .from(schema.users)
        .where((0, drizzle_orm_1.sql) `${schema.users.createdAt} >= ${startOfMonth}`);
    return {
        totalUsers: Number(totalCount.count),
        newUsersToday: Number(todayCount.count),
        newUsersThisWeek: Number(weekCount.count),
        newUsersThisMonth: Number(monthCount.count)
    };
}
async function getDocumentStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [totalCount] = await exports.db
        .select({ count: (0, drizzle_orm_1.sql) `COUNT(*)` })
        .from(schema.documents);
    const [todayCount] = await exports.db
        .select({ count: (0, drizzle_orm_1.sql) `COUNT(*)` })
        .from(schema.documents)
        .where((0, drizzle_orm_1.sql) `${schema.documents.createdAt} >= ${today}`);
    const statusCounts = await exports.db
        .select({
        status: schema.documents.status,
        count: (0, drizzle_orm_1.sql) `COUNT(*)`
    })
        .from(schema.documents)
        .groupBy(schema.documents.status);
    const documentsByStatus = {};
    statusCounts.forEach(item => {
        documentsByStatus[item.status] = Number(item.count);
    });
    return {
        totalDocuments: Number(totalCount.count),
        documentsCreatedToday: Number(todayCount.count),
        documentsByStatus
    };
}
async function getRevenueStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 7);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    // Calculate document revenue
    const [documentTotal] = await exports.db
        .select({ total: (0, drizzle_orm_1.sql) `COALESCE(SUM(${schema.documents.paymentAmount}), 0)` })
        .from(schema.documents)
        .where((0, drizzle_orm_1.eq)(schema.documents.paymentStatus, 'completed'));
    // Calculate video call revenue
    const [videoCallTotal] = await exports.db
        .select({ total: (0, drizzle_orm_1.sql) `COALESCE(SUM(${schema.videoCallSessions.paymentAmount}), 0)` })
        .from(schema.videoCallSessions)
        .where((0, drizzle_orm_1.eq)(schema.videoCallSessions.paymentStatus, 'completed'));
    // Calculate today's revenue
    const [todayTotal] = await exports.db
        .select({ total: (0, drizzle_orm_1.sql) `COALESCE(SUM(${schema.documents.paymentAmount}), 0)` })
        .from(schema.documents)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.documents.paymentStatus, 'completed'), (0, drizzle_orm_1.sql) `${schema.documents.updatedAt} >= ${today}`));
    // Calculate week's revenue
    const [weekTotal] = await exports.db
        .select({ total: (0, drizzle_orm_1.sql) `COALESCE(SUM(${schema.documents.paymentAmount}), 0)` })
        .from(schema.documents)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.documents.paymentStatus, 'completed'), (0, drizzle_orm_1.sql) `${schema.documents.updatedAt} >= ${oneWeekAgo}`));
    // Calculate month's revenue
    const [monthTotal] = await exports.db
        .select({ total: (0, drizzle_orm_1.sql) `COALESCE(SUM(${schema.documents.paymentAmount}), 0)` })
        .from(schema.documents)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.documents.paymentStatus, 'completed'), (0, drizzle_orm_1.sql) `${schema.documents.updatedAt} >= ${startOfMonth}`));
    // For course revenue, we can add this later if needed
    const courseRevenue = 0;
    const documentRevenue = Number(documentTotal.total);
    const videoCallRevenue = Number(videoCallTotal.total);
    return {
        totalRevenue: documentRevenue + courseRevenue + videoCallRevenue,
        revenueToday: Number(todayTotal.total),
        revenueThisWeek: Number(weekTotal.total),
        revenueThisMonth: Number(monthTotal.total),
        documentRevenue,
        courseRevenue,
        videoCallRevenue
    };
}
