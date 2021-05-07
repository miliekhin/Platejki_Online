from django.db import models
from django.contrib.auth.models import User


class Adres(models.Model):
    owner = models.ForeignKey(User, verbose_name='Username', null=True, related_name='adres', on_delete=models.CASCADE)
    name = models.CharField(max_length=64)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Адрес'
        verbose_name_plural = 'Адреса'


class Usluga(models.Model):
    owner = models.ManyToManyField(User, related_name='usluga')
    name = models.CharField(max_length=24, null=True, unique=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Услуга'
        verbose_name_plural = 'Услуги'


class Payer(models.Model):
    owner = models.ForeignKey(User, verbose_name='Username', related_name='payer', null=True, on_delete=models.CASCADE)
    name = models.CharField(verbose_name='ФИО', max_length=32)

    def __str__(self):
        return self.name

    def addr(self):
        try:
            c = self.owner.adres.count()
        except AttributeError as e:
            print('Bad Model Object:', self)
            return -1
        return c

    addr.short_description = 'Адреса'

    class Meta:
        verbose_name = 'Плательщик'
        verbose_name_plural = 'Плательщики'


class Erc(models.Model):
    owner = models.ForeignKey(User, related_name='erc', null=True, on_delete=models.CASCADE)
    name = models.CharField(max_length=32)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Код ЕРЦ'
        verbose_name_plural = 'Коды ЕРЦ'


class Schet(models.Model):
    addr = models.ForeignKey(Adres, related_name='scheta', null=True, on_delete=models.CASCADE)
    usluga = models.ForeignKey(Usluga, related_name='schet', null=True, on_delete=models.CASCADE)
    schet = models.CharField(max_length=16, null=True)

    def __str__(self):
        return f'{self.schet} / {self.usluga.name} / {self.addr.name}'

    class Meta:
        verbose_name = 'Лицевой счет'
        verbose_name_plural = 'Лицевые счета'


class Platejka(models.Model):
    owner = models.ForeignKey(User, verbose_name='Username', null=True, related_name='platejka', on_delete=models.CASCADE)
    # addr = models.ForeignKey(Adres, related_name='platejka', null=True, on_delete=models.CASCADE)
    addr = models.CharField(verbose_name='Адрес', max_length=64, null=True)
    # payer = models.ForeignKey(Payer, related_name='platejka', null=True, on_delete=models.CASCADE)
    payer = models.CharField(verbose_name='Плательщик', max_length=32, null=True)
    erc = models.CharField(max_length=32, null=True)
    pay_date = models.CharField(verbose_name='Дата оплаты', max_length=10, null=True, blank=True)  # Дата оплаты платежки
    pmonth = models.PositiveSmallIntegerField()  # Месяц создания платежки
    pyear = models.PositiveSmallIntegerField()  # Год создания платежки
    pay_period = models.CharField(verbose_name='Оплата за', max_length=8, null=True)

    def __str__(self):
        return f'{self.addr} от {self.pmonth+1}.{self.pyear}'

    class Meta:
        verbose_name = 'Платежка'
        verbose_name_plural = 'Платежки'


class Stroka(models.Model):
    plat = models.ForeignKey(Platejka, related_name='stroka', null=True, on_delete=models.CASCADE)
    # srvc_name = models.ForeignKey(Usluga, related_name='stroka', null=True, on_delete=models.CASCADE)
    srvc_name = models.CharField(max_length=24, null=True)
    # schet = models.ForeignKey(Schet, related_name='stroka', null=True, on_delete=models.CASCADE)
    schet = models.CharField(max_length=16, null=True)
    counter_curr = models.CharField(max_length=8, null=True, blank=True)
    counter_prev = models.CharField(max_length=8, null=True, blank=True)
    volume = models.CharField(max_length=8, null=True, blank=True)
    pay_amount = models.CharField(max_length=8, null=True, blank=True)

    def __str__(self):
        return f'{self.srvc_name} / {self.plat.addr}'

    class Meta:
        verbose_name = 'Строка платежки'
        verbose_name_plural = 'Строки платежки'


class Zametka(models.Model):
    owner = models.ForeignKey(User, null=True, related_name='zametka', on_delete=models.CASCADE)
    zametka = models.TextField(max_length=1024, blank=True)
    width = models.PositiveSmallIntegerField(default=300)
    height = models.PositiveSmallIntegerField(default=200)
    old_width = models.PositiveSmallIntegerField(default=300)
    old_height = models.PositiveSmallIntegerField(default=200)
    left = models.PositiveSmallIntegerField(default=100)
    top = models.PositiveSmallIntegerField(default=100)
    show = models.BooleanField(default=False)

    def __str__(self):
        return self.owner.username

    class Meta:
        verbose_name = 'Заметка'
        verbose_name_plural = 'Заметки'


class Settings(models.Model):
    owner = models.ForeignKey(User, null=True, related_name='settings', on_delete=models.CASCADE)
    first_platejka_created = models.BooleanField(default=False)

    def __str__(self):
        return f'Настройки {self.owner.username}'

    class Meta:
        verbose_name = 'Настройки'
        verbose_name_plural = 'Настройки'
