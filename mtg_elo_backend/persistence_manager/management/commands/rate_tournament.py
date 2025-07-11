import os

from django.db import transaction
from django.core.management.base import BaseCommand, CommandError
from persistence_manager.services.glicko2_service import Glicko2Service
from persistence_manager.services.import_service import ImportService
from persistence_manager.services.export_service import ExportService


class Command(BaseCommand):
    help = 'Rate a tournament based on the provided tournament .csv file.'
    
    def add_arguments(self, parser):
        parser.add_argument('file_name', type=str)
        parser.add_argument(
            '--export',
            action='store_true',
            help='Export the current player ratings to a CSV file after processing the tournament.'
        )
        
    def handle(self, *args, **options):
        export_service = ExportService()
        import_service = ImportService()
        glicko2_service = Glicko2Service()
        
        file_name = options['file_name']
        export_flag = options['export']
        
        if os.path.exists(f'imports/{file_name}'):
            matches = import_service.import_tournament_from_csv(file_name)
        else:
            raise CommandError(f'File {file_name} does not exist in the imports directory.')
        
        if matches:
            try:
                with transaction.atomic():
                    glicko2_service.rate_tournament_bo3(matches)
            except Exception as e:
                raise CommandError(f'An error occurred while rating the tournament: {e}')
            
        if export_flag:
            try:
                export_service.csv_export()
            except Exception as e:
                raise CommandError(f'An error occurred while exporting the player ratings: {e}')
            
        