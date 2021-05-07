from rest_framework.routers import DefaultRouter
from .views import *
from django.urls import path

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'usluga', UslugaViewSet)
router.register(r'payer', PayerViewSet)
router.register(r'erc', ErcViewSet)
router.register(r'platejka', PlatejkaViewSet)
router.register(r'adres', AdresViewSet)
router.register(r'schet', SchetViewSet)
router.register(r'user', UserViewSet)
router.register(r'zametka', ZametkaViewSet)
router.register(r'settings', SettingsViewSet)
# router.register(r'state', UserStateViewSet, basename='state')
aux_urls = [
    path('support_form/', support_form),
    path('del_account/', DelAccount.as_view(), name='del_account'),
    path('testoid/', Testoid.as_view(), name='testoid'),
]
urlpatterns = router.urls + aux_urls
