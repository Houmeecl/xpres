"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentForensicsRouter = void 0;
const express_1 = require("express");
const child_process_1 = require("child_process");
const axios_1 = __importDefault(require("axios"));
const path_1 = __importDefault(require("path"));
const url_1 = require("url");
exports.documentForensicsRouter = (0, express_1.Router)();
// Obtener el directorio actual para módulos ESM
const __filename = (0, url_1.fileURLToPath)(import.meta.url);
const __dirname = path_1.default.dirname(__filename);
// Referencia al proceso de Flask en ejecución
let flaskProcess = null;
// Puerto para la API de Flask 
const FLASK_PORT = 5001;
const FLASK_URL = `http://localhost:${FLASK_PORT}`;
// Ruta al script de Python
const FLASK_SCRIPT_PATH = path_1.default.join(__dirname, "document-forensics.py");
/**
 * Detiene el servidor Flask si está en ejecución
 */
function stopFlaskServer() {
    if (flaskProcess !== null) {
        console.log("Deteniendo servidor Flask existente...");
        try {
            // En Linux, envía SIGTERM para cierre limpio
            flaskProcess.kill('SIGTERM');
        }
        catch (error) {
            console.error("Error al detener servidor Flask:", error);
        }
        flaskProcess = null;
    }
}
/**
 * Inicia el servidor de Flask si no está en ejecución
 */
async function ensureFlaskServerRunning() {
    // Si el proceso ya está en ejecución, comprobamos si responde
    if (flaskProcess !== null) {
        try {
            await axios_1.default.get(`${FLASK_URL}/`);
            console.log("Servidor Flask ya está en ejecución");
            return true;
        }
        catch (error) {
            console.log("Servidor Flask no responde, reiniciando...");
            stopFlaskServer();
        }
    }
    // Iniciar proceso de Flask
    try {
        console.log("Iniciando servidor Flask para análisis forense de documentos...");
        flaskProcess = (0, child_process_1.spawn)("python", [FLASK_SCRIPT_PATH]);
        flaskProcess.stdout.on("data", (data) => {
            console.log(`Flask stdout: ${data.toString()}`);
        });
        flaskProcess.stderr.on("data", (data) => {
            console.error(`Flask stderr: ${data.toString()}`);
        });
        flaskProcess.on("close", (code) => {
            console.log(`Proceso Flask cerrado con código ${code}`);
            flaskProcess = null;
        });
        // Esperar a que el servidor Flask esté listo
        let attempts = 0;
        const maxAttempts = 10;
        while (attempts < maxAttempts) {
            try {
                await new Promise(resolve => setTimeout(resolve, 1000));
                await axios_1.default.get(`${FLASK_URL}/`);
                console.log("Servidor Flask iniciado correctamente");
                return true;
            }
            catch (error) {
                attempts++;
                console.log(`Esperando a que Flask esté listo... (intento ${attempts}/${maxAttempts})`);
            }
        }
        console.error("No se pudo iniciar Flask después de varios intentos");
        return false;
    }
    catch (error) {
        console.error("Error al iniciar servidor Flask:", error);
        return false;
    }
}
/**
 * Endpoint para analizar un documento y realizar verificación forense
 * POST /api/document-forensics/analyze
 */
exports.documentForensicsRouter.post("/analyze", async (req, res) => {
    try {
        // Verificar si tenemos imagen de documento
        if (!req.body.documentImage) {
            return res.status(400).json({
                error: "Se requiere una imagen de documento"
            });
        }
        // Asegurarse de que Flask está en ejecución
        const isFlaskRunning = await ensureFlaskServerRunning();
        if (!isFlaskRunning) {
            return res.status(500).json({
                error: "No se pudo iniciar el servicio de análisis forense"
            });
        }
        // Enviar la solicitud al servidor Flask
        const response = await axios_1.default.post(`${FLASK_URL}/api/document-forensics/analyze`, { documentImage: req.body.documentImage }, { timeout: 30000 } // 30 segundos de timeout
        );
        // Devolver los resultados del análisis
        return res.status(200).json(response.data);
    }
    catch (error) {
        console.error("Error en análisis forense de documento:", error);
        // Si el error es de la API de Flask
        if (axios_1.default.isAxiosError(error) && error.response) {
            return res.status(error.response.status).json(error.response.data);
        }
        return res.status(500).json({
            error: "Error en el servicio de análisis forense",
            message: error instanceof Error ? error.message : "Error desconocido"
        });
    }
});
// Finalizar el proceso de Flask cuando se cierre la aplicación
process.on("exit", () => {
    stopFlaskServer();
});
// Manejo de señales de terminación para limpiar recursos
process.on("SIGINT", () => {
    stopFlaskServer();
    process.exit();
});
process.on("SIGTERM", () => {
    stopFlaskServer();
    process.exit();
});
