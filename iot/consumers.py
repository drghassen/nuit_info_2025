"""
Consumers WebSocket pour les mises à jour en temps réel
"""
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import IoTData
from django.core.serializers.json import DjangoJSONEncoder


class BaseIoTConsumer(AsyncWebsocketConsumer):
    """Consumer de base pour les données IoT"""
    
    async def connect(self):
        self.group_name = self.get_group_name()
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()
        # Envoyer les données initiales
        await self.send_initial_data()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    def get_group_name(self):
        """À surcharger dans les classes filles"""
        raise NotImplementedError

    async def send_initial_data(self):
        """À surcharger dans les classes filles"""
        pass

    async def send_update(self, event):
        """Reçoit les mises à jour du groupe et les envoie au client"""
        message = event['message']
        await self.send(text_data=json.dumps(message, cls=DjangoJSONEncoder))

    @database_sync_to_async
    def get_latest_data(self, limit=10):
        """Récupère les dernières données IoT"""
        return list(IoTData.objects.order_by('-created_at')[:limit])

    @database_sync_to_async
    def get_all_data(self):
        """Récupère toutes les données IoT"""
        return list(IoTData.objects.all())


class DashboardConsumer(BaseIoTConsumer):
    """Consumer pour le dashboard"""
    
    def get_group_name(self):
        return 'dashboard_updates'

    async def send_initial_data(self):
        latest_data = await self.get_latest_data(10)
        all_data = await self.get_all_data()
        
        # Préparer les données pour les graphiques
        labels = [str(data.created_at.strftime('%H:%M:%S')) for data in reversed(latest_data)]
        cpu_data = [data.cpu_usage for data in reversed(latest_data)]
        ram_data = [data.ram_usage for data in reversed(latest_data)]
        power_data = [data.power_watts for data in reversed(latest_data)]
        eco_data = [data.eco_score for data in reversed(latest_data)]
        co2_data = [data.co2_equiv_g for data in reversed(latest_data)]

        # Calculer les moyennes
        if all_data:
            avg_cpu = sum(d.cpu_usage for d in all_data) / len(all_data)
            avg_ram = sum(d.ram_usage for d in all_data) / len(all_data)
            avg_power = sum(d.power_watts for d in all_data) / len(all_data)
            avg_eco = sum(d.eco_score for d in all_data) / len(all_data)
        else:
            avg_cpu = avg_ram = avg_power = avg_eco = 0

        # Préparer les données pour le tableau
        table_data = [
            {
                'id': data.id,
                'hardware_sensor_id': data.hardware_sensor_id,
                'cpu_usage': data.cpu_usage,
                'ram_usage': data.ram_usage,
                'power_watts': data.power_watts,
                'eco_score': data.eco_score,
                'created_at': data.created_at.strftime('%d/%m/%Y %H:%M'),
            } for data in latest_data
        ]

        data = {
            'type': 'initial_data',
            'chart_labels': labels,
            'cpu_data': cpu_data,
            'ram_data': ram_data,
            'power_data': power_data,
            'eco_data': eco_data,
            'co2_data': co2_data,
            'latest_data': table_data,
            'avg_cpu': round(avg_cpu, 1),
            'avg_ram': round(avg_ram, 1),
            'avg_power': round(avg_power, 1),
            'avg_eco': round(avg_eco, 1),
        }

        await self.send(text_data=json.dumps(data, cls=DjangoJSONEncoder))


