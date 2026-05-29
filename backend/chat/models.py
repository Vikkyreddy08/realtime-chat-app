
from django.db import models
from django.contrib.auth.models import User


class ChatRoom(models.Model):
    ROOM_TYPES = (
        ('one_to_one', 'One to One'),
        ('group', 'Group'),
    )
    name = models.CharField(max_length=100, blank=True, null=True)
    type = models.CharField(max_length=20, choices=ROOM_TYPES, default='one_to_one')
    participants = models.ManyToManyField(User, related_name='chat_rooms')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        if self.type == 'group' and self.name:
            return self.name
        participants = list(self.participants.values_list('username', flat=True))
        return ' & '.join(participants[:2])


class Message(models.Model):
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    read_by = models.ManyToManyField(User, related_name='read_messages', blank=True)

    def __str__(self):
        return f'{self.sender.username}: {self.content[:50]}'


class GroupMembers(models.Model):
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='members')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    joined_at = models.DateTimeField(auto_now_add=True)
    is_admin = models.BooleanField(default=False)

    class Meta:
        unique_together = ('room', 'user')

    def __str__(self):
        return f'{self.user.username} in {self.room}'


class FileAttachment(models.Model):
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='attachments/')
    file_name = models.CharField(max_length=255)
    file_type = models.CharField(max_length=100)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.file_name


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    online = models.BooleanField(default=False)
    last_seen = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.user.username

