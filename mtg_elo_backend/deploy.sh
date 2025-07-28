#!/bin/bash

echo "=== MTG ELO Manager - Deployment Script para Heroku ==="

# Migrar archivos a estructura estática
echo "Migrando archivos a estructura estática..."
python manage.py migrate_files_to_static --copy-all

# Recolectar archivos estáticos
echo "Recolectando archivos estáticos..."
python manage.py collectstatic --noinput

# Ejecutar migraciones de base de datos
echo "Ejecutando migraciones de base de datos..."
python manage.py migrate

echo "=== Deployment completado ==="
