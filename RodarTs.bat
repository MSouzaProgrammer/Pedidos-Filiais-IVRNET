@echo off
:: Navega até a pasta onde o arquivo .bat está salvo
cd /d "%~dp0"

echo Iniciando monitoramento TypeScript...
npx tsc src/main/resources/static/script/script.ts --watch