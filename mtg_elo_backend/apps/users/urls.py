from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns
from .views import CreateUserView


urlpatterns = [
    path('register/', CreateUserView.as_view(), name='register'),
]

urlpatterns = format_suffix_patterns(urlpatterns)