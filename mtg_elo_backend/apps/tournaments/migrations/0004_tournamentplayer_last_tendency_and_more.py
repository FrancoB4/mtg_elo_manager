# Generated by Django 5.2.1 on 2025-07-26 19:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tournaments', '0003_tournamentplayer_matches_played'),
    ]

    operations = [
        migrations.AddField(
            model_name='tournamentplayer',
            name='last_tendency',
            field=models.IntegerField(choices=[(2, '↑'), (1, '↗'), (0, '→'), (-1, '↘'), (-2, '↓')], default=0, help_text="The last tendency of the player's rating, which indicates             the direction of the player's performance in recent matches.", verbose_name='last tendency'),
        ),
        migrations.AlterField(
            model_name='tournamentplayer',
            name='matches_drawn',
            field=models.IntegerField(default=0, help_text='The number of matches drawn by the player.', verbose_name='matches drawn'),
        ),
        migrations.AlterField(
            model_name='tournamentplayer',
            name='matches_lost',
            field=models.IntegerField(default=0, help_text='The number of matches lost by the player.', verbose_name='matches lost'),
        ),
        migrations.AlterField(
            model_name='tournamentplayer',
            name='matches_played',
            field=models.IntegerField(default=0, help_text='The number of matches played by the player.', verbose_name='matches played'),
        ),
        migrations.AlterField(
            model_name='tournamentplayer',
            name='matches_won',
            field=models.IntegerField(default=0, help_text='The number of matches won by the player.', verbose_name='matches won'),
        ),
        migrations.AlterField(
            model_name='tournamentplayer',
            name='rating',
            field=models.IntegerField(default=1500, help_text='The rating of a player, wich measures the skill level.', verbose_name='elo'),
        ),
        migrations.AlterField(
            model_name='tournamentplayer',
            name='rd',
            field=models.FloatField(default=350, help_text='Rating Deviation: the uncertainty in the rating of a player.', verbose_name='RD'),
        ),
        migrations.AlterField(
            model_name='tournamentplayer',
            name='sigma',
            field=models.FloatField(default=0.06, help_text="The volatility of the player's rating, which measures the             consistency of the player's performance.", verbose_name='vol'),
        ),
    ]
