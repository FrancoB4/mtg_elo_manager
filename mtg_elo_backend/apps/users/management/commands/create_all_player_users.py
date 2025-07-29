from django.core.management.base import BaseCommand, CommandError, CommandParser
from apps.users.models import CustomUser
from apps.players.models import Player
from django.db import transaction


class Command(BaseCommand):
    help = 'Show the current player ratings in a formatted table.'
        
    def handle(self, *args, **options):
        res = input("""
                    This command will create a user for each player in the database.
                    Are you sure you want to proceed? (yes/no): """)
        
        
        if res.lower() not in ['yes', 'y']:
            self.stdout.write(self.style.WARNING('Operation cancelled.'))
            return

        players = Player.objects.all().filter(user__isnull=True)
        
        for player in players:
            try:
                with transaction.atomic():
                    # Create a user for the player
                    user = CustomUser.objects.create_user(
                        username=player.name.lower().replace(' ', '_'),
                        password=f'{player.name.lower().split(' ')[-1] if type(player.name.lower().split(' ')) == list else player.name.lower()}',
                        must_change_password=True
                    )
                    player.user = user
                    self.stdout.write(self.style.SUCCESS(f'User {user.username} created for player: {player.name}'))
                    player.name = user.username
                    player.save()
                    
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error creating user for player {player.name}: {e}'))
