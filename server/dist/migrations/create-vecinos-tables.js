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
const serverless_1 = require("@neondatabase/serverless");
const neon_serverless_1 = require("drizzle-orm/neon-serverless");
const schema = __importStar(require("../shared/vecinos-schema"));
const ws_1 = __importDefault(require("ws"));
// Configurar WebSocket para Neon DB
serverless_1.neonConfig.webSocketConstructor = ws_1.default;
// Crear las tablas de Vecinos Express
async function createVecinosTables() {
    if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL must be set");
    }
    const pool = new serverless_1.Pool({ connectionString: process.env.DATABASE_URL });
    const db = (0, neon_serverless_1.drizzle)(pool, { schema });
    try {
        console.log("Creando tablas de Vecinos Express...");
        // Crear tabla de socios (vecinos_partners)
        await pool.query(`
      CREATE TABLE IF NOT EXISTS vecinos_partners (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        store_name TEXT NOT NULL,
        business_type TEXT NOT NULL,
        address TEXT NOT NULL,
        city TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        owner_name TEXT NOT NULL,
        owner_rut TEXT NOT NULL,
        owner_phone TEXT NOT NULL,
        bank_name TEXT,
        account_type TEXT,
        account_number TEXT,
        commission_rate INTEGER DEFAULT 20 NOT NULL,
        balance INTEGER DEFAULT 0 NOT NULL,
        status TEXT DEFAULT 'pending' NOT NULL,
        avatar_url TEXT,
        last_login_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
        console.log("Tabla vecinos_partners creada");
        // Crear tabla de documentos (vecinos_documents)
        await pool.query(`
      CREATE TABLE IF NOT EXISTS vecinos_documents (
        id SERIAL PRIMARY KEY,
        partner_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        type TEXT NOT NULL,
        price INTEGER NOT NULL,
        status TEXT DEFAULT 'pending' NOT NULL,
        client_name TEXT NOT NULL,
        client_rut TEXT NOT NULL,
        client_phone TEXT NOT NULL,
        client_email TEXT,
        verification_code TEXT NOT NULL UNIQUE,
        commission_rate INTEGER DEFAULT 20 NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
        console.log("Tabla vecinos_documents creada");
        // Crear tabla de transacciones (vecinos_partner_transactions)
        await pool.query(`
      CREATE TABLE IF NOT EXISTS vecinos_partner_transactions (
        id SERIAL PRIMARY KEY,
        partner_id INTEGER NOT NULL,
        document_id INTEGER,
        amount INTEGER NOT NULL,
        type TEXT NOT NULL,
        status TEXT DEFAULT 'pending' NOT NULL,
        description TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        completed_at TIMESTAMP
      );
    `);
        console.log("Tabla vecinos_partner_transactions creada");
        // Crear tabla de solicitudes de retiro (vecinos_withdrawal_requests)
        await pool.query(`
      CREATE TABLE IF NOT EXISTS vecinos_withdrawal_requests (
        id SERIAL PRIMARY KEY,
        partner_id INTEGER NOT NULL,
        amount INTEGER NOT NULL,
        bank_name TEXT NOT NULL,
        account_type TEXT NOT NULL,
        account_number TEXT NOT NULL,
        status TEXT DEFAULT 'pending' NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        processed_at TIMESTAMP,
        processed_by INTEGER
      );
    `);
        console.log("Tabla vecinos_withdrawal_requests creada");
        // Crear tabla de notificaciones (vecinos_partner_notifications)
        await pool.query(`
      CREATE TABLE IF NOT EXISTS vecinos_partner_notifications (
        id SERIAL PRIMARY KEY,
        partner_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT DEFAULT 'info' NOT NULL,
        read BOOLEAN DEFAULT FALSE NOT NULL,
        action TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        read_at TIMESTAMP
      );
    `);
        console.log("Tabla vecinos_partner_notifications creada");
        console.log("Todas las tablas de Vecinos Express han sido creadas exitosamente");
        // Crear socio de prueba
        await pool.query(`
      INSERT INTO vecinos_partners (
        username, password, store_name, business_type, address, city, phone, email, 
        owner_name, owner_rut, owner_phone, commission_rate, status, balance
      ) 
      VALUES (
        'demopartner', 'password123', 'Minimarket El Sol', 'tienda', 'Av. Principal 123', 
        'Santiago', '912345678', 'demo@vecinos.test', 'Juan Pérez', '12345678-9', 
        '987654321', 20, 'approved', 0
      )
      ON CONFLICT (username) DO NOTHING;
    `);
        console.log("Socio de demo creado (si no existía)");
        await pool.end();
    }
    catch (error) {
        console.error("Error al crear tablas de Vecinos Express:", error);
        await pool.end();
        throw error;
    }
}
// Ejecutar migración
createVecinosTables()
    .then(() => console.log("Migración completada con éxito"))
    .catch((error) => console.error("Error en migración:", error));
