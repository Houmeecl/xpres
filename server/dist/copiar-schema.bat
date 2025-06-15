
@echo off
setlocal

:: Ruta base del proyecto
set BASE_DIR=D:\proyecto_vecino

:: Crear carpeta destino si no existe
if not exist "%BASE_DIR%\server\dist\shared" (
    mkdir "%BASE_DIR%\server\dist\shared"
)

:: Copiar y renombrar el archivo schema.ts como schema.js
copy /Y "%BASE_DIR%\shared\schema.ts" "%BASE_DIR%\server\dist\shared\schema.js"

echo Archivo copiado como schema.js a dist/shared
pause
