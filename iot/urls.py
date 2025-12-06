from django.urls import path
from . import views

urlpatterns = [
    path('iot-data/', views.iot_data_post, name='iot_data_post'),
    path('', views.login_view, name='login'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('hardware/', views.hardware_view, name='hardware'),
    path('energy/', views.energy_view, name='energy'),
    path('network/', views.network_view, name='network'),
    path('scores/', views.scores_view, name='scores'),
    path('quiz/', views.quiz_view, name='quiz'),
    path('api/latest-data/', views.get_latest_data, name='get_latest_data'),
    path('api/dashboard-data/', views.get_dashboard_data, name='get_dashboard_data'),
    path('api/hardware-data/', views.get_hardware_data, name='get_hardware_data'),
    path('api/energy-data/', views.get_energy_data, name='get_energy_data'),
    path('api/network-data/', views.get_network_data, name='get_network_data'),
    path('api/scores-data/', views.get_scores_data, name='get_scores_data'),
]
