# TerraGuard QuakExit Frontend

Frontend React + TypeScript + Vite para el monitoreo y la evacuacion sismica de TerraGuard QuakExit.

## Requisitos

- Node.js 20 o superior
- npm
- Backend Spring Boot ejecutandose en `http://localhost:8080`
- MySQL disponible para el backend

El frontend consume las rutas `/api/v1/...`. En desarrollo, Vite las reenvia automaticamente al backend mediante el proxy configurado en `vite.config.ts`.

## Iniciar el backend

El backend no forma parte de este repositorio. Desde la carpeta del backend, configura Java 25 y Maven, y luego ejecuta:

```powershell
$env:JAVA_HOME="C:\Users\joaoc\.jdks\openjdk-25.0.1"
$env:Path="$env:JAVA_HOME\bin;C:\Maven\apache-maven-3.9.16\bin;$env:Path"
mvn spring-boot:run
```

Antes de abrir el frontend, comprueba que Spring Boot siga activo:

```powershell
Invoke-WebRequest http://localhost:8080/v3/api-docs -UseBasicParsing
```

Debe responder con HTTP 200. Si el proceso se detiene, revisa la terminal del backend y confirma MySQL, las credenciales de `terraguard_db` y que el puerto 8080 no este ocupado.

## Iniciar el frontend

Desde esta carpeta:

```powershell
npm install
npm run dev
```

Abre `http://localhost:5173`.

No es necesario crear un archivo `.env` para desarrollo: por defecto `VITE_API_URL` queda vacio y Axios usa el mismo origen, permitiendo que Vite proxee las llamadas `/api` a `http://localhost:8080`.

Para un backend remoto, crea `.env.local`:

```powershell
VITE_API_URL=https://tu-backend.example.com
```

## Validacion

```powershell
npm run build
npm run lint
npm run test
```

## URLs utiles

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080`
- Swagger: `http://localhost:8080/swagger-ui.html`
- OpenAPI: `http://localhost:8080/v3/api-docs`

## Problemas frecuentes

### `ERR_CONNECTION_REFUSED` o `Network Error`

El backend no esta escuchando en `localhost:8080` o se cerro despues de iniciar. Verifica primero:

```powershell
Get-NetTCPConnection -LocalPort 8080 -State Listen
Invoke-WebRequest http://localhost:8080/v3/api-docs -UseBasicParsing
```

Si no hay respuesta, inicia nuevamente Spring Boot. Si el backend usa otro puerto, cambia el `target` de `server.proxy` en `vite.config.ts` o configura el backend en 8080.

### `Port 5173 is already in use`

Vite elegira otro puerto y lo mostrara en la terminal. Usa esa URL para abrir la aplicacion.

### El frontend arranca, pero el login falla

Confirma que OpenAPI responde y revisa que las rutas del backend coincidan con `/api/v1/auth/login` y `/api/v1/auth/register`. La consola del navegador y la terminal de Spring Boot mostraran el estado HTTP real.
