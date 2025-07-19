import os

from django.db import transaction
from django.core.management.base import BaseCommand, CommandError
from players.services.import_service import ImportService
from players.services.export_service import ExportService
from leagues.models import League
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
        
        if os.path.exists(f'imports/{file_name}.csv'):
            matches = import_service.import_tournament_from_csv(file_name)
        else:
            raise CommandError(f'File {file_name} does not exist in the imports directory.')
        
        if matches:
            try:
                with transaction.atomic():
                    league = League.objects.get_or_create(name='Pauper League 2025')[0]
                    league.rate_league_event(matches, date=file_name)
            except Exception as e:
                raise CommandError(f'An error occurred while rating the event: {e}\nFile: {traceback.extract_tb(e.__traceback__)[-1].filename}, Line: {traceback.extract_tb(e.__traceback__)[-1].lineno}')
            
        if export_flag:
            try:
                export_service.csv_export()
            except Exception as e:
                raise CommandError(f'An error occurred while exporting the player ratings: {e}')
            
        