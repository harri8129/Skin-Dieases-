from django.urls import path,include
from .views import UserdetailsViewSet
from rest_framework.routers import DefaultRouter    

router = DefaultRouter()
router.register(r'userdetails',UserdetailsViewSet)


urlpatterns = [
    path('',include(router.urls)),
]

