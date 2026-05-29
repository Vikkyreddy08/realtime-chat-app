
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import ChatRoom, Message, GroupMembers, FileAttachment, UserProfile


class UserSerializer(serializers.ModelSerializer):
    online = serializers.SerializerMethodField()
    last_seen = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'online', 'last_seen']

    def get_online(self, obj):
        if hasattr(obj, 'profile'):
            return obj.profile.online
        return False

    def get_last_seen(self, obj):
        if hasattr(obj, 'profile'):
            return obj.profile.last_seen
        return None


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = UserProfile
        fields = ['id', 'user', 'avatar', 'online', 'last_seen']


class FileAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = FileAttachment
        fields = ['id', 'file', 'file_name', 'file_type', 'uploaded_at']


class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    attachments = FileAttachmentSerializer(many=True, read_only=True)
    is_read = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ['id', 'room', 'sender', 'content', 'timestamp', 'attachments', 'read_by', 'is_read']

    def get_is_read(self, obj):
        user = self.context.get('request').user
        return user in obj.read_by.all()


class GroupMembersSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = GroupMembers
        fields = ['id', 'user', 'joined_at', 'is_admin']


class ChatRoomSerializer(serializers.ModelSerializer):
    participants = UserSerializer(many=True, read_only=True)
    members = GroupMembersSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = ChatRoom
        fields = ['id', 'name', 'type', 'participants', 'members', 'created_at', 'last_message', 'unread_count']

    def get_last_message(self, obj):
        last_msg = obj.messages.order_by('-timestamp').first()
        return MessageSerializer(last_msg, context=self.context).data if last_msg else None

    def get_unread_count(self, obj):
        user = self.context.get('request').user
        return obj.messages.exclude(read_by=user).count()

