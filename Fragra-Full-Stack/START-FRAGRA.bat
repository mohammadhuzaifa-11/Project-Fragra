@echo off
setlocal
cd /d "%~dp0backend"
echo.
echo ==============================
echo       FRAGRA E-COMMERCE
echo ==============================
echo.
echo Launching Java server at http://localhost:8080/
echo If Maven cannot be found, install Maven and add its bin directory to PATH.
echo.
mvn spring-boot:run
if errorlevel 1 (
  echo.
  echo Failed to start. Make sure Java 17+ and Maven are on PATH.
  pause
)
