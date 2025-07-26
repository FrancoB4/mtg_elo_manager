from rest_framework import pagination


class CustomPageNumberPagination(pagination.PageNumberPagination):
    """
    Custom pagination class that extends PageNumberPagination.
    """
    page_size = 20 
    page_size_query_param = 'page_size' 
    max_page_size = 100 
