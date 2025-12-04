import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import IoTData
import asyncio
from django.db import models
from django.core.serializers.json import DjangoJSONEncoder
from asgiref.sync import sync_to_async


class DashboardConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        # Send initial data
        await self.send_dashboard_data()

        # Start monitoring for new data
        asyncio.create_task(self.monitor_new_data())

    async def disconnect(self, close_code):
        pass

    async def send_dashboard_data(self):
        # Get latest data
        latest_data = await sync_to_async(
            lambda: list(IoTData.objects.order_by('-created_at')[:10])
        )()

        # Prepare data for charts
        labels = [str(data.created_at.strftime('%H:%M:%S')) for data in reversed(latest_data)]
        cpu_data = [data.cpu_usage for data in reversed(latest_data)]
        ram_data = [data.ram_usage for data in reversed(latest_data)]
        power_data = [data.power_watts for data in reversed(latest_data)]
        eco_data = [data.eco_score for data in reversed(latest_data)]
        co2_data = [data.co2_equiv_g for data in reversed(latest_data)]

        # Serialize data
        data = {
            'latest_data': [
                {
                    'id': data.id,
                    'hardware_sensor_id': data.hardware_sensor_id,
                    'cpu_usage': data.cpu_usage,
                    'ram_usage': data.ram_usage,
                    'power_watts': data.power_watts,
                    'eco_score': data.eco_score,
                    'created_at': data.created_at.strftime('%d/%m/%Y %H:%M'),
                } for data in latest_data
            ],
            'chart_labels': labels,
            'cpu_data': cpu_data,
            'ram_data': ram_data,
            'power_data': power_data,
            'eco_data': eco_data,
            'co2_data': co2_data,
        }

        await self.send(text_data=json.dumps(data, cls=DjangoJSONEncoder))

    async def monitor_new_data(self):
        last_count = await sync_to_async(
            lambda: IoTData.objects.count()
        )()

        while True:
            await asyncio.sleep(1)  # Check every second
            current_count = await sync_to_async(
                lambda: IoTData.objects.count()
            )()

            if current_count > last_count:
                # New data detected, send update
                await self.send_dashboard_data()
                last_count = current_count
