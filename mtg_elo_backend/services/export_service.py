from apps.players.models import Player
from datetime import datetime as dt
from django.core.management.base import CommandError

class ExportService:    
    def table_export(self, players = None,
                     columns: dict = 
                     {'Pos': True, 'Jugador': True, 'Elo': True, 'Tendencia': True, 'RD': True, 'Matches': True},
                     full: bool = False):
        header = '|'
        if full:
            header += f'{"Pos":>4}|{"Jugador":^35}|{"Elo":^6}|{"Tendencia":^11}|{"Win %":^9}|{"RD":^14}|{"Matches":^9}|{"Won":^6}|{"Lost":^6}|{"Drawn":^6}|'
        else:
            if columns.get('Pos', False):
                header += f'{"Pos":>4}|'
            if columns.get('Jugador', False):
                header += f'{"Jugador":^35}|'
            if columns.get('Elo', False):
                header += f'{"Elo":^6}|'
            if columns.get('Tendencia', False):
                header += f'{"Tendencia":^11}|'
            if columns.get('% Win', False):
                header += f'{"% Win":^9}|'
            if columns.get('RD', False):
                header += f'{"RD":^14}|'
            if columns.get('Matches', False):
                header += f'{"Matches":^9}|'
       
        separator = '-' * len(header)
        print(header)
        print(separator)
        if players is None:
            players = Player.objects.all()
            
        for i, player in enumerate(players):
            row = '|'
            
            player_winrate = ''
            
            if full or columns.get('% Win', False):
                player_winrate = str(round(player.matches_won * 100 / player.matches_played, 2) if player.matches_played > 0 else 0)
                player_winrate = player_winrate + '0' + '%' if len(player_winrate.split('.')[1]) == 1 else player_winrate + '%'
            
            if full:
                try:
                    row += f'{i+1:>4}|{player.name:<35}|{player.rating:^6}|{player.get_last_tendency_display():^11}|{player_winrate:^9}|{round(player.rd, 8):^14}|{player.matches_played:^9}|{player.matches_won:^6}|{player.matches_lost:^6}|{player.matches_drawn:^6}|' # type: ignore
                except:
                    raise CommandError('Full option is not available for TournamentRating objects.')
            else:
                if columns.get('Pos', False):
                    row += f'{i+1:>4}|'
                if columns.get('Jugador', False):
                    try:
                        row += f'{player.name:<35}|' # type: ignore
                    except:
                        row += f'{player.player.name:<35}|' # type: ignore
                if columns.get('Elo', False):
                    row += f'{round(player.rating):^6}|'
                if columns.get('Tendencia', False):
                    row += f'{player.get_last_tendency_display():^11}|' # type: ignore
                if columns.get('% Win', False):
                    header += f'{player_winrate:^9}|'
                if columns.get('RD', False):
                    row += f'{round(player.rd, 8):^14}|'
                if columns.get('Matches', False):
                    row += f'{player.matches_played:^9}|'
            
            print(row)
            
        print(separator)
    
    def table_export_top_ten(self, full: bool = False):
        self.table_export(Player.objects.all()[:10], full=full)
        
    def csv_export(self, players = None):
        if players is None:
            players = Player.objects.all()
            
        with open(f'exports/ranking_{dt.now().strftime('%d/%m/%Y')}.csv', 'wt') as fm:
            fm.write('Position,Player,Elo,Rating deviation (RD),Matches played,Matches won,Matches loss,Matches drawn\n')
            
            for i, player in enumerate(players):
                fm.write(f'{i+1},{player.name},{player.rating},{player.rd},{player.get_last_tendency_display()}{player.matchs_played},{player.matches_won},{player.matches_lost},{player.matches_drawn}\n') # type: ignore
    
    def csv_export_top_ten(self):
        self.csv_export(Player.objects.all()[:10])
