from rest_framework.response import Response
from .views import init_user_profile, send_telegram_message


def check_for_email(backend, uid, user=None, *args, **kwargs):
    if not kwargs['details'].get('email'):
        return Response({'error': "Email wasn't provided by oauth provider"}, status=400)


def create_profile(user, response, *args, **kwargs):
    if not user:
        return Response({'error': "User profile not provided from social account."}, status=500)
    if user and not user.zametka.all().count():
        msg = 'Social user enter: ' + user.email
        print(msg)
        init_user_profile(user)
        send_telegram_message(msg)
