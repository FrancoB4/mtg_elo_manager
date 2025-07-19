from django.core.management.base import BaseCommand, CommandError, CommandParser
from players.services.export_service import ExportService
from players.models import Player
from tournaments.models import Tournament, TournamentRating


class Command(BaseCommand):
    help = 'Show the current player ratings in a formatted table.'
    
    def add_arguments(self, parser: CommandParser) -> None:
        parser.add_argument(
            'tournament_name',
            type=str,
            nargs='?',
            default=None,
            help='Name of the tournament to show ratings for (optional).'
        )
        parser.add_argument(
            '--tournament',
            action='store_true',
            help='Show the ratings of a tournament.'
        )
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
        players = None
        columns = {
            'Pos': True,
            'Jugador': True,
            'Elo': True,
            'Tendencia': True,
            'RD': True,
            'Matches': True
        }
        if options['tournament']:
            if not options['tournament_name']:
                raise CommandError('You must provide a tournament name when using the --tournament option.')
            players = TournamentRating.objects.filter(
                tournament__name=options['tournament_name']
            ).select_related('player')
            columns = {
                'Pos': True,
                'Jugador': True,
                'Elo': True,
                'RD': True
            }
        
        if top_ten_flag:
            try:
                export_service.table_export_top_ten(full=options['full'])
            except Exception as e:
                raise CommandError(f'An error occurred while exporting the top ten players: {e}')
        else:
            try:
                export_service.table_export(players=players, columns=columns, full=options['full'])
            except Exception as e:
                raise CommandError(f'An error occurred while exporting the complete list players: {e}')
