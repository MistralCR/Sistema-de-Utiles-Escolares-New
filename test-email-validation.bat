@echo off
echo.
echo 🧪 Prueba de validación de email con dominio @mep.go.cr
echo.

echo 🔍 Caso 1: Email válido con @mep.go.cr
echo 📧 Email: director.test@mep.go.cr
echo.

curl -X POST http://localhost:4000/api/centros ^
  -H "Content-Type: application/json" ^
  -d "{\"nombre\":\"Escuela Test Válida\",\"codigoMEP\":\"TEST001\",\"provincia\":\"San José\",\"canton\":\"San José\",\"distrito\":\"Carmen\",\"responsable\":{\"nombre\":\"Director Test\",\"email\":\"director.test@mep.go.cr\",\"telefono\":\"22334455\"},\"etiquetas\":{\"ubicacion\":\"urbano\",\"tipoInstitucion\":\"multidocente\"},\"descripcion\":\"Centro educativo de prueba\"}"

echo.
echo.
echo =====================================
echo.

echo 🔍 Caso 2: Email inválido con @mep.go.cr
echo 📧 Email: director.test@mep.go.cr  
echo.

curl -X POST http://localhost:4000/api/centros ^
  -H "Content-Type: application/json" ^
  -d "{\"nombre\":\"Escuela Test Inválida\",\"codigoMEP\":\"TEST002\",\"provincia\":\"San José\",\"canton\":\"San José\",\"distrito\":\"Carmen\",\"responsable\":{\"nombre\":\"Director Test\",\"email\":\"director.test@mep.go.cr\",\"telefono\":\"22334455\"},\"etiquetas\":{\"ubicacion\":\"urbano\",\"tipoInstitucion\":\"multidocente\"},\"descripcion\":\"Centro educativo de prueba\"}"

echo.
echo.
echo =====================================
echo.

echo 🔍 Caso 3: Email inválido con @gmail.com
echo 📧 Email: director.test@gmail.com
echo.

curl -X POST http://localhost:4000/api/centros ^
  -H "Content-Type: application/json" ^
  -d "{\"nombre\":\"Escuela Test Inválida 2\",\"codigoMEP\":\"TEST003\",\"provincia\":\"San José\",\"canton\":\"San José\",\"distrito\":\"Carmen\",\"responsable\":{\"nombre\":\"Director Test\",\"email\":\"director.test@gmail.com\",\"telefono\":\"22334455\"},\"etiquetas\":{\"ubicacion\":\"urbano\",\"tipoInstitucion\":\"multidocente\"},\"descripcion\":\"Centro educativo de prueba\"}"

echo.
echo.
echo ✅ Pruebas completadas
pause
