from rest_framework.viewsets import ModelViewSet, ViewSet
from rest_framework.views import APIView
from .models import *
from .serializers import *
from rest_framework import permissions
from django.contrib.auth.models import User
from rest_framework.response import Response
from django.shortcuts import get_object_or_404, render
from django.dispatch import receiver
from djoser.signals import user_activated, user_registered
from rest_framework import status
from rest_framework.decorators import action
import time
from datetime import datetime
from django.core.exceptions import ObjectDoesNotExist
from django.core.mail import EmailMessage
from smtplib import SMTPException
from plat_back.settings import RECAPTCHA_SECRET_KEY, RECAPTCHA_SITE_KEY
import logging
from django.utils.html import mark_safe
from asgiref.sync import sync_to_async, async_to_sync
from django.http import JsonResponse
import json
from django.views.decorators.csrf import csrf_exempt
import httpx
import asyncio
# from djoser.views import UserViewSet

logger = logging.getLogger(__name__)


def create_default_uslugi(user):
    for u in ['Вода', 'Вывоз ТБО', 'Газ', 'Квартплата', 'Отопление', 'Свет', ]:
        u_obj, is_created = Usluga.objects.get_or_create(name=u)
        u_obj.owner.add(user)


def init_user_profile(user):
    Zametka.objects.get_or_create(owner=user)
    Settings.objects.get_or_create(owner=user)
    if not user.usluga.count():
        create_default_uslugi(user)


def send_telegram_message(msg):
    """
    Как отправить сообщение в Telegram из PowerShell
    https://userman.ru/2019/03/22/kak-otpravit-soobschenie-v-telegram-iz-powershell.html
    """
    try:
        url = 'https://api.telegram.org/bot1698170089:AAE1oKM47hxt5HnyYumIjuGISI-a6W3JyNs/sendMessage?chat_id=-471529331&text='
        httpx.get(url + msg)
    except httpx.RequestError:
        logger.error("An error occurred while requesting Telegram ")


@receiver(user_activated)
def signal_user_activated(sender, user, request, **kwargs):
    """Как только юзер активирован - выполняется этот код"""
    # print('Signal: sender / request', sender, request)
    # print('Uslugi count:', user.usluga.count())
    msg = 'User activated: ' + user.email
    print(msg)
    init_user_profile(user)
    send_telegram_message(msg)


@receiver(user_registered)
def signal_user_registered(sender, user, request, **kwargs):
    """Как только юзер зарегистрирован - выполняется этот код"""
    msg = 'New user registered: ' + user.email
    print(msg)
    send_telegram_message(msg)


class ZametkaViewSet(ModelViewSet):
    queryset = Zametka.objects.all()
    serializer_class = ZametkaSerializer


class SettingsViewSet(ModelViewSet):
    queryset = Settings.objects.all()
    serializer_class = SettingsSerializer


def destroy_usluga_in_sheta(user_obj, usluga_id):
    """Удаляем услугу из всех счетов в адресах юзера"""
    adr_qs = user_obj.adres.all()
    sch_qs = Schet.objects.filter(usluga_id=usluga_id, addr__in=adr_qs)
    sch_qs.delete()


def is_edit_usluga_input_data_valid(request_data):
    keys = ['plat_id', 'new_serv_names', 'removed_serv_names']
    err = 'Check edit platejka error: '
    if not all(key in request_data for key in keys):
        print(err + 'Not all keys present')
        return False, None, None

    arr_new_serv_names = request_data['new_serv_names']
    arr_removed_serv_names = request_data['removed_serv_names']

    if not arr_new_serv_names and not arr_removed_serv_names:
        print(err + 'Arrays is empty')
        return False, None, None
    if len(arr_new_serv_names) > 16:
        print(err + 'New names array too big')
        return False, None, None

    if any(rem_itm in arr_new_serv_names for rem_itm in arr_removed_serv_names):
        print(err + 'Need to remove usluga present in the new uslugas array.')
        return False, None, None

    return True, arr_new_serv_names, arr_removed_serv_names


