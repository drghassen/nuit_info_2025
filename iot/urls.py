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
    path('latest-data/', views.get_latest_data, name='get_latest_data'),
    path('dashboard-data/', views.get_dashboard_data, name='get_dashboard_data'),
    path('hardware-data/', views.get_hardware_data, name='api_hardware'),
    path('energy-data/', views.get_energy_data, name='api_energy'),
    path('network-data/', views.get_network_data, name='api_network'),
    path('scores-data/', views.get_scores_data, name='api_scores'),
    path('history/', views.get_history_data, name='api_history'),
    # Session management APIs
    path('session-info/', views.get_session_info, name='api_session_info'),
    path('extend-session/', views.extend_session, name='api_extend_session'),
    # Quiz APIs
    path('quiz/questions/', views.get_quiz_questions, name='api_quiz_questions'),
    path('quiz/submit/', views.submit_quiz_result, name='api_quiz_submit'),
]


