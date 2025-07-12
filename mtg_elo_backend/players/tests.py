from django.test import TestCase
from .models import Player

class PlaterTest(TestCase):
    def setUp(self):
        self.p1 = Player.objects.create(name='P1')
        self.p2 = Player.objects.create(name='P2', rating=1400, rd=30)
        self.p3 = Player.objects.create(name='P3', rating=1550, rd=100)
        self.p4 = Player.objects.create(name='P4', rating=1700, rd=300)
        
        
    def example_case_test(self):
        # Create a player called Ryan
        Ryan = glicko2.Player()
        # Following the example at:
        # http://math.bu.edu/people/mg/glicko/glicko2.doc/example.html
        # Pretend Ryan (of rating 1500 and rating deviation 350)
        # plays players of ratings 1400, 1550 and 1700
        # and rating deviations 30, 100 and 300 respectively
        # with outcomes 1, 0 and 0.
        #sprint "Old Rating: " + str(Ryan.rating)
        print("Old Rating Deviation: " + str(p1.rd))
        print("Old Volatility: " + str(p1.vol))
        p1.update_player([p2.elo, p3.elo, p4.elo],
            [p2.rating_derivation, p3.rating_derivation, p4.rating_derivation], [1, 0, 0])
        print("New Rating: " + str(p1.rating))
        print("New Rating Deviation: " + str(p1.rd))
        print("New Volatility: " + str(p1.vol))
    