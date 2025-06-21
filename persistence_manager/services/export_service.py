from ..models import Player
from datetime import datetime as dt

class ExportService:
    def table_export(self, players = None):
        header = f'{"Pos":>4}|{"Jugador":^35}|{"Elo":^6}|{"RD":^14}|{"Matches":^9}|'
        separator = '-' * len(header)
        print(header)
        print(separator)
        if players is None:
            players = Player.objects.all()
            
        for i, player in enumerate(players):
            print(f'{i+1:>4}|{player}')
            
        print(separator)
        
    def table_export_top_ten(self):
        self.table_export(Player.objects.all()[:10])
        
    def csv_export(self, players = None):
        if players is None:
            players = Player.objects.all()
            
        with open(f'exports/ranking_{dt.now()}.csv', 'wt') as fm:
            fm.write('Position,Player,Elo,Rating deviation (RD),Matches played,Matches won,Matches loss,Matches drawn\n')
            
            for i, player in enumerate(players):
                fm.write(f'{i+1},{player.name},{player.rating},{player.rd},{player.matchs_played},{player.matches_won},{player.matches_lost},{player.matches_drawn}\n')
    
    def csv_export_top_ten(self):
        self.csv_export(Player.objects.all()[:10])
