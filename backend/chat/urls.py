
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, ChatRoomViewSet, MessageViewSet,
    UserProfileViewSet,
    CustomTokenObtainPairView, CustomTokenRefreshView
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'rooms', ChatRoomViewSet)
router.register(r'messages', MessageViewSet)
router.register(r'profiles', UserProfileViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
]

