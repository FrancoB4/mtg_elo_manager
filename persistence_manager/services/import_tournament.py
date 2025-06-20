
class ImportService:
    def _parse_score(self, score: str) -> list:
        score_p1 = int(score[0])
        score_p2 = int(score[2])
        played_games = score_p1 + score_p2
        
        return[]
    
    def import_tournament_from_csv(self, file_name: str):
        matches = []
        with open(file_name, 'r') as file:
            lines = file.readlines()
            for line in lines:
                p1, score, p2 = line.strip().split(',')
                score = self._parse_score(score)
                matches.append((p1, score, p2))