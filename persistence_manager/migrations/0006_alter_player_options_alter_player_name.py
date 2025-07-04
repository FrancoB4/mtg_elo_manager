# Generated by Django 5.2.3 on 2025-06-20 23:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('persistence_manager', '0005_rename_vol_player_sigma'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='player',
            options={'ordering': ['-rating', 'rd']},
        ),
        migrations.AlterField(
            model_name='player',
            name='name',
            field=models.CharField(max_length=35, unique=True, verbose_name='name'),
        ),
    ]
