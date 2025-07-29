from django.contrib import admin
from .models import League, LeaguePlayer, LeagueFormat

# Register your models here.
admin.site.register(League)
admin.site.register(LeaguePlayer)
admin.site.register(LeagueFormat)