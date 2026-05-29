
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.contrib.auth.models import User
from django.db.models import Q, OuterRef, Subquery
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import ChatRoom, Message, GroupMembers, FileAttachment, UserProfile
from .serializers import (
    UserSerializer, UserProfileSerializer, ChatRoomSerializer,
    MessageSerializer, FileAttachmentSerializer
)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'list', 'retrieve']:
            return [permissions.AllowAny()]
        if self.action == 'me':
            return [permissions.IsAuthenticated()]
        return super().get_permissions()

    def get_queryset(self):
        if self.action == 'list':
            return User.objects.all()
        return super().get_queryset()

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        from django.db import IntegrityError
        data = request.data
        try:
            user = User.objects.create_user(
                username=data['username'],
                email=data['email'],
                password=data['password'],
                first_name=data.get('first_name', ''),
                last_name=data.get('last_name', '')
            )
            serializer = self.get_serializer(user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except IntegrityError:
            return Response(
                {"username": ["A user with that username already exists."]},
                status=status.HTTP_400_BAD_REQUEST
            )


class ChatRoomViewSet(viewsets.ModelViewSet):
    queryset = ChatRoom.objects.all()
    serializer_class = ChatRoomSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(participants=self.request.user).distinct()

    def create(self, request, *args, **kwargs):
        data = request.data
        participants = [request.user.id] + data.get('participants', [])
        if data.get('type') == 'one_to_one':
            existing = ChatRoom.objects.filter(
                type='one_to_one',
                participants__in=participants
            ).distinct()
            for room in existing:
                if room.participants.count() == 2 and set(room.participants.values_list('id', flat=True)) == set(participants):
                    serializer = self.get_serializer(room)
                    return Response(serializer.data)
        room = ChatRoom.objects.create(
            name=data.get('name'),
            type=data.get('type', 'one_to_one')
        )
        room.participants.add(*participants)
        if data.get('type') == 'group':
            for user_id in participants:
                GroupMembers.objects.create(
                    room=room,
                    user_id=user_id,
                    is_admin=user_id == request.user.id
                )
        serializer = self.get_serializer(room)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def add_participant(self, request, pk=None):
        room = self.get_object()
        user_id = request.data.get('user_id')
        room.participants.add(user_id)
        if room.type == 'group':
            GroupMembers.objects.get_or_create(room=room, user_id=user_id)
        return Response({'status': 'participant added'})


class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        room_id = self.request.query_params.get('room_id')
        if room_id:
            return self.queryset.filter(room_id=room_id).order_by('timestamp')
        return self.queryset.filter(room__participants=self.request.user).order_by('-timestamp')

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        message = serializer.instance
        
        # Handle file attachments
        files = request.FILES.getlist('files')
        for f in files:
            FileAttachment.objects.create(
                message=message,
                file=f,
                file_name=f.name,
                file_type=f.content_type
            )
        
        # Broadcast message over WebSocket
        channel_layer = get_channel_layer()
        message_data = MessageSerializer(message, context={'request': request}).data
        async_to_sync(channel_layer.group_send)(
            f'chat_{message.room.id}',
            {
                'type': 'chat_message',
                'message': message_data
            }
        )
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        message = self.get_object()
        message.read_by.add(request.user)
        
        # Broadcast read receipt over WebSocket
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f'chat_{message.room.id}',
            {
                'type': 'message_read',
                'message_id': message.id,
                'user': UserSerializer(request.user).data
            }
        )
        
        return Response({'status': 'read'})


class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)


class CustomTokenObtainPairView(TokenObtainPairView):
    pass


class CustomTokenRefreshView(TokenRefreshView):
    pass

