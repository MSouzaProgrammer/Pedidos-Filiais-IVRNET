@echo off
:: Navega ate a pasta onde o arquivo .bat esta salvo
cd /d "%~dp0"

echo [1/3] Deletando arquivos de cache sujos do TypeScript...
if exist tsconfig.tsbuildinfo del /f /q tsconfig.tsbuildinfo
if exist .tsbuildinfo del /f /q .tsbuildinfo

echo [2/3] Forcando a limpeza estrutural da build...
call npx tsc --build --clean

echo [3/3] Iniciando monitoramento limpo em tempo real...
npx tsc --watch

if %errorlevel% neq 0 (
    echo.
    echo Ocorreu um erro. Verifique o arquivo tsconfig.json.
    pause
)