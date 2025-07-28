from django.core.management.base import BaseCommand, CommandError, CommandParser
from services.export_service import ExportService


class Command(BaseCommand):
    help = 'Export the current player ratings to a CSV file.'
    
    def add_arguments(self, parser: CommandParser) -> None:
        parser.add_argument(
            '--top-ten',
            action='store_true',
            help='Show the top ten players in the table.'
        )
        
    def handle(self, *args, **options):
        export_service = ExportService()
        
        top_ten_flag = options['top_ten']
        
        if top_ten_flag:
            try:
                exported_file = export_service.csv_export_top_ten()
                self.stdout.write(self.style.SUCCESS(f'Top ten exported to: {exported_file}'))
            except Exception as e:
                raise CommandError(f'An error occurred while exporting the top ten players: {e}')
        else:
            try:
                exported_file = export_service.csv_export()
                self.stdout.write(self.style.SUCCESS(f'Full ranking exported to: {exported_file}'))
            except Exception as e:
                raise CommandError(f'An error occurred while exporting the player rankings: {e}')
