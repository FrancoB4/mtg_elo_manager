from ..models import Player
from datetime import datetime as dt

class ExportService:
    def table_export(self, players = None):
        header = f'{"Jugador":^35}|{"Elo":^6}|{"RD":^14}|'
        separator = '-' * len(header)
        print(header)
        print(separator)
        if players is None:
            players = Player.objects.all()
            
        for player in players:
            print(player)
            
        print(separator)
        
    def table_export_top_ten(self):
        self.table_export(Player.objects.all()[:10])
        
    def csv_export(self, players = None):
        if players is None:
            players = Player.objects.all()
            
        with open(f'exports/ranking_{dt.now()}.csv', 'wt') as fm:
            fm.write('Player,elo,rating deviation\n')
            
            for player in players:
                fm.write(f'{player.name},{player.rating},{player.rd}\n')
    
    def csv_export_top_ten(self):
        self.csv_export(Player.objects.all()[:10])
