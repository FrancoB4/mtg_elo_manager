
class ImportService:
    def _parse_score(self, score: str) -> list:
        score = score.strip()
        score_p1 = int(score[0])
        score_p2 = int(score[2])
        played_games = score_p1 + score_p2
        total_score = score_p1 - score_p2
        
        if total_score == 0 and played_games == 0:
            # 0-0
            return [0, None, None]
        elif total_score == 1 and played_games == 1:
            # 1-0
            return [1, 0, None]
        elif total_score == -1 and played_games == 1:
            # 0-1
            return [-1, 0, None]
        elif total_score == 0 and played_games == 2:
            # 1-1
            return [1, -1, 0]
        elif total_score == 2 and played_games == 2:
            # 2-0
            return [1, 1, 0]
        elif total_score == -2 and played_games == 2:
            # 0-2
            return [-1, -1, 0]
        elif total_score == 1 and played_games == 3:
            # 2-1
            return [1, 1, -1]
        elif total_score == -1 and played_games == 3:
            # 1-2
            return [-1, -1, 1]
        
        return [None] * 3
    
    def import_tournament_from_csv(self, file_name: str):
        matches = []
        with open(file_name, 'r') as file:
            lines = file.readlines()
            for line in lines:
                p1, score, p2 = line.strip().split(',')
                score = self._parse_score(score)
                matches.append((p1.strip(), score, p2.strip()))
                
        return matches
