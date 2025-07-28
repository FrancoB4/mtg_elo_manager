# Configuración de Archivos para Heroku

## Descripción

Este proyecto está configurado para manejar archivos de imports y exports tanto en desarrollo local como en producción con Heroku, utilizando archivos estáticos servidos por WhiteNoise.

## Estructura de Archivos

### Desarrollo Local
```
proyecto/
├── imports/           # Archivos CSV de entrada
├── exports/           # Archivos CSV de salida
└── static/
    ├── imports/       # Copia para producción
    └── exports/       # Copia para producción
```

### Producción (Heroku)
```
proyecto/
└── static/
    ├── imports/       # Archivos CSV de entrada
    └── exports/       # Archivos CSV de salida
```

## Configuración

### Variables de Entorno

En tu archivo `.env`:
```bash
# development | production
ENVIRONMENT=development
DEBUG=True
```

En Heroku:
```bash
ENVIRONMENT=production
DEBUG=False
```

### Configuración de Django

El proyecto incluye:
- **WhiteNoise**: Para servir archivos estáticos en Heroku
- **FileService**: Servicio que maneja automáticamente las rutas según el entorno
- **Configuración automática**: Los servicios de import/export cambian su comportamiento según el entorno

## Uso

### Comandos de Django

1. **Migrar archivos a estructura estática**:
```bash
python manage.py migrate_files_to_static --copy-all
```

2. **Recolectar archivos estáticos**:
```bash
python manage.py collectstatic --noinput
```

3. **Limpiar carpetas originales** (después de migrar):
```bash
python manage.py migrate_files_to_static --clean-old
```

### Deployment en Heroku

1. **Script automático**:
```bash
./deploy.sh
```

2. **Manual**:
```bash
# Migrar archivos
python manage.py migrate_files_to_static --copy-all

# Recolectar estáticos
python manage.py collectstatic --noinput

# Migraciones de BD
python manage.py migrate
```

## Servicios Actualizados

### ImportService
- Usa `FileService.get_import_file_path()` para obtener rutas
- Funciona automáticamente en desarrollo y producción
- Incluye validación de existencia de archivos

### ExportService
- Usa `FileService.get_export_file_path()` para generar archivos
- Crea directorios automáticamente si no existen
- Retorna la ruta del archivo exportado

### FileService
- **get_imports_path()**: Ruta base para imports
- **get_exports_path()**: Ruta base para exports
- **get_import_file_path(filename)**: Ruta completa para archivo de import
- **get_export_file_path(filename, subfolder)**: Ruta completa para archivo de export
- **file_exists(path)**: Verifica existencia de archivo
- **is_production()**: Detecta entorno de producción

## Consideraciones Importantes

### Limitaciones de Heroku
- El sistema de archivos es **efímero**: los archivos se pierden en cada redeploy
- Los archivos generados solo persisten durante la sesión actual
- Para persistencia permanente, considera usar:
  - **Amazon S3** para almacenamiento de archivos
  - **Base de datos** para datos estructurados
  - **Servicios externos** de almacenamiento

### Recomendaciones

1. **Para archivos de entrada (imports)**:
   - Súbelos al repositorio en `static/imports/`
   - O implémentalos como fixtures de Django
   - O usa una interfaz web para subir archivos

2. **Para archivos de salida (exports)**:
   - Considera ofrecer descarga directa via HTTP
   - Implementa endpoints de API para generar CSV en tiempo real
   - Guarda datos importantes en la base de datos

3. **Para producción estable**:
   - Implementa almacenamiento en S3
   - Usa CDN para servir archivos estáticos
   - Considera servicios de backup automático

## API Endpoints Recomendados

```python
# views.py
from django.http import HttpResponse
from services.export_service import ExportService

def export_ranking_csv(request):
    export_service = ExportService()
    file_path = export_service.csv_export()
    
    with open(file_path, 'rb') as f:
        response = HttpResponse(f.read(), content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{file_path.name}"'
        return response
```

## Troubleshooting

### Error: Archivo no encontrado
- Verifica que los archivos estén en `static/imports/` para producción
- Ejecuta `python manage.py collectstatic` después de agregar archivos

### Error: Permisos de escritura
- Heroku permite escritura en directorios temporales
- Los archivos en `static/` son de solo lectura después de collectstatic

### Error: Archivos no persisten
- Es el comportamiento normal de Heroku
- Implementa almacenamiento externo para persistencia
