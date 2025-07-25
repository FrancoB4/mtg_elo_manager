# Generated by Django 5.2.1 on 2025-07-24 16:43

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Player',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('rating', models.IntegerField(default=1500, help_text='The rating of a player, wich measures the skill level.', verbose_name='elo')),
                ('rd', models.FloatField(default=350, help_text='Rating Deviation: the uncertainty in the rating of a player.', verbose_name='RD')),
                ('sigma', models.FloatField(default=0.06, help_text="The volatility of the player's rating, which measures the             consistency of the player's performance.", verbose_name='vol')),
                ('matches_played', models.IntegerField(default=0, help_text='The number of matches played by the player.', verbose_name='matches played')),
                ('matches_won', models.IntegerField(default=0, help_text='The number of matches won by the player.', verbose_name='matches won')),
                ('matches_drawn', models.IntegerField(default=0, help_text='The number of matches drawn by the player.', verbose_name='matches drawn')),
                ('matches_lost', models.IntegerField(default=0, help_text='The number of matches lost by the player.', verbose_name='matches lost')),
                ('last_tendency', models.IntegerField(choices=[(2, '↑'), (1, '↗'), (0, '→'), (-1, '↘'), (-2, '↓')], default=0, help_text="The last tendency of the player's rating, which indicates             the direction of the player's performance in recent matches.", verbose_name='last tendency')),
                ('name', models.CharField(max_length=35, unique=True, verbose_name='name')),
            ],
            options={
                'ordering': ['-rating', 'rd'],
                'abstract': False,
            },
        ),
    ]
