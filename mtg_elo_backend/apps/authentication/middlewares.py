class JWTAuthCookieMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        access_token = request.COOKIES.get('access')
        refresh_token = request.COOKIES.get('refresh')
        if access_token:
            # Esto extrae el token de acceso de la cookie y lo añade al header Authorization.
            request.META['HTTP_AUTHORIZATION'] = f'Bearer {access_token}'
        elif refresh_token and request.path.endswith('refresh/'):
            request.META['HTTP_AUTHORIZATION'] = f'Bearer {refresh_token}'
        return self.get_response(request)