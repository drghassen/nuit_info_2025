"""
Signals Django pour détecter les changements dans les modèles IoT
et notifier les clients WebSocket en temps réel
"""
import json
from django.db.models.signals import post_save
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import IoTData


@receiver(post_save, sender=IoTData)
def iot_data_created(sender, instance, created, **kwargs):
    """
    Signal déclenché lorsqu'une nouvelle donnée IoT est créée
    Notifie tous les clients WebSocket connectés
    """
    if created:
        channel_layer = get_channel_layer()
        if channel_layer:
            # Préparer les données pour l'envoi
            data = {
                'type': 'new_data',
                'data': {
                    'id': instance.id,
                    'hardware_sensor_id': instance.hardware_sensor_id,
                    'energy_sensor_id': instance.energy_sensor_id,
                    'network_sensor_id': instance.network_sensor_id,
                    'cpu_usage': instance.cpu_usage,
                    'ram_usage': instance.ram_usage,
                    'battery_health': instance.battery_health,
                    'age_years': instance.age_years,
                    'power_watts': instance.power_watts,
                    'co2_equiv_g': instance.co2_equiv_g,
                    'eco_score': instance.eco_score,
                    'overheating': instance.overheating,
                    'active_devices': instance.active_devices,
                    'network_load_mbps': instance.network_load_mbps,
                    'requests_per_min': instance.requests_per_min,
                    'cloud_dependency_score': instance.cloud_dependency_score,
                    'obsolescence_score': instance.obsolescence_score,
                    'bigtech_dependency': instance.bigtech_dependency,
                    'co2_savings_kg_year': instance.co2_savings_kg_year,
                    'created_at': instance.created_at.isoformat(),
                }
            }
            
            # Envoyer à tous les groupes WebSocket
            async_to_sync(channel_layer.group_send)(
                'dashboard_updates',
                {
                    'type': 'send_update',
                    'message': data
                }
            )
            
            async_to_sync(channel_layer.group_send)(
                'energy_updates',
                {
                    'type': 'send_update',
                    'message': data
                }
            )
            
            async_to_sync(channel_layer.group_send)(
                'hardware_updates',
                {
                    'type': 'send_update',
                    'message': data
                }
            )
            
            async_to_sync(channel_layer.group_send)(
                'network_updates',
                {
                    'type': 'send_update',
                    'message': data
                }
            )
            
            async_to_sync(channel_layer.group_send)(
                'scores_updates',
                {
                    'type': 'send_update',
                    'message': data
                }
            )

