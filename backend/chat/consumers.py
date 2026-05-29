
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import ChatRoom, Message, UserProfile
from .serializers import MessageSerializer, UserSerializer


User = get_user_model()


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'chat_{self.room_id}'
        
        # Set user online
        if self.scope['user'].is_authenticated:
            await self.set_user_online(self.scope['user'].id, True)
            await self.broadcast_user_status(self.scope['user'].id, True)
        
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Set user offline
        if self.scope['user'].is_authenticated:
            await self.set_user_online(self.scope['user'].id, False)
            await self.broadcast_user_status(self.scope['user'].id, False)
        
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        if data.get('type') == 'typing':
            await self.handle_typing(data)
        elif data.get('type') == 'read':
            await self.handle_read_receipt(data)

    async def handle_typing(self, data):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_typing',
                'user': data['user'],
                'is_typing': data['is_typing']
            }
        )

    async def handle_read_receipt(self, data):
        await self.mark_message_read(data['message_id'])
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'message_read',
                'message_id': data['message_id'],
                'user': data['user']
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'message',
            'message': event['message']
        }))

    async def user_typing(self, event):
        await self.send(text_data=json.dumps({
            'type': 'typing',
            'user': event['user'],
            'is_typing': event['is_typing']
        }))

    async def message_read(self, event):
        await self.send(text_data=json.dumps({
            'type': 'read',
            'message_id': event['message_id'],
            'user': event['user']
        }))

    async def user_status_change(self, event):
        await self.send(text_data=json.dumps({
            'type': 'user_status',
            'user_id': event['user_id'],
            'online': event['online']
        }))

    async def broadcast_user_status(self, user_id, online):
        # Get all rooms the user is in and broadcast to all those rooms
        rooms = await self.get_user_rooms(user_id)
        for room in rooms:
            await self.channel_layer.group_send(
                f'chat_{room.id}',
                {
                    'type': 'user_status_change',
                    'user_id': user_id,
                    'online': online
                }
            )

    @database_sync_to_async
    def get_user_rooms(self, user_id):
        return list(ChatRoom.objects.filter(participants__id=user_id))

    @database_sync_to_async
    def serialize_message(self, message):
        return MessageSerializer(message, context={'request': self.scope}).data

    @database_sync_to_async
    def mark_message_read(self, message_id):
        message = Message.objects.get(id=message_id)
        user = User.objects.get(id=self.scope['user'].id)
        message.read_by.add(user)

    @database_sync_to_async
    def set_user_online(self, user_id, online):
        try:
            profile = UserProfile.objects.get(user_id=user_id)
            profile.online = online
            if not online:
                profile.last_seen = timezone.now()
            profile.save()
        except UserProfile.DoesNotExist:
            pass

