from django.urls import path, include
from .views import UserdetailsViewSet, UserImageViewSet
from rest_framework.routers import DefaultRouter    

router = DefaultRouter()
router.register(r'userdetails', UserdetailsViewSet)
router.register(r'userimages', UserImageViewSet, basename='userimages')

urlpatterns = [
    path('', include(router.urls)),
]
