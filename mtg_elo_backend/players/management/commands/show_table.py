from django.core.management.base import BaseCommand, CommandError, CommandParser
from players.services.export_service import ExportService


class Command(BaseCommand):
    help = 'Show the current player ratings in a formatted table.'
    
    def add_arguments(self, parser: CommandParser) -> None:
        parser.add_argument(
            '--top-ten',
            action='store_true',
            help='Show the top ten players in the table.'
        )
        parser.add_argument(
            '--full',
            action='store_true',
            help='Show the full data of players.'
        )
        
    def handle(self, *args, **options):
        export_service = ExportService()
        
        top_ten_flag = options['top_ten']
        
        if top_ten_flag:
            try:
                export_service.table_export_top_ten(full=options['full'])
            except Exception as e:
                raise CommandError(f'An error occurred while exporting the top ten players: {e}')
        else:
            try:
                export_service.table_export(full=options['full'])
            except Exception as e:
                raise CommandError(f'An error occurred while exporting the complete list players: {e}')
