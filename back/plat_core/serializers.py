from rest_framework import serializers
from .models import *
from django.contrib.auth.models import User


class ZametkaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Zametka
        fields = '__all__'


class SettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Settings
        exclude = ['owner']


class UslugaFullSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usluga
        fields = '__all__'


class UslugaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usluga
        # fields = '__all__'
        exclude = ['owner', ]


class UslugaIdSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usluga
        fields = ['id']


class UslugaNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usluga
        fields = ['name']


class SchetNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Schet
        fields = ['schet']


class SchetSerializer(serializers.ModelSerializer):
    usluga = UslugaIdSerializer()

    class Meta:
        model = Schet
        # fields = '__all__'
        exclude = ['addr']


# class SchetaByAdresSerializer(serializers.ModelSerializer):
#     # schet = SchetSerializer(many=True)
#
#     class Meta:
#         model = Adres
#         # fields = ['name']
#         exclude = ['owner']
class ErcSerializer(serializers.ModelSerializer):
    class Meta:
        model = Erc
        exclude = ['owner']


class ErcFullSerializer(serializers.ModelSerializer):
    class Meta:
        model = Erc
        fields = '__all__'


# class ErcIdSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Erc
#         fields = ['id', ]


class PayerFullSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payer
        fields = '__all__'


class PayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payer
        # fields = '__all__'
        exclude = ['owner']


# class PayerIdSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Payer
#         fields = ['id', ]


class StrokaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stroka
        fields = '__all__'


class PlatejkaSerializer(serializers.ModelSerializer):
    stroka = StrokaSerializer(many=True)

    class Meta:
        model = Platejka
        exclude = ['owner']

    # def create(self, validated_data):
    #     uslugi_data = validated_data.pop('uslugi')
    #     plat = Platejka.objects.create(**validated_data)
    #     for usluga_data in uslugi_data:
    #         Usluga.objects.create(plat=plat, **usluga_data)
    #     return plat


class AdresSerializer(serializers.ModelSerializer):
    scheta = SchetSerializer(many=True)

    class Meta:
        model = Adres
        # fields = ['name']
        exclude = ['owner']


class AdresNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Adres
        exclude = ['owner']


# class UsersSchetASerializer(serializers.ModelSerializer):
#     usluga = UslugaSerializer()
#     adres = AdresSerializer()
#
#     class Meta:
#         model = Schet
#         fields = '__all__'
#         depth = 1


class UserSerializer(serializers.ModelSerializer):
    adres = AdresSerializer(many=True)
    usluga = UslugaSerializer(many=True)
    payer = PayerSerializer(many=True)
    erc = ErcSerializer(many=True)
    settings = SettingsSerializer(many=True)
    zametka = ZametkaSerializer(many=True)
    platejka = PlatejkaSerializer(many=True)
    # schet = SchetSerializer(many=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'adres', 'payer', 'erc', 'zametka', 'settings', 'usluga', 'platejka']
        depth = 1

# class StateSrzr(serializers.ModelSerializer):

# todo: Есть такая фича SerializerMethodField, которая может добавить к сериализуемым данным дополнительное поле
# https://www.django-rest-framework.org/api-guide/fields/#serializermethodfield
# https://youtu.be/l36FuBLNZCA?t=3696
# https://github.com/DJWOMS/djangochannel/blob/master/backend/api/v2/courses/serializers.py
# class DetailCourseSerializer(serializers.ModelSerializer):
#     """Сериализация описания курса"""
#
#     is_student = serializers.SerializerMethodField()
#
#     def get_is_student(self, obj):
#         """Проверка является ли юзер студентом курса"""
#         if self.context.get("request", None):
#             if self.context['request'].user in self.instance.students.all():
#                 return True
#
#     class Meta:
#         model = Course
#         exclude = ("students", "test_in_course")
