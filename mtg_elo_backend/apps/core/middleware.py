import re
from django.conf import settings
from corsheaders.middleware import CorsMiddleware


class DynamicCorsMiddleware(CorsMiddleware):
    """
    Middleware personalizado para manejar CORS con dominios dinámicos de Cloudflare.
    Permite patrones de subdominios para preview deployments.
    """
    
    def origin_found_in_white_lists(self, origin, url):
        """
        Verifica si el origin está permitido, incluyendo patrones dinámicos.
        """
        # Primero verifica la lista estática normal
        if super().origin_found_in_white_lists(origin, url):
            return True
        
        # Patrones dinámicos para Cloudflare Pages
        dynamic_patterns = getattr(settings, 'CORS_ALLOWED_ORIGIN_PATTERNS', [])
        
        for pattern in dynamic_patterns:
            if re.match(pattern, origin):
                return True
        
        return False
