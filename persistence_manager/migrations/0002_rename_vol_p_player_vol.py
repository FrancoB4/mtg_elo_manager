# Generated by Django 4.2.21 on 2025-06-16 16:05

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('persistence_manager', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='player',
            old_name='vol_p',
            new_name='vol',
        ),
    ]
