from django.contrib import admin
from .models import *

admin.site.register(Usluga)
admin.site.register(Schet)
admin.site.register(Stroka)
admin.site.register(Settings)
admin.site.register(Erc)


def user(obj):
    try:
        email = obj.owner.email
    except AttributeError as e:
        print('Bad email:', e, obj)
        return 'Bad Object'

    fullname = obj.owner.get_full_name()
    if fullname:
        email += f' ({fullname})'
    return email


@admin.register(Platejka)
class PlatejkaAdmin(admin.ModelAdmin):
    list_display = ('payer', user, 'addr', 'pay_date', 'pay_period')


@admin.register(Payer)
class PayerAdmin(admin.ModelAdmin):
    list_display = ('name', user, 'addr')


@admin.register(Adres)
class AdresAdmin(admin.ModelAdmin):
    list_display = ('name', user, )


@admin.register(Zametka)
class ZametkaAdmin(admin.ModelAdmin):
    list_display = (user, 'zametka', )
