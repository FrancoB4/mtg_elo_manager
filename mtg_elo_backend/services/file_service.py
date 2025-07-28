import os
import tempfile
from django.conf import settings
from pathlib import Path
from decouple import config


class FileService:
    """
    Servicio para manejar rutas de archivos de imports y exports.
    En desarrollo usa carpetas locales, en producción usa archivos estáticos para imports
    y carpeta temporal para exports.
    """
    
    @staticmethod
    def is_production() -> bool:
        """Verifica si estamos en entorno de producción"""
        environment = config('ENVIRONMENT', default='development')
        return environment == 'production' or not settings.DEBUG
    
    @staticmethod
    def get_imports_path() -> Path:
        """Obtiene la ruta base para archivos de import"""
        if FileService.is_production():
            # En producción, usar la carpeta static (solo lectura)
            return Path(settings.BASE_DIR) / 'static' / 'imports'
        else:
            # En desarrollo, usar la carpeta imports local
            return Path(settings.BASE_DIR) / 'imports'
    
    @staticmethod
    def get_exports_path() -> Path:
        """Obtiene la ruta base para archivos de export"""
        if FileService.is_production():
            # En producción, usar carpeta temporal (escribible)
            temp_dir = Path(tempfile.gettempdir()) / 'mtg_exports'
            temp_dir.mkdir(exist_ok=True)
            return temp_dir
        else:
            # En desarrollo, usar la carpeta exports local
            return Path(settings.BASE_DIR) / 'exports'
    
    @staticmethod
    def get_import_file_path(filename: str) -> Path:
        """Obtiene la ruta completa para un archivo de import"""
        imports_path = FileService.get_imports_path()
        # Crear directorio si no existe
        imports_path.mkdir(parents=True, exist_ok=True)
        return imports_path / f"{filename}.csv"
    
    @staticmethod
    def get_export_file_path(filename: str, subfolder: str | None = None) -> Path:
        """Obtiene la ruta completa para un archivo de export"""
        exports_path = FileService.get_exports_path()
        
        if subfolder:
            exports_path = exports_path / subfolder
        
        # Crear directorio si no existe
        exports_path.mkdir(parents=True, exist_ok=True)
        return exports_path / filename
    
    @staticmethod
    def file_exists(filepath: Path) -> bool:
        """Verifica si un archivo existe"""
        return filepath.exists() and filepath.is_file()
    
    @staticmethod
    def ensure_directory_exists(directory_path: Path) -> None:
        """Asegura que un directorio existe, creándolo si es necesario"""
        directory_path.mkdir(parents=True, exist_ok=True)
