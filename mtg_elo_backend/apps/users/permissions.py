from rest_framework import permissions
from rest_framework.request import Request
from rest_framework.views import APIView


class IsLeagueAdmin(permissions.BasePermission):
    """
    Custom permission to only allow league admins to access certain views.
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.base_role == 'LEAGUE_ADMIN'
    

class IsTournamentAdmin(permissions.BasePermission):
    """
    Custom permission to only allow tournament admins to access certain views.
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.base_role == 'TOURNAMENT_ADMIN'
    
    
class IsPlayer(permissions.BasePermission):
    """
    Custom permission to only allow players to access certain views.
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.base_role == 'PLAYER'
    

class IsSelf(permissions.BasePermission):
    """
    Custom permission to only allow users to access their own data.
    """

    def has_permission(self, request: Request, view: APIView) -> bool: # type: ignore
        user_id = int(view.kwargs.get('id'))
        return request.user.is_authenticated and request.user.id == user_id
    

class IsSuperUser(permissions.BasePermission):
    """
    Custom permission to only allow superusers to access certain views.
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_superuser