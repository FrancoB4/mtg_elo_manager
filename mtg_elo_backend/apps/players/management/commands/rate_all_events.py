import os
from datetime import datetime as dt

from django.db import transaction
from django.core.management.base import BaseCommand, CommandError
from services.import_service import ImportService
from services.export_service import ExportService
from services.glicko2_service import Glicko2Service
from apps.leagues.models import League
import traceback

class Command(BaseCommand):
    help = 'Rate all events in the /imports directory.'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--export',
            action='store_true',
            help='Export the current player ratings to a CSV file after processing all events.'
        )
        
    def handle(self, *args, **options):
        export_service = ExportService()
        import_service = ImportService()
        
        import_dir = 'imports'
        if not os.path.exists(import_dir):
            raise CommandError(f'Directory {import_dir} does not exist.')
        
        files = [f.replace('.csv', '') for f in os.listdir(import_dir) if f.endswith('.csv')]
        if not files:
            raise CommandError('No .csv files found in the imports directory.')
        
        try:
            ordered_files = sorted(files, key=lambda x: dt.strptime(x, '%Y-%m-%d'))
        except ValueError as e:
            raise CommandError(f'Error parsing file names: {e}')
        except Exception as e:
            raise CommandError(f'An unexpected error occurred: {e}')

        glicko_service = Glicko2Service()
        
        try:
            with transaction.atomic():
                league = League.objects.get_or_create(name='Pauper League 2025')[0]
                for file_name in ordered_files:
                    matches = import_service.import_tournament_from_csv(file_name)
                    if matches:
                        glicko_service.rate_league_event(matches, league, date=file_name)
        except Exception as e:
            raise CommandError(f'An error occurred while processing the events: {e}\nFile: {traceback.extract_tb(e.__traceback__)[-1].filename}, Line: {traceback.extract_tb(e.__traceback__)[-1].lineno}')
        
        if options['export']:
            try:
                export_service.csv_export()
            except Exception as e:
                raise CommandError(f'An error occurred while exporting the player ratings: {e}')