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
exports.verifyFacialSimilarity = verifyFacialSimilarity;
exports.extractDocumentInfo = extractDocumentInfo;
exports.analyzeDocumentAuthenticity = analyzeDocumentAuthenticity;
exports.saveBase64Image = saveBase64Image;
exports.downloadAndSaveImage = downloadAndSaveImage;
/**
 * Servicio de Visión Artificial usando OpenAI
 *
 * Este servicio proporciona funcionalidades para analizar imágenes
 * y realizar verificaciones biométricas y de documentos.
 */
const openai_1 = __importDefault(require("openai"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const axios_1 = __importDefault(require("axios"));
// Inicializar cliente de OpenAI
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
/**
 * Verifica la similitud facial entre una selfie y una foto de cédula
 *
 * @param selfiePath Ruta a la imagen selfie
 * @param documentPhotoPath Ruta a la imagen de la foto en el documento
 * @returns Objeto con puntuación de similitud y análisis
 */
async function verifyFacialSimilarity(selfiePath, documentPhotoPath) {
    try {
        // Convertir imágenes a base64
        const selfieBase64 = fs.readFileSync(selfiePath, { encoding: 'base64' });
        const documentBase64 = fs.readFileSync(documentPhotoPath, { encoding: 'base64' });
        // Prompt específico para análisis de similitud facial
        const prompt = `
      Analiza estas dos imágenes y determina si corresponden a la misma persona.
      La primera imagen es una selfie tomada en tiempo real.
      La segunda imagen es una foto de una cédula de identidad chilena.
      
      INSTRUCCIONES:
      1. Evalúa la similitud facial comparando características como:
         - Forma de la cara, ojos, nariz y boca
         - Distancia entre características faciales
         - Estructura ósea general
      2. Ten en cuenta que pueden existir variaciones debido a:
         - La edad (la foto del documento puede ser más antigua)
         - Expresión facial
         - Iluminación y ángulo
         - Presencia/ausencia de lentes, barba o maquillaje
      
      Responde con un JSON en este formato exacto:
      {
        "score": [valor numérico entre 0.0 y 1.0 que representa la similitud],
        "match": [booleano que indica si es la misma persona (true/false)],
        "confidence": ["alta", "media" o "baja"],
        "análisis": "Una explicación detallada de tu análisis"
      }
      
      No incluyas ningún otro texto fuera del JSON.
    `;
        // Llamada a la API de visión de OpenAI
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: prompt
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/jpeg;base64,${selfieBase64}`,
                                detail: "high"
                            }
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/jpeg;base64,${documentBase64}`,
                                detail: "high"
                            }
                        }
                    ]
                }
            ],
            response_format: { type: "json_object" },
            temperature: 0.2,
        });
        // Extraer y parsear la respuesta JSON
        const result = JSON.parse(response.choices[0].message.content);
        // Asegurarse de que el resultado tenga el formato esperado
        return {
            score: parseFloat(result.score) || 0,
            match: result.match === true,
            confidence: result.confidence || "baja",
            analysis: result.análisis || result.analysis || "No se proporcionó análisis"
        };
    }
    catch (error) {
        console.error("Error en verificación facial:", error);
        throw new Error(`Error en verificación facial: ${error.message}`);
    }
}
/**
 * Extrae información de una imagen de cédula de identidad
 *
 * @param documentImagePath Ruta a la imagen de la cédula
 * @returns Objeto con la información extraída del documento
 */
