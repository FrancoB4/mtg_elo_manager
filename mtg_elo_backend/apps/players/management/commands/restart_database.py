from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.db import connection
from django.conf import settings

class Command(BaseCommand):
    help = 'Restart database by flushing all data and running migrations'

    def add_arguments(self, parser):
        parser.add_argument(
            '--no-input',
            action='store_true',
            help='Do not prompt for confirmation',
        )

    def handle(self, *args, **options):
        if not options['no_input']:
            confirm = input('This will delete ALL data from the database. Are you sure? (yes/no): ')
            if confirm.lower() != 'yes':
                self.stdout.write(self.style.WARNING('Operation cancelled.'))
                return

        try:
            self.stdout.write('Flushing database...')
            call_command('flush', interactive=False)
            
            self.stdout.write('Running migrations...')
            call_command('migrate')
            
            self.stdout.write(
                self.style.SUCCESS('Database successfully restarted!')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error restarting database: {e}')
            )