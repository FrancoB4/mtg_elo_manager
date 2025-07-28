# Configuración de Variables de Entorno para Heroku

## Variables Requeridas en Heroku

Para que tu aplicación funcione correctamente en Heroku, necesitas configurar estas variables de entorno:

### Configuración Básica de Django
```bash
# Configuración de producción
DEBUG=False
ENVIRONMENT=production
SECRET_KEY="tu-clave-secreta-super-segura-para-produccion"

# Hosts permitidos (incluye tu dominio de Heroku)
ALLOWED_HOSTS="tu-app-name.herokuapp.com,localhost,127.0.0.1"
```

### Configuración de Base de Datos
```bash
# Heroku PostgreSQL (se configura automáticamente con add-ons)
# Pero puedes usar estas variables si usas una BD externa:
DATABASE_ELO_MANAGER_NAME="tu_database_name"
DATABASE_ELO_MANAGER_HOST="tu_host"
DATABASE_ELO_MANAGER_USER="tu_user"
DATABASE_ELO_MANAGER_PASSWORD="tu_password"
DATABASE_ELO_MANAGER_PORT="5432"
```

### Configuración de CORS
```bash
# Orígenes permitidos para CORS (tu frontend)
CORS_ALLOWED_ORIGINS="https://tu-frontend.com,https://otro-dominio.com"

# En producción debe ser False por seguridad
CORS_ALLOW_ALL_ORIGINS=False
```

## Comandos para Configurar en Heroku

### Opción 1: Usar Heroku CLI
```bash
# Configuración básica
heroku config:set DEBUG=False
heroku config:set ENVIRONMENT=production
heroku config:set SECRET_KEY="tu-clave-secreta-super-segura"
heroku config:set ALLOWED_HOSTS="tu-app-name.herokuapp.com"

# CORS
heroku config:set CORS_ALLOWED_ORIGINS="https://tu-frontend.com"
heroku config:set CORS_ALLOW_ALL_ORIGINS=False

# Base de datos (si no usas Heroku Postgres add-on)
heroku config:set DATABASE_ELO_MANAGER_NAME="tu_db"
heroku config:set DATABASE_ELO_MANAGER_HOST="tu_host"
heroku config:set DATABASE_ELO_MANAGER_USER="tu_user"
heroku config:set DATABASE_ELO_MANAGER_PASSWORD="tu_password"
```

### Opción 2: Dashboard de Heroku
1. Ve a tu app en el dashboard de Heroku
2. Pestaña "Settings"
3. Sección "Config Vars"
4. Agrega cada variable manualmente

## Configuración de Base de Datos en Heroku

### Usar Heroku Postgres (Recomendado)
```bash
# Agregar PostgreSQL add-on
heroku addons:create heroku-postgresql:hobby-dev

# Heroku automáticamente configura DATABASE_URL
# Tu settings.py puede leer esta variable así:
```

Agrega esto a tu `settings.py` para usar DATABASE_URL de Heroku:
```python
import dj_database_url

# Si existe DATABASE_URL (Heroku), úsala
if 'DATABASE_URL' in os.environ:
    DATABASES['default'] = dj_database_url.parse(os.environ['DATABASE_URL'])
```

## Troubleshooting

### Error 400 - Bad Request
- **Causa**: ALLOWED_HOSTS no incluye tu dominio de Heroku
- **Solución**: Agregar tu dominio a ALLOWED_HOSTS

### Error CORS
- **Causa**: Frontend no está en CORS_ALLOWED_ORIGINS
- **Solución**: Agregar URL de tu frontend a CORS_ALLOWED_ORIGINS

### Error de Base de Datos
- **Causa**: Variables de BD mal configuradas
- **Solución**: Verificar variables o usar Heroku Postgres add-on

## Ejemplo Completo para Heroku

```bash
# Variables mínimas requeridas
heroku config:set DEBUG=False
heroku config:set ENVIRONMENT=production
heroku config:set SECRET_KEY="django-insecure-+g*i9_mtk@k9xhu*_!&a)(p%(gqh)k-vji-h43+jduznx9ms2)"
heroku config:set ALLOWED_HOSTS="tu-app-name.herokuapp.com"
heroku config:set CORS_ALLOWED_ORIGINS="https://tu-frontend.vercel.app"
heroku config:set CORS_ALLOW_ALL_ORIGINS=False

# Agregar PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev
```

## Verificar Configuración

```bash
# Ver todas las variables configuradas
heroku config

# Ver logs de la aplicación
heroku logs --tail

# Ejecutar migraciones
heroku run python manage.py migrate

# Recolectar archivos estáticos
heroku run python manage.py collectstatic --noinput
```

## Importante

⚠️ **Nunca subas el archivo `.env` a tu repositorio**
⚠️ **Cambia SECRET_KEY en producción**
⚠️ **Usa CORS_ALLOW_ALL_ORIGINS=False en producción**
⚠️ **Configura ALLOWED_HOSTS con tu dominio real**
