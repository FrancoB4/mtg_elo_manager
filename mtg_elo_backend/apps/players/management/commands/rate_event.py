import os

from django.db import transaction
from django.core.management.base import BaseCommand, CommandError
from services.import_service import ImportService
from services.export_service import ExportService
from services.glicko2_service import Glicko2Service
from services.file_service import FileService
from apps.leagues.models import League
import traceback

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
        
        file_name = options['file_name']
        export_flag = options['export']
        
        file_path = FileService.get_import_file_path(file_name)
        if FileService.file_exists(file_path):
            matches = import_service.import_tournament_from_csv(file_name)
        else:
            raise CommandError(f'File {file_name}.csv does not exist in the imports directory.')
        
        if matches:
            try:
                glicko_service = Glicko2Service()
                with transaction.atomic():
                    league = League.objects.get_or_create(name='Pauper League 2025')[0]
                    glicko_service.rate_league_event(matches, league, date=file_name)
            except Exception as e:
                raise CommandError(f'An error occurred while rating the event: {e}\nFile: {traceback.extract_tb(e.__traceback__)[-1].filename}, Line: {traceback.extract_tb(e.__traceback__)[-1].lineno}')
            
        if export_flag:
            try:
                exported_file = export_service.csv_export()
                self.stdout.write(self.style.SUCCESS(f'Exported to: {exported_file}'))
            except Exception as e:
                raise CommandError(f'An error occurred while exporting the player ratings: {e}')
            
        