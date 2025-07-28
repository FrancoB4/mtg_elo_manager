from django.core.management.base import BaseCommand
from django.conf import settings
import re


class Command(BaseCommand):
    help = 'Prueba patrones CORS con URLs de ejemplo'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--test-url',
            type=str,
            help='URL específica para probar'
        )
    
    def handle(self, *args, **options):
        test_url = options.get('test_url')
        
        # URLs de ejemplo para probar
        test_urls = [
            'https://abc12345.mtg-elo-manager.pages.dev',
            'https://feature-branch.mtg-elo-manager.pages.dev',
            'https://mtg-elo-manager.pages.dev',
            'https://preview-123.mtg-elo-manager.pages.dev',
            'http://localhost:3000',
            'https://malicious-site.com',
        ]
        
        if test_url:
            test_urls = [test_url]
        
        self.stdout.write(self.style.SUCCESS('Probando configuración CORS...'))
        self.stdout.write(f'CORS_ALLOW_ALL_ORIGINS: {settings.CORS_ALLOW_ALL_ORIGINS}')
        self.stdout.write(f'CORS_ALLOWED_ORIGINS: {settings.CORS_ALLOWED_ORIGINS}')
        
        patterns = getattr(settings, 'CORS_ALLOWED_ORIGIN_PATTERNS', [])
        self.stdout.write(f'CORS_ALLOWED_ORIGIN_PATTERNS: {len(patterns)} patrones')
        
        for pattern in patterns:
            self.stdout.write(f'  - {pattern}')
        
        self.stdout.write('\n' + '='*50)
        
        for url in test_urls:
            allowed = self.check_url_allowed(url)
            status = self.style.SUCCESS('✓ PERMITIDO') if allowed else self.style.ERROR('✗ BLOQUEADO')
            self.stdout.write(f'{status}: {url}')
    
    def check_url_allowed(self, url):
        """Simula la lógica de verificación CORS"""
        # Si CORS_ALLOW_ALL_ORIGINS está habilitado
        if getattr(settings, 'CORS_ALLOW_ALL_ORIGINS', False):
            return True
        
        # Verificar lista estática
        allowed_origins = getattr(settings, 'CORS_ALLOWED_ORIGINS', [])
        if url in allowed_origins:
            return True
        
        # Verificar patrones dinámicos
        patterns = getattr(settings, 'CORS_ALLOWED_ORIGIN_PATTERNS', [])
        for pattern in patterns:
            if re.match(pattern, url):
                return True
        
        return False