async function extractDocumentInfo(documentImagePath) {
    try {
        // Convertir imagen a base64
        const documentBase64 = fs.readFileSync(documentImagePath, { encoding: 'base64' });
        // Prompt específico para extracción de información de cédula chilena
        const prompt = `
      Analiza esta imagen de una cédula de identidad chilena y extrae toda la información relevante.
      
      INSTRUCCIONES:
      1. Identifica el tipo de documento (Cédula de Identidad o Pasaporte)
      2. Extrae el número de documento (RUN/RUT con formato XX.XXX.XXX-X)
      3. Extrae el nombre completo del titular
      4. Extrae la fecha de nacimiento (formato DD/MM/AAAA)
      5. Extrae la fecha de vencimiento (formato DD/MM/AAAA)
      6. Identifica la nacionalidad
      7. Evalúa si el documento parece auténtico o presenta señales de manipulación
      
      Responde con un JSON en este formato exacto:
      {
        "documentType": "tipo de documento",
        "documentNumber": "número de documento con formato",
        "fullName": "nombre completo",
        "birthDate": "fecha de nacimiento",
        "expiryDate": "fecha de vencimiento",
        "nationality": "nacionalidad",
        "isValid": "booleano que indica si el documento parece auténtico",
        "confidence": "alta, media o baja",
        "analysis": "explicación de tu análisis y cualquier observación relevante"
      }
      
      No incluyas ningún otro texto fuera del JSON.
    `;
        // Llamada a la API de visión de OpenAI
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: prompt
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/jpeg;base64,${documentBase64}`,
                                detail: "high"
                            }
                        }
                    ]
                }
            ],
            response_format: { type: "json_object" },
            temperature: 0.1,
        });
        // Extraer y parsear la respuesta JSON
        const result = JSON.parse(response.choices[0].message.content);
        // Asegurarse de que el resultado tenga el formato esperado
        return {
            documentType: result.documentType || "Desconocido",
            documentNumber: result.documentNumber || "Desconocido",
            fullName: result.fullName || "Desconocido",
            birthDate: result.birthDate || "Desconocido",
            expiryDate: result.expiryDate || "Desconocido",
            nationality: result.nationality || "Desconocida",
            isValid: result.isValid === true,
            confidence: result.confidence || "baja",
            analysis: result.analysis || "No se proporcionó análisis"
        };
    }
    catch (error) {
        console.error("Error en extracción de información de documento:", error);
        throw new Error(`Error en extracción de documento: ${error.message}`);
    }
}
/**
 * Analiza una imagen de documento para detectar signos de falsificación
 *
 * @param documentImagePath Ruta a la imagen del documento
 * @returns Objeto con el análisis de autenticidad
 */
async function analyzeDocumentAuthenticity(documentImagePath) {
    try {
        // Convertir imagen a base64
        const documentBase64 = fs.readFileSync(documentImagePath, { encoding: 'base64' });
        // Prompt específico para análisis de autenticidad de documento
        const prompt = `
      Analiza esta imagen de una cédula de identidad chilena y evalúa su autenticidad.
      
      INSTRUCCIONES:
      1. Examina los elementos de seguridad visibles, como:
         - Hologramas
         - Microtexto
         - Patrones de fondo
         - Tinta ópticamente variable
         - Elementos UV (si son visibles)
      2. Busca signos de posible manipulación, como:
         - Inconsistencias en fuentes o alineación
         - Signos de edición digital
         - Alteraciones en números o texto
         - Elementos borrosos o poco claros
      
      Responde con un JSON en este formato exacto:
      {
        "isAuthentic": [booleano que indica si el documento parece auténtico],
        "score": [valor numérico entre 0.0 y 1.0 que representa la probabilidad de autenticidad],
        "confidence": ["alta", "media" o "baja"],
        "securityFeatures": [array de elementos de seguridad identificados],
        "manipulationSigns": [array de posibles signos de manipulación],
        "analysis": "explicación detallada de tu análisis"
      }
      
      No incluyas ningún otro texto fuera del JSON.
    `;
        // Llamada a la API de visión de OpenAI
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: prompt
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/jpeg;base64,${documentBase64}`,
                                detail: "high"
                            }
                        }
                    ]
                }
            ],
            response_format: { type: "json_object" },
            temperature: 0.2,
        });
        // Extraer y parsear la respuesta JSON
        const result = JSON.parse(response.choices[0].message.content);
        // Asegurarse de que el resultado tenga el formato esperado
        return {
            isAuthentic: result.isAuthentic === true,
            score: parseFloat(result.score) || 0,
            confidence: result.confidence || "baja",
            securityFeatures: Array.isArray(result.securityFeatures) ? result.securityFeatures : [],
            manipulationSigns: Array.isArray(result.manipulationSigns) ? result.manipulationSigns : [],
            analysis: result.analysis || "No se proporcionó análisis"
        };
    }
    catch (error) {
        console.error("Error en análisis de autenticidad:", error);
        throw new Error(`Error en análisis de autenticidad: ${error.message}`);
    }
}
/**
 * Procesa una imagen de base64 y la guarda en el sistema de archivos
 *
 * @param base64Data String de datos en formato base64
 * @param fileName Nombre del archivo a guardar
 * @returns Ruta al archivo guardado
 */
async function saveBase64Image(base64Data, fileName) {
    try {
        // Eliminar el prefijo de data URL si existe
        const base64Image = base64Data.replace(/^data:image\/\w+;base64,/, '');
        // Crear directorio de uploads si no existe
        const uploadsDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        // Crear subdirectorio para verificaciones biométricas
        const biometricDir = path.join(uploadsDir, 'biometric');
        if (!fs.existsSync(biometricDir)) {
            fs.mkdirSync(biometricDir, { recursive: true });
        }
        // Generar nombre de archivo con timestamp para evitar colisiones
        const timestamp = new Date().getTime();
        const filePath = path.join(biometricDir, `${timestamp}_${fileName}`);
        // Guardar imagen
        fs.writeFileSync(filePath, base64Image, 'base64');
        return filePath;
    }
    catch (error) {
        console.error("Error al guardar imagen base64:", error);
        throw new Error(`Error al guardar imagen: ${error.message}`);
    }
}
/**
 * Descarga una imagen desde una URL y la guarda en el sistema de archivos
 *
 * @param imageUrl URL de la imagen a descargar
 * @param fileName Nombre del archivo a guardar
 * @returns Ruta al archivo guardado
 */
async function downloadAndSaveImage(imageUrl, fileName) {
    try {
        // Crear directorio de uploads si no existe
        const uploadsDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        // Crear subdirectorio para verificaciones biométricas
        const biometricDir = path.join(uploadsDir, 'biometric');
        if (!fs.existsSync(biometricDir)) {
            fs.mkdirSync(biometricDir, { recursive: true });
        }
        // Generar nombre de archivo con timestamp
        const timestamp = new Date().getTime();
        const filePath = path.join(biometricDir, `${timestamp}_${fileName}`);
        // Descargar la imagen
        const response = await (0, axios_1.default)({
            method: 'get',
            url: imageUrl,
            responseType: 'arraybuffer'
        });
        // Guardar la imagen descargada
        fs.writeFileSync(filePath, response.data);
        return filePath;
    }
    catch (error) {
        console.error("Error al descargar y guardar imagen:", error);
        throw new Error(`Error al descargar imagen: ${error.message}`);
    }
}
