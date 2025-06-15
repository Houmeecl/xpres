"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EMERGENCY_USER = exports.EMERGENCY_MODE = void 0;
exports.hashPassword = hashPassword;
exports.comparePasswords = comparePasswords;
exports.setupAuth = setupAuth;
const passport_1 = __importDefault(require("passport"));
const passport_local_1 = require("passport-local");
const express_session_1 = __importDefault(require("express-session"));
const crypto_1 = require("crypto");
const util_1 = require("util");
const storage_1 = require("./storage");
const scryptAsync = (0, util_1.promisify)(crypto_1.scrypt);
async function hashPassword(password) {
    const salt = (0, crypto_1.randomBytes)(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64));
    return `${buf.toString("hex")}.${salt}`;
}
async function comparePasswords(supplied, stored) {
    try {
        // Verificar que stored sea una cadena válida y tenga el formato correcto
        if (!stored || !stored.includes(".")) {
            console.error("Error: Formato de contraseña almacenada inválido");
            return false;
        }
        const [hashed, salt] = stored.split(".");
        // Verificar que ambos componentes estén presentes
        if (!hashed || !salt) {
            console.error("Error: Componentes de contraseña faltantes");
            return false;
        }
        const hashedBuf = Buffer.from(hashed, "hex");
        const suppliedBuf = (await scryptAsync(supplied, salt, 64));
        return (0, crypto_1.timingSafeEqual)(hashedBuf, suppliedBuf);
    }
    catch (error) {
        console.error("Error al comparar contraseñas:", error);
        return false;
    }
}
// Variable para modo de emergencia (bypass de autenticación)
exports.EMERGENCY_MODE = false;
// Simulación de usuario para uso en modo de emergencia
exports.EMERGENCY_USER = {
    id: 999999,
    username: "emergency_access",
    email: "emergency@vecinoxpress.cl",
    fullName: "Acceso de Emergencia",
    password: "emergency_bypass_password",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
};
function setupAuth(app) {
    const sessionSettings = {
        secret: process.env.SESSION_SECRET || "docusignpro-secret-key",
        resave: false,
        saveUninitialized: false,
        store: storage_1.storage.sessionStore,
        cookie: {
            secure: process.env.NODE_ENV === "production",
            maxAge: 1000 * 60 * 60 * 24, // 1 day
        }
    };
    app.set("trust proxy", 1);
    app.use((0, express_session_1.default)(sessionSettings));
    app.use(passport_1.default.initialize());
    app.use(passport_1.default.session());
    passport_1.default.use(new passport_local_1.Strategy(async (username, password, done) => {
        try {
            const user = await storage_1.storage.getUserByUsername(username);
            if (!user || !(await comparePasswords(password, user.password))) {
                return done(null, false);
            }
            else {
                return done(null, user);
            }
        }
        catch (error) {
            return done(error);
        }
    }));
    passport_1.default.serializeUser((user, done) => done(null, user.id));
    passport_1.default.deserializeUser(async (id, done) => {
        try {
            const user = await storage_1.storage.getUser(id);
            done(null, user);
        }
        catch (error) {
            done(error);
        }
    });
    app.post("/api/register", async (req, res, next) => {
        try {
            const { username, email, password, fullName, role = "user" } = req.body;
            // Validate role
            if (role !== "user" && role !== "certifier" && role !== "admin") {
                return res.status(400).json({ message: "Invalid role specified" });
            }
            // Check if username exists
            const existingUserByUsername = await storage_1.storage.getUserByUsername(username);
            if (existingUserByUsername) {
                return res.status(400).json({ message: "Username already exists" });
            }
            // Check if email exists
            const existingUserByEmail = await storage_1.storage.getUserByEmail(email);
            if (existingUserByEmail) {
                return res.status(400).json({ message: "Email already exists" });
            }
            const user = await storage_1.storage.createUser({
                username,
                email,
                fullName,
                role,
                password: await hashPassword(password),
            });
            req.login(user, (err) => {
                if (err)
                    return next(err);
                res.status(201).json(user);
            });
        }
        catch (error) {
            next(error);
        }
    });
    app.post("/api/login", (req, res, next) => {
        // Imprimimos los datos de inicio de sesión (solo el nombre de usuario por seguridad)
        console.log(`Intento de inicio de sesión para el usuario: ${req.body.username}`);
        passport_1.default.authenticate("local", (err, user, info) => {
            if (err) {
                console.error("Error en autenticación:", err);
                return next(err);
            }
            if (!user) {
                console.log(`Inicio de sesión fallido para el usuario: ${req.body.username}`);
                return res.status(401).json({ message: "Invalid credentials" });
            }
            console.log(`Inicio de sesión exitoso para el usuario: ${req.body.username}`);
            req.login(user, (loginErr) => {
                if (loginErr) {
                    console.error("Error en login:", loginErr);
                    return next(loginErr);
                }
                return res.status(200).json(user);
            });
        })(req, res, next);
    });
    app.post("/api/logout", (req, res, next) => {
        req.logout((err) => {
            if (err)
                return next(err);
            res.sendStatus(200);
        });
    });
    app.get("/api/user", (req, res) => {
        // MODO DE EMERGENCIA: Siempre devuelve el usuario de emergencia
        if (exports.EMERGENCY_MODE) {
            console.log("MODO DE EMERGENCIA ACTIVADO: Devolviendo usuario de emergencia");
            return res.json(exports.EMERGENCY_USER);
        }
        // Comportamiento normal cuando no está en modo de emergencia
        if (!req.isAuthenticated())
            return res.sendStatus(401);
        res.json(req.user);
    });
}