class UslugaViewSet(ModelViewSet):
    queryset = Usluga.objects.all()
    serializer_class = UslugaFullSerializer

    def create(self, request, **kwargs):
        # print('Create usluga data:', request.data)
        # user = get_object_or_404(User, pk=request.data['owner'])
        if request.user.usluga.all().count() >= 16:  # Защита: Если услуг у юзера более 16
            return Response(status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        usl_obj, is_created = Usluga.objects.get_or_create(name=request.data['name'])
        usl_obj.owner.add(request.user)
        ser_data = UslugaFullSerializer(usl_obj).data
        # print(ser_data)
        return Response(ser_data, status=status.HTTP_201_CREATED)

    def partial_update(self, request, pk=None, **kwargs):
        # user = get_object_or_404(User, pk=request.data['owner'])
        user = request.user
        current_usluga = get_object_or_404(Usluga, pk=pk)

        if user.usluga.all().count() >= 16:  # Защита: Если услуг у юзера более 16
            return Response(status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        next_usluga, is_created = Usluga.objects.get_or_create(name=request.data['name'])

        # защита от маловероятной ситуации
        if current_usluga.pk == next_usluga.pk and next_usluga.owner.all().count() == 1:
            next_usluga.name = request.data['name']
            next_usluga.save()
            return Response(status=status.HTTP_200_OK)
        next_usluga.owner.add(user)
        current_usluga.owner.remove(user)

        if not current_usluga.owner.all().count():
            current_usluga.delete()
        ser_data = UslugaFullSerializer(next_usluga).data
        return Response(ser_data, status=status.HTTP_200_OK)

    def destroy(self, request, pk=None, **kwargs):
        # print('Usluga delete:', pk, request.data)
        # user = get_object_or_404(User, pk=request.data['owner'])
        user = request.user
        destroy_usluga_in_sheta(user, pk)
        usl = get_object_or_404(Usluga, pk=pk)
        usl.owner.remove(user)
        if not usl.owner.all().count():
            usl.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['patch'])
    def bulk_patch(self, request, **kwargs):
        """Когда юзер добавляет или удаляет услуги платежки через диалог"""
        print('Patch bulk:', request.data)
        # return Response(status=status.HTTP_200_OK)
        is_in_data_valid, arr_new_serv_names, arr_removed_serv_names = is_edit_usluga_input_data_valid(request.data)
        if not is_in_data_valid:
            return Response(status=status.HTTP_406_NOT_ACCEPTABLE)

        # user = get_object_or_404(User, pk=request.data['owner'])
        user = request.user
        platejka = get_object_or_404(Platejka, pk=request.data['plat_id'])
        adres = get_object_or_404(Adres, name=platejka.addr)
        qs = platejka.stroka.filter(srvc_name__in=arr_removed_serv_names)
        qs.delete()  # Удаляем эти услуги только из платежки

        arr_serialized_uslugi = []
        arr_serialized_scheta = []
        arr_serialized_stroki = []
        # print('New uslugi:', arr_new_serv_names)
        for usl_name in arr_new_serv_names:
            # Если услуга с таким именем есть в платежке берем след. услугу
            if platejka.stroka.filter(srvc_name=usl_name).exists():
                # print('Usluga in platejka presented:', usl_name)
                continue

            if user.usluga.all().count() >= 16:  # Защита: Если услуг у юзера более 16
                return Response(status=status.HTTP_422_UNPROCESSABLE_ENTITY)

            usl_obj, is_usl_created = Usluga.objects.get_or_create(name=usl_name)
            #  Если юзер небыл привязан к этой услуге
            if not usl_obj.owner.filter(pk=user.pk).exists():
                usl_obj.owner.add(user)
                ser_data = UslugaSerializer(usl_obj).data
                arr_serialized_uslugi.append(ser_data)

            if adres.scheta.all().count() >= 16:  # Защита: Если счетов у адреса более 16
                return Response(status=status.HTTP_422_UNPROCESSABLE_ENTITY)

            # Создаем счет для услуги
            schet_obj, is_sch_created = Schet.objects.get_or_create(addr=adres, usluga=usl_obj)
            if is_sch_created:
                ser_data = SchetSerializer(schet_obj).data
                arr_serialized_scheta.append(ser_data)

            if platejka.stroka.all().count() >= 16:  # Защита: Если строк в платежке более 16
                return Response(status=status.HTTP_422_UNPROCESSABLE_ENTITY)

            # Добавляем строку в платежку с новой услугой
            stroka_obj, is_stroka_created = Stroka.objects.get_or_create(
                plat=platejka, srvc_name=usl_obj.name, schet=schet_obj.schet)
            ser_data = StrokaSerializer(stroka_obj).data
            arr_serialized_stroki.append(ser_data)

        resp_object = {
            'new_uslugi': arr_serialized_uslugi,
            'new_scheta': arr_serialized_scheta,
            'new_stroki': arr_serialized_stroki,
        }
        # print('Response object:', resp_object)
        # time.sleep(1)
        return Response(resp_object, status=status.HTTP_200_OK)


class PayerViewSet(ModelViewSet):
    queryset = Payer.objects.all()
    serializer_class = PayerFullSerializer
    # permission_classes = [permissions.IsAuthenticated]

    def partial_update(self, request, pk=None, **kwargs):
        """Обновление имени плательщика из настроек"""
        # print('Payer update:', pk, request.data['name'])
        pr = get_object_or_404(Payer, pk=pk)
        pr.name = request.data['name']
        pr.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ErcViewSet(ModelViewSet):
    queryset = Erc.objects.all()
    serializer_class = ErcFullSerializer

    def partial_update(self, request, pk=None, **kwargs):
        """Обновление кода ЕРЦ из настроек"""
        erc = get_object_or_404(Erc, pk=pk)
        erc.name = request.data['name']
        erc.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


# def check_object(user, in_obj, model):
#     if in_obj['id'] == -1:
#         obj, is_created = model.objects.get_or_create(owner=user, name=in_obj['name'])
#     else:
#         obj, is_created = model.objects.get_or_create(pk=in_obj['id'], owner=user, defaults={'name': in_obj['name']})
#     return obj


class PlatejkaViewSet(ModelViewSet):
    """
    This viewset automatically provides `list`, `create`, `retrieve`,
    `update` and `destroy` actions.
    """
    queryset = Platejka.objects.all()
    serializer_class = PlatejkaSerializer
    # permission_classes = [permissions.IsAuthenticated]

    def create(self, request, **kwargs):
        print('Create new platejka:', request.data)
        # user = get_object_or_404(User, pk=request.data['owner'])
        payer_obj = get_object_or_404(Payer, pk=request.data['payer_id'])
        erc_id = request.data['erc_id']
        erc_name = ''
        if erc_id != -1:
            erc_obj = get_object_or_404(Erc, pk=erc_id)
            erc_name = erc_obj.name
        adr_obj = get_object_or_404(Adres, pk=request.data['adr_id'])
        # payer_obj = check_object(user, request.data['payer_obj'], Payer)
        # adr_obj = check_object(user, request.data['adr_obj'], Adres)
        date = request.data['pdate']
        now = datetime.now()
        y = int(date[:4])
        m = int(date[-2:]) - 1

        # Защита даты
        if y not in range(2014, now.year+1) or m < 0 or m > 11 or (y == now.year and m > now.month-1):
            # print('now y:', now.year, 'now m:', now.month, 'in m:', m, 'in y:', y)
            return Response(status=status.HTTP_406_NOT_ACCEPTABLE)

        # Защита: если платежек в этом месяце больше 16
        if request.user.platejka.filter(pyear=y, pmonth=m).count() >= 16:
            return Response(status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        pay_period = request.data['pay_period']
        if len(pay_period) > 8:
            return Response(status=status.HTTP_406_NOT_ACCEPTABLE)

        plat_obj, is_created = Platejka.objects.get_or_create(
            owner=request.user,
            addr=adr_obj.name,
            payer=payer_obj.name,
            erc=erc_name,
            pyear=y,
            pmonth=m,
            pay_period=pay_period,
        )
        if is_created:
            Stroka.objects.bulk_create([Stroka(plat=plat_obj, srvc_name=sch.usluga.name, schet=sch.schet) for sch in adr_obj.scheta.all()])
        # ser_data = {
        #     'plat_data': PlatejkaSerializer(plat_obj).data,
        #     'payer_data': PayerSerializer(payer_obj).data,
        #     'adr_data': AdresNameSerializer(adr_obj).data,
        # }
        ser_data = PlatejkaSerializer(plat_obj).data
        # time.sleep(7)
        return Response(ser_data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['patch'])
    def edit_stroki(self, request, **kwargs):
        """Обновляем измененные строки в платежке"""
        # print('Edited stroki:', request.data)
        arr_stroki = []
        arr_scheta = []
        upd_fields = set()
        for in_stroka in request.data:
            db_stroka = get_object_or_404(Stroka, pk=in_stroka['id'])
            for key, val in in_stroka.items():
                if key == 'id':
                    continue
                if key == 'schet':
                    sch_obj = get_object_or_404(Schet, addr__name=db_stroka.plat.addr, usluga__name=db_stroka.srvc_name)
                    sch_obj.schet = val
                    arr_scheta.append(sch_obj)

                setattr(db_stroka, key, val)  # Установка значения для поля строки
                upd_fields.add(key)
            arr_stroki.append(db_stroka)
        Stroka.objects.bulk_update(arr_stroki, upd_fields)
        if len(arr_scheta):
            Schet.objects.bulk_update(arr_scheta, ['schet'])
        # print('Edit stroki:', arr_stroki)
        return Response(status=status.HTTP_200_OK)

    @action(detail=False, methods=['patch'])
    def edit_payer(self, request, **kwargs):
        """Обновление Плательщика платежки"""
        payer_name = request.data['payer_name']
        if not len(payer_name):
            return Response(status=status.HTTP_406_NOT_ACCEPTABLE)
        # print('Platejka payer update:', pk, request.data['name'])
        # user = get_object_or_404(User, pk=request.user)
        user = request.user
        plat_obj = get_object_or_404(Platejka, pk=request.data['plat_id'])
        plat_obj.payer = payer_name
        plat_obj.save()
        if user.payer.all().count() == 16:
            return Response(status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        payer_obj, is_payer_created = Payer.objects.get_or_create(name=payer_name, owner=user)
        if not is_payer_created:
            return Response(status=status.HTTP_204_NO_CONTENT)

        return Response(PayerSerializer(payer_obj).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['patch'])
    def edit_erc(self, request, **kwargs):
        """Обновление ЕРЦ платежки"""
        erc_name = request.data['erc']
        # print('Platejka ERC update:', pk, request.data['name'])
        user = request.user
        plat_obj = get_object_or_404(Platejka, pk=request.data['plat_id'])
        plat_obj.erc = erc_name
        plat_obj.save()
        if user.erc.all().count() == 64:
            return Response(status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        if len(erc_name):
            erc_obj, is_erc_created = Erc.objects.get_or_create(name=erc_name, owner=user)
            if not is_erc_created:
                return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            return Response(status=status.HTTP_204_NO_CONTENT)

        return Response(ErcSerializer(erc_obj).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['patch'])
    def edit_pay_period(self, request, **kwargs):
        """Обновление периода оплаты платежки"""
        pay_period = request.data['pay_period']
        plat_obj = get_object_or_404(Platejka, pk=request.data['plat_id'])
        plat_obj.pay_period = pay_period
        plat_obj.save()
        return Response(status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def copy_last_plat(self, request, **kwargs):
        """ Копирование платежек из предыдущего месяца в текущий"""
        # print(request.user)
        # print(request.auth)  # Возвращает access token
        # print(request.data)
        m = request.data['month']
        # m = 1
        y = request.data['year']
        # y = 2019

        # Защита от флуда
        if request.user.platejka.filter(pyear=y, pmonth=m).count() >= 16:
            return Response(status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        # Исключаемые адреса которые уже есть в платежках по указанной дате
        exclude_addrss = request.user.platejka.filter(pyear=y, pmonth=m).values_list('addr', flat=True)
        # print('Need to exclude addresses:', exclude_addrss)
        try:  # Получаем платежку перед последней датой, чтобы узнать ее дату
            plat_before_last = request.user.platejka.exclude(pyear__gte=y, pmonth__gte=m).latest('pyear', 'pmonth')
        except ObjectDoesNotExist:
            return Response(status=status.HTTP_406_NOT_ACCEPTABLE)
        # print('Last Platejka:', plat_before_last)
        last_plats_qs = request.user.platejka.filter(
            pmonth=plat_before_last.pmonth,
            pyear=plat_before_last.pyear).exclude(addr__in=exclude_addrss)
        # print('Need to copy platejki:', last_plats_qs)

        def get_pay_period(prev_pp):
            # prev_pp = '2021-01'
            # m=2
            # print('prev_pp', prev_pp, m)
            yy = int(y)
            if not prev_pp:
                mm = m
            else:
                mm = int(prev_pp[-2:])
                if mm == m:
                    mm += 1
                else:
                    mm = m

            if not mm:
                mm = 12
                yy -= 1

            # print('prev_pp', f'{yy}-{mm:02d}')
            # return 1 / 0
            return f'{yy}-{mm:02d}'

        send_plats = []
        for prev_plat in last_plats_qs:
            new_plat = Platejka.objects.create(
                owner=request.user,
                pmonth=m,
                pyear=y,
                addr=prev_plat.addr,
                payer=prev_plat.payer,
                erc=prev_plat.erc,
                pay_period=get_pay_period(prev_plat.pay_period),
            )
            for prev_stroka in prev_plat.stroka.all():
                Stroka.objects.create(
                    plat=new_plat,
                    srvc_name=prev_stroka.srvc_name,
                    schet=prev_stroka.schet,
                    counter_prev=prev_stroka.counter_curr
                )
            send_plats.append(PlatejkaSerializer(new_plat).data)
            print('Platejka was copied:', prev_plat.addr)
        return Response(send_plats, status=status.HTTP_200_OK)


class AdresViewSet(ModelViewSet):
    queryset = Adres.objects.all()
    serializer_class = AdresSerializer
    # permission_classes = [permissions.IsAuthenticated]

    def create(self, request, **kwargs):
        # print('Create addr data:', request.data)
        # user = get_object_or_404(User, pk=request.data['owner'])
        user = request.user

        if user.adres.all().count() >= 16:  # Защита: Если адресов у юзера более 16
            return Response(status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        a_obj, is_created = Adres.objects.get_or_create(name=request.data['name'], owner=user)
        if is_created:
            a_obj.owner = user
            Schet.objects.bulk_create([Schet(usluga=u, addr=a_obj, schet='') for u in user.usluga.all()])
            ser_data = AdresSerializer(a_obj).data
            # print(ser_data)
            return Response(ser_data, status=status.HTTP_201_CREATED)
        return Response(status=status.HTTP_201_CREATED)

    def partial_update(self, request, pk=None, **kwargs):
        # print('addr update:', pk, request.data['name'])
        addr = get_object_or_404(Adres, pk=pk)
        addr.name = request.data['name']
        addr.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class SchetViewSet(ModelViewSet):
    queryset = Schet.objects.all()
    serializer_class = SchetSerializer
    # permission_classes = [permissions.IsAuthenticated]

    def partial_update(self, request, pk=None, **kwargs):
        # print('schet update:', pk, request.data['schet'])
        sch = get_object_or_404(Schet, pk=pk)
        sch.schet = request.data['schet']
        sch.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def create(self, request, **kwargs):
        # print('Create schet data:', request.data)
        # user = get_object_or_404(User, pk=request.data['owner'])
        user = request.user
        adr = get_object_or_404(Adres, pk=request.data['adr_id'])

        if user.usluga.all().count() >= 16:  # Защита: Если услуг у юзера более 16
            return Response(status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        usluga_obj, is_usl_created = Usluga.objects.get_or_create(name=request.data['usluga_name'])
        usluga_obj.owner.add(user)

        if adr.scheta.all().count() >= 16:  # Защита: Если счетов у адреса более 16
            return Response(status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        schet_obj, is_sch_created = Schet.objects.get_or_create(addr=adr, usluga=usluga_obj)
        return Response(SchetSerializer(schet_obj).data, status=status.HTTP_201_CREATED)


class UserViewSet(ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    # permission_classes = [permissions.AllowAny]
    # permission_classes = [permissions.IsAuthenticated]

    def retrieve(self, request, pk=None, **kwargs):
        queryset = User.objects.all()
        user = get_object_or_404(queryset, pk=pk)
        # print('Uslugi count:', user.usluga.count())
        serializer = UserSerializer(user)
        return Response(serializer.data)


class Testoid(APIView):
    throttle_scope = 'testoid'
    permission_classes = [permissions.AllowAny]
    #
    #     @action(["post"], detail=False)
    #     def resend_activation(self, request, *args, **kwargs):
    #         print('Testoid request', request._request)
    #         return Response({'message': 'ok'}, status=status.HTTP_200_OK)
    #

    def post(self, request, *args, **kwargs):
        # print('Testoid request', request._request)
        # request._request.path = 'auth/users/resend_activation/'
        # request._request.path_info = 'auth/users/resend_activation/'
        # req = request._request
        # response = UserViewSet.as_view({'post': 'perform_create'})(request._request, *args, **kwargs)
        # response = UserViewSet.as_view({'post': 'create'})(req, *args, **kwargs)
        print('Testoid endpoint')
        return Response({'message': 'ok'}, status=status.HTTP_200_OK)


class DelAccount(APIView):
    def delete(self, request):
        user = request.user
        print('User delete:', user.pk)
        user.delete()
        return Response(status=status.HTTP_200_OK)


async def check_recaptcha(recaptcha_response):
    # return False
    g_data = {
        'response': recaptcha_response,
        'secret': RECAPTCHA_SECRET_KEY
    }
    try:
        async with httpx.AsyncClient() as client:
            print('check_recaptcha before')
            resp = await client.post('https://www.google.com/recaptcha/api/siteverify', data=g_data)
            print('check_recaptcha', resp.text)
            if resp.status_code == httpx.codes.OK:
                result_json = resp.json()
    except httpx.RequestError as exc:
        print(f"An error occurred while requesting google {exc.request.url!r}.")
        return False

    # resp = requests.post('https://www.google.com/recaptcha/api/siteverify', data=g_data)
    if (not result_json['success']) or (not result_json['action'] == 'feedback_handler'):
        logger.warning('Captcha is wrong')
        return False

    return True


# @sync_to_async
# @csrf_exempt
# @async_to_sync
async def support_form(request):
    if request.method != 'POST':
        return JsonResponse({'result': 'Not allowed'}, status=405)

    jo = json.loads(request.body)
    email_addr = jo['email']
    msg = jo['msg']
    logger.info(f"Message FROM: {email_addr}  MSG: {msg}")
    is_valid = True
    if len(email_addr) > 64:
        is_valid = False
    if len(msg) > 1024:
        is_valid = False
    if not is_valid:
        return JsonResponse({'result': 'Not allowed'}, status=405)

    g_data = {
        'response': jo['recaptcha_response'],
        'secret': RECAPTCHA_SECRET_KEY
    }
    gresp = httpx.post('https://www.google.com/recaptcha/api/siteverify', data=g_data)
    rjson = gresp.json()
    # print('rjson:', rjson)
    if not rjson['success']:
        logger.warning('Captcha is wrong')
        return JsonResponse({'err': 'Recaptcha is wrong'}, status=400)

    email = EmailMessage(
        'Ответ на обращение в "МОИ ПЛАТЕЖКИ онлайн"',
        msg,
        'МОИ ПЛАТЕЖКИ онлайн <info@moiplatejki.online>',  # от кого
        ['info@moiplatejki.online'],  # кому
        reply_to=[email_addr, ],
    )
    try:
        email.send()
    except SMTPException as e:
        err = mark_safe(str(e))
        logger.error(err)
        return JsonResponse({'err': err}, status=500)

    return JsonResponse({}, status=200)


def index(request):
    return render(request, 'index.html', {'recaptcha_key':  RECAPTCHA_SITE_KEY})


# class UserStateViewSet(ViewSet):
#     # queryset = User.objects.all()
#
#     def retrieve(self, request, pk=None, **kwargs):
#         user = get_object_or_404(User.objects.all(), pk=pk)
#         user_srzr = UserSerializer(user).data
#         # print(user.adres.all()[0].name)
#         # print(user.adres.all()[0].schet.all()[0].schet)
#         # schet_srzr = SchetaByAdresSerializer(user.adres.all()).data
#         return Response({'user': user_srzr, })
#         # return Response({'user': user_srzr, 'scheta': schet_srzr})
