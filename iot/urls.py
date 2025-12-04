from django.urls import path
from . import views

urlpatterns = [
    path('iot-data/', views.iot_data_post, name='iot_data_post'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('api/latest-data/', views.get_latest_data, name='get_latest_data'),
    path('api/dashboard-data/', views.get_dashboard_data, name='get_dashboard_data'),
]
