
from django.contrib import admin
from .models import ChatRoom, Message, GroupMembers, FileAttachment, UserProfile

admin.site.register(ChatRoom)
admin.site.register(Message)
admin.site.register(GroupMembers)
admin.site.register(FileAttachment)
admin.site.register(UserProfile)