class EnergyConsumer(BaseIoTConsumer):
    """Consumer pour la page énergie"""
    
    def get_group_name(self):
        return 'energy_updates'

    async def send_initial_data(self):
        latest_data = await self.get_latest_data(10)
        all_data = await self.get_all_data()
        
        # Préparer les données
        labels = [str(data.created_at.strftime('%H:%M:%S')) for data in reversed(latest_data)]
        power_data = [data.power_watts for data in reversed(latest_data)]
        co2_data = [data.co2_equiv_g for data in reversed(latest_data)]
        overheating_data = [data.overheating for data in reversed(latest_data)]
        active_devices_data = [data.active_devices for data in reversed(latest_data)]

        # Calculer les moyennes
        if all_data:
            avg_power = sum(d.power_watts for d in all_data) / len(all_data)
            avg_co2 = sum(d.co2_equiv_g for d in all_data) / len(all_data)
            avg_overheating = sum(d.overheating for d in all_data) / len(all_data)
            avg_active = sum(d.active_devices for d in all_data) / len(all_data)
        else:
            avg_power = avg_co2 = avg_overheating = avg_active = 0

        # Préparer les données pour le tableau
        table_data = [
            {
                'id': data.id,
                'energy_sensor_id': data.energy_sensor_id,
                'power_watts': data.power_watts,
                'co2_equiv_g': data.co2_equiv_g,
                'overheating': data.overheating,
                'active_devices': data.active_devices,
                'created_at': data.created_at.strftime('%d/%m/%Y %H:%M'),
            } for data in latest_data
        ]

        data = {
            'type': 'initial_data',
            'chart_labels': labels,
            'power_data': power_data,
            'co2_data': co2_data,
            'overheating_data': overheating_data,
            'active_devices_data': active_devices_data,
            'latest_data': table_data,
            'avg_power': round(avg_power, 1),
            'avg_co2': round(avg_co2, 1),
            'avg_overheating': round(avg_overheating, 1),
            'avg_active': int(avg_active),
        }

        await self.send(text_data=json.dumps(data, cls=DjangoJSONEncoder))


class HardwareConsumer(BaseIoTConsumer):
    """Consumer pour la page matériel"""
    
    def get_group_name(self):
        return 'hardware_updates'

    async def send_initial_data(self):
        latest_data = await self.get_latest_data(10)
        all_data = await self.get_all_data()
        
        # Préparer les données
        labels = [str(data.created_at.strftime('%H:%M:%S')) for data in reversed(latest_data)]
        cpu_data = [data.cpu_usage for data in reversed(latest_data)]
        ram_data = [data.ram_usage for data in reversed(latest_data)]
        battery_data = [data.battery_health for data in reversed(latest_data)]
        age_data = [data.age_years for data in reversed(latest_data)]

        # Calculer les moyennes
        if all_data:
            avg_cpu = sum(d.cpu_usage for d in all_data) / len(all_data)
            avg_ram = sum(d.ram_usage for d in all_data) / len(all_data)
            avg_battery = sum(d.battery_health for d in all_data) / len(all_data)
            avg_age = sum(d.age_years for d in all_data) / len(all_data)
        else:
            avg_cpu = avg_ram = avg_battery = avg_age = 0

        # Préparer les données pour le tableau
        table_data = [
            {
                'id': data.id,
                'hardware_sensor_id': data.hardware_sensor_id,
                'cpu_usage': data.cpu_usage,
                'ram_usage': data.ram_usage,
                'battery_health': data.battery_health,
                'age_years': data.age_years,
                'created_at': data.created_at.strftime('%d/%m/%Y %H:%M'),
            } for data in latest_data
        ]

        data = {
            'type': 'initial_data',
            'chart_labels': labels,
            'cpu_data': cpu_data,
            'ram_data': ram_data,
            'battery_data': battery_data,
            'age_data': age_data,
            'latest_data': table_data,
            'avg_cpu': round(avg_cpu, 1),
            'avg_ram': round(avg_ram, 1),
            'avg_battery': round(avg_battery, 1),
            'avg_age': round(avg_age, 1),
        }

        await self.send(text_data=json.dumps(data, cls=DjangoJSONEncoder))


class NetworkConsumer(BaseIoTConsumer):
    """Consumer pour la page réseau"""
    
    def get_group_name(self):
        return 'network_updates'

    async def send_initial_data(self):
        latest_data = await self.get_latest_data(10)
        all_data = await self.get_all_data()
        
        # Préparer les données
        labels = [str(data.created_at.strftime('%H:%M:%S')) for data in reversed(latest_data)]
        network_load_data = [data.network_load_mbps for data in reversed(latest_data)]
        requests_data = [data.requests_per_min for data in reversed(latest_data)]
        cloud_dependency_data = [data.cloud_dependency_score for data in reversed(latest_data)]

        # Calculer les moyennes
        if all_data:
            avg_network_load = sum(d.network_load_mbps for d in all_data) / len(all_data)
            avg_requests = sum(d.requests_per_min for d in all_data) / len(all_data)
            avg_cloud = sum(d.cloud_dependency_score for d in all_data) / len(all_data)
        else:
            avg_network_load = avg_requests = avg_cloud = 0

        # Préparer les données pour le tableau
        table_data = [
            {
                'id': data.id,
                'network_sensor_id': data.network_sensor_id,
                'network_load_mbps': data.network_load_mbps,
                'requests_per_min': data.requests_per_min,
                'cloud_dependency_score': data.cloud_dependency_score,
                'created_at': data.created_at.strftime('%d/%m/%Y %H:%M'),
            } for data in latest_data
        ]

        data = {
            'type': 'initial_data',
            'chart_labels': labels,
            'network_load_data': network_load_data,
            'requests_data': requests_data,
            'cloud_dependency_data': cloud_dependency_data,
            'latest_data': table_data,
            'avg_network_load': round(avg_network_load, 1),
            'avg_requests': int(avg_requests),
            'avg_cloud': round(avg_cloud, 1),
        }

        await self.send(text_data=json.dumps(data, cls=DjangoJSONEncoder))


class ScoresConsumer(BaseIoTConsumer):
    """Consumer pour la page scores"""
    
    def get_group_name(self):
        return 'scores_updates'

    async def send_initial_data(self):
        latest_data = await self.get_latest_data(10)
        all_data = await self.get_all_data()
        
        # Préparer les données
        labels = [str(data.created_at.strftime('%H:%M:%S')) for data in reversed(latest_data)]
        eco_data = [data.eco_score for data in reversed(latest_data)]
        obsolescence_data = [data.obsolescence_score for data in reversed(latest_data)]
        bigtech_data = [data.bigtech_dependency for data in reversed(latest_data)]
        co2_savings_data = [data.co2_savings_kg_year for data in reversed(latest_data)]

        # Calculer les moyennes
        if all_data:
            avg_eco = sum(d.eco_score for d in all_data) / len(all_data)
            avg_obsolescence = sum(d.obsolescence_score for d in all_data) / len(all_data)
            avg_bigtech = sum(d.bigtech_dependency for d in all_data) / len(all_data)
            avg_co2_savings = sum(d.co2_savings_kg_year for d in all_data) / len(all_data)
        else:
            avg_eco = avg_obsolescence = avg_bigtech = avg_co2_savings = 0

        # Préparer les données pour le tableau
        table_data = [
            {
                'id': data.id,
                'eco_score': data.eco_score,
                'obsolescence_score': data.obsolescence_score,
                'bigtech_dependency': data.bigtech_dependency,
                'co2_savings_kg_year': data.co2_savings_kg_year,
                'created_at': data.created_at.strftime('%d/%m/%Y %H:%M'),
            } for data in latest_data
        ]

        data = {
            'type': 'initial_data',
            'chart_labels': labels,
            'eco_data': eco_data,
            'obsolescence_data': obsolescence_data,
            'bigtech_data': bigtech_data,
            'co2_savings_data': co2_savings_data,
            'latest_data': table_data,
            'avg_eco': round(avg_eco, 1),
            'avg_obsolescence': round(avg_obsolescence, 1),
            'avg_bigtech': round(avg_bigtech, 1),
            'avg_co2_savings': round(avg_co2_savings, 1),
        }

        await self.send(text_data=json.dumps(data, cls=DjangoJSONEncoder))
