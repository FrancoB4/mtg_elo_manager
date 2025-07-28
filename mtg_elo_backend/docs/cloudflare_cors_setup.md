# Configuración CORS para Cloudflare Pages

## Problema: Dominios Dinámicos de Cloudflare

Cloudflare Pages genera URLs dinámicas para preview deployments como:
- `https://abc12345.tu-app.pages.dev` (preview builds)
- `https://branch-name.tu-app.pages.dev` (branch deployments)
- `https://tu-app.pages.dev` (producción)

## Solución Implementada

### 1. Middleware Personalizado
Creé `DynamicCorsMiddleware` que permite patrones regex para validar orígenes dinámicos.

### 2. Patrones de Configuración

#### En settings.py (Automático):
```python
CORS_ALLOWED_ORIGIN_PATTERNS = [
    r"https://[a-f0-9]{8}\.mtg-elo-manager\.pages\.dev",  # Preview deployments (8 chars hex)
    r"https://.*\.mtg-elo-manager\.pages\.dev",            # Cualquier subdominio
    r"https://mtg-elo-manager\.pages\.dev",                # Dominio principal
]
```

#### Variables de Entorno (Personalizable):
```bash
# En tu .env local o Heroku config vars
CORS_PATTERN_1="https://[a-f0-9]{8}\.tu-app\.pages\.dev"
CORS_PATTERN_2="https://.*\.tu-app\.pages\.dev"
CORS_PATTERN_3="https://tu-app\.pages\.dev"
```

## Configuración Paso a Paso

### 1. Para Desarrollo Local
En tu `.env`:
```bash
# CORS básico para desarrollo
CORS_ALLOWED_ORIGINS="http://localhost:3000,http://127.0.0.1:3000"
CORS_ALLOW_ALL_ORIGINS=True

# Patrones para Cloudflare (opcional para testing)
CORS_PATTERN_1="https://.*\.tu-app\.pages\.dev"
```

### 2. Para Heroku (Producción)
```bash
# Configuración básica
heroku config:set DEBUG=False
heroku config:set CORS_ALLOW_ALL_ORIGINS=False

# URLs específicas permitidas
heroku config:set CORS_ALLOWED_ORIGINS="https://tu-app.pages.dev"

# Patrones dinámicos para Cloudflare
heroku config:set CORS_PATTERN_1="https://[a-f0-9]{8}\.tu-app\.pages\.dev"
heroku config:set CORS_PATTERN_2="https://.*\.tu-app\.pages\.dev"
heroku config:set CORS_PATTERN_3="https://preview-.*\.tu-app\.pages\.dev"
```

## Ejemplos de Patrones Comunes

### Preview Deployments (Hash corto)
```regex
https://[a-f0-9]{8}\.tu-app\.pages\.dev
```
Permite: `https://abc12345.tu-app.pages.dev`

### Branch Deployments
```regex
https://[a-zA-Z0-9-]+\.tu-app\.pages\.dev
```
Permite: `https://feature-branch.tu-app.pages.dev`

### Cualquier Subdominio
```regex
https://.*\.tu-app\.pages\.dev
```
Permite: cualquier subdominio de tu app

### Solo Producción
```regex
https://tu-app\.pages\.dev
```
Permite: solo el dominio principal

## Testing de la Configuración

### 1. Verificar en Development
```bash
# Ejecutar servidor local
python manage.py runserver

# Probar CORS desde consola del navegador
fetch('http://localhost:8000/api/players/', {
    method: 'GET',
    headers: {
        'Origin': 'https://abc12345.tu-app.pages.dev'
    }
});
```

### 2. Verificar en Heroku
```bash
# Ver configuración actual
heroku config

# Ver logs en tiempo real
heroku logs --tail

# Probar endpoint
curl -H "Origin: https://abc12345.tu-app.pages.dev" \
     https://tu-backend.herokuapp.com/api/players/
```

## Troubleshooting

### Error: CORS policy blocked
**Causa**: El patrón no coincide con la URL del frontend
**Solución**: 
1. Verificar la URL exacta en las herramientas de desarrollador
2. Ajustar el patrón regex
3. Temporalmente usar `CORS_ALLOW_ALL_ORIGINS=True` para testing

### Error: Access-Control-Allow-Origin missing
**Causa**: Middleware no configurado correctamente
**Solución**: Verificar que `DynamicCorsMiddleware` esté en MIDDLEWARE

### Error: Pattern not working
**Causa**: Regex incorrecto
**Solución**: Probar el regex online en regex101.com

## Configuración Recomendada por Entorno

### Desarrollo:
```python
DEBUG = True
CORS_ALLOW_ALL_ORIGINS = True  # Permite todo para facilitar desarrollo
```

### Staging/Testing:
```python
DEBUG = False
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = ["https://staging.tu-app.pages.dev"]
CORS_PATTERN_1 = "https://.*\.tu-app\.pages\.dev"  # Para preview builds
```

### Producción:
```python
DEBUG = False
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = ["https://tu-app.pages.dev"]  # Solo producción
CORS_PATTERN_1 = "https://[a-f0-9]{8}\.tu-app\.pages\.dev"  # Solo para testing
```

## Seguridad

⚠️ **Importante**:
- En producción, ser específico con los patrones
- Evitar patrones demasiado amplios como `https://.*\.pages\.dev`
- Usar `CORS_ALLOW_ALL_ORIGINS=False` en producción
- Monitorear logs para peticiones CORS sospechosas

## Alternativa Simple

Si no quieres usar patrones regex, puedes:
1. Configurar un dominio personalizado en Cloudflare Pages
2. Usar solo ese dominio fijo en CORS_ALLOWED_ORIGINS
3. Para preview builds, usar un subdominio fijo como `preview.tu-dominio.com`
