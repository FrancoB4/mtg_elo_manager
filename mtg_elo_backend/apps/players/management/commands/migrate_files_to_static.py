from django.core.management.base import BaseCommand, CommandError
from services.file_service import FileService
import shutil
from pathlib import Path
from django.conf import settings


class Command(BaseCommand):
    help = 'Migra archivos de imports y exports a la estructura estática para Heroku'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--copy-all',
            action='store_true',
            help='Copia todos los archivos existentes de imports y exports a static'
        )
        parser.add_argument(
            '--clean-old',
            action='store_true',
            help='Elimina las carpetas imports y exports originales después de copiar'
        )
    
    def handle(self, *args, **options):
        copy_all = options['copy_all']
        clean_old = options['clean_old']
        
        base_dir = Path(settings.BASE_DIR)
        old_imports = base_dir / 'imports'
        old_exports = base_dir / 'exports'
        
        new_imports = base_dir / 'static' / 'imports'
        new_exports = base_dir / 'static' / 'exports'
        
        if copy_all:
            try:
                # Crear directorios de destino
                new_imports.mkdir(parents=True, exist_ok=True)
                new_exports.mkdir(parents=True, exist_ok=True)
                
                # Copiar archivos de imports
                if old_imports.exists():
                    for file in old_imports.rglob('*'):
                        if file.is_file():
                            relative_path = file.relative_to(old_imports)
                            destination = new_imports / relative_path
                            destination.parent.mkdir(parents=True, exist_ok=True)
                            shutil.copy2(file, destination)
                            self.stdout.write(f'Copiado: {file} -> {destination}')
                
                # Copiar archivos de exports
                if old_exports.exists():
                    for file in old_exports.rglob('*'):
                        if file.is_file():
                            relative_path = file.relative_to(old_exports)
                            destination = new_exports / relative_path
                            destination.parent.mkdir(parents=True, exist_ok=True)
                            shutil.copy2(file, destination)
                            self.stdout.write(f'Copiado: {file} -> {destination}')
                
                self.stdout.write(
                    self.style.SUCCESS('Archivos copiados exitosamente a la estructura estática')
                )
                
            except Exception as e:
                raise CommandError(f'Error al copiar archivos: {e}')
        
        if clean_old:
            try:
                if old_imports.exists():
                    shutil.rmtree(old_imports)
                    self.stdout.write(f'Eliminada carpeta: {old_imports}')
                
                if old_exports.exists():
                    shutil.rmtree(old_exports)
                    self.stdout.write(f'Eliminada carpeta: {old_exports}')
                
                self.stdout.write(
                    self.style.SUCCESS('Carpetas originales eliminadas exitosamente')
                )
                
            except Exception as e:
                raise CommandError(f'Error al eliminar carpetas originales: {e}')
        
        if not copy_all and not clean_old:
            self.stdout.write(
                self.style.WARNING(
                    'No se realizó ninguna acción. Usa --copy-all para copiar archivos '
                    'o --clean-old para eliminar carpetas originales.'
                )
            )
