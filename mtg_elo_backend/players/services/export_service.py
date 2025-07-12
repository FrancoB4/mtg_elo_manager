from ..models import Player
from datetime import datetime as dt

class ExportService:    
    def table_export(self, players = None, full: bool = False):
        header = f'{"Pos":>4}|{"Jugador":^35}|{"Elo":^6}|{"Tendencia":^11}|{"RD":^14}|{"Matches":^9}|'
        if full:
            header += f'{"Won":^9}|{"Lost":^9}|'
        separator = '-' * len(header)
        print(header)
        print(separator)
        if players is None:
            players = Player.objects.all()
            
        for i, player in enumerate(players):
            
            print(
                f'{i+1:>4}|{player}|{player.get_last_tendency_display():^10}|{player.matches_won:^9}|{player.matches_lost:^9}|' # type: ignore
                if full
                else f'{i+1:>4}|{player}|') # type: ignore
            
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
