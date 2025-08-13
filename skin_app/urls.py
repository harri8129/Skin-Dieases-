from django.urls import path, include
from .views import UserdetailsViewSet, UserImageViewSet,DiseaseInfoViewSet
from rest_framework.routers import DefaultRouter    

router = DefaultRouter()
router.register(r'userdetails', UserdetailsViewSet)
router.register(r'userimages', UserImageViewSet, basename='userimages')
router.register(r'disease-info', DiseaseInfoViewSet, basename='disease-info')

urlpatterns = [
    path('', include(router.urls)),
]
