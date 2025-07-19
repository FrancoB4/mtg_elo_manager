from django.test import TestCase
from .models import Player
from .services.glicko2_service import Glicko2Service, Rating

class PlaterTest(TestCase):
    def setUp(self):
        self.p1 = Player.objects.create(name='P1', rating=1500, rd=200)
        self.p2 = Player.objects.create(name='P2', rating=1400, rd=30)
        self.p3 = Player.objects.create(name='P3', rating=1550, rd=100)
        self.p4 = Player.objects.create(name='P4', rating=1700, rd=300)
        
        
    def test_base_case(self):
        glicko = Glicko2Service()
        r1 = glicko.create_rating(self.p1.name, self.p1.rating, self.p1.rd, self.p1.sigma)
        r2 = glicko.create_rating(self.p2.name, self.p2.rating, self.p2.rd, self.p2.sigma)
        r3 = glicko.create_rating(self.p3.name, self.p3.rating, self.p3.rd, self.p3.sigma)
        r4 = glicko.create_rating(self.p4.name, self.p4.rating, self.p4.rd, self.p4.sigma)
        
        r1 = glicko.rate(r1, [(Player.WIN, r2), (Player.LOSS, r3), (Player.LOSS, r4)])
        
        self.assertAlmostEqual(r1.rating, 1464.06, delta=0.01)
        self.assertAlmostEqual(r1.rd, 151.52, delta=0.01)
        self.assertAlmostEqual(r1.sigma, 0.059998, delta=0.00001)
    