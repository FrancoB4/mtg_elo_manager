# Generated by Django 4.2.21 on 2025-06-16 17:19

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('persistence_manager', '0004_rename_elo_player_rating'),
    ]

    operations = [
        migrations.RenameField(
            model_name='player',
            old_name='vol',
            new_name='sigma',
        ),
    ]
