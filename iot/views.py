from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
from django.core.serializers.json import DjangoJSONEncoder
from .models import IoTData

@csrf_exempt
@require_http_methods(["POST"])
def iot_data_post(request):
    try:
        data = json.loads(request.body)
        iot_data = IoTData.objects.create(
            hardware_sensor_id=data['hardware_sensor_id'],
            hardware_timestamp=data['hardware_timestamp'],
            age_years=data['age_years'],
            cpu_usage=data['cpu_usage'],
            ram_usage=data['ram_usage'],
            battery_health=data['battery_health'],
            os=data['os'],
            win11_compat=data['win11_compat'],
            energy_sensor_id=data['energy_sensor_id'],
            energy_timestamp=data['energy_timestamp'],
            power_watts=data['power_watts'],
            active_devices=data['active_devices'],
            overheating=data['overheating'],
            co2_equiv_g=data['co2_equiv_g'],
            network_sensor_id=data['network_sensor_id'],
            network_timestamp=data['network_timestamp'],
            network_load_mbps=data['network_load_mbps'],
            requests_per_min=data['requests_per_min'],
            cloud_dependency_score=data['cloud_dependency_score'],
            eco_score=data['eco_score'],
            obsolescence_score=data['obsolescence_score'],
            bigtech_dependency=data['bigtech_dependency'],
            co2_savings_kg_year=data['co2_savings_kg_year'],
        )
        return JsonResponse({'message': 'IoT data created successfully', 'id': iot_data.id}, status=201)
    except KeyError as e:
        return JsonResponse({'error': f'Missing field: {str(e)}'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

def dashboard(request):
    # Récupérer les dernières données IoT (par exemple les 10 dernières)
    latest_data = IoTData.objects.order_by('-created_at')[:10]

    # Préparer les données pour les graphiques
    labels = [str(data.created_at.strftime('%H:%M:%S')) for data in reversed(latest_data)]
    cpu_data = [data.cpu_usage for data in reversed(latest_data)]
    ram_data = [data.ram_usage for data in reversed(latest_data)]
    power_data = [data.power_watts for data in reversed(latest_data)]
    eco_data = [data.eco_score for data in reversed(latest_data)]
    co2_data = [data.co2_equiv_g for data in reversed(latest_data)]

    context = {
        'latest_data': latest_data,
        'chart_labels': json.dumps(labels),
        'cpu_data': json.dumps(cpu_data),
        'ram_data': json.dumps(ram_data),
        'power_data': json.dumps(power_data),
        'eco_data': json.dumps(eco_data),
        'co2_data': json.dumps(co2_data),
    }
    return render(request, 'iot/dashboard.html', context)

@require_http_methods(["GET"])
def get_latest_data(request):
    try:
        latest_data = IoTData.objects.order_by('-created_at').first()
        if latest_data:
            data = {
                'id': latest_data.id,
                'hardware_sensor_id': latest_data.hardware_sensor_id,
                'hardware_timestamp': latest_data.hardware_timestamp,
                'age_years': latest_data.age_years,
                'cpu_usage': latest_data.cpu_usage,
                'ram_usage': latest_data.ram_usage,
                'battery_health': latest_data.battery_health,
                'os': latest_data.os,
                'win11_compat': latest_data.win11_compat,
                'energy_sensor_id': latest_data.energy_sensor_id,
                'energy_timestamp': latest_data.energy_timestamp,
                'power_watts': latest_data.power_watts,
                'active_devices': latest_data.active_devices,
                'overheating': latest_data.overheating,
                'co2_equiv_g': latest_data.co2_equiv_g,
                'network_sensor_id': latest_data.network_sensor_id,
                'network_timestamp': latest_data.network_timestamp,
                'network_load_mbps': latest_data.network_load_mbps,
                'requests_per_min': latest_data.requests_per_min,
                'cloud_dependency_score': latest_data.cloud_dependency_score,
                'eco_score': latest_data.eco_score,
                'obsolescence_score': latest_data.obsolescence_score,
                'bigtech_dependency': latest_data.bigtech_dependency,
                'co2_savings_kg_year': latest_data.co2_savings_kg_year,
                'created_at': latest_data.created_at.isoformat(),
            }
            return JsonResponse(data, status=200)
        else:
            return JsonResponse({'error': 'No IoT data available'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@require_http_methods(["GET"])
def get_dashboard_data(request):
    try:
        # Get latest 10 data entries
        latest_data = IoTData.objects.order_by('-created_at')[:10]

        # Prepare data for charts
        labels = [str(data.created_at.strftime('%H:%M:%S')) for data in reversed(latest_data)]
        cpu_data = [data.cpu_usage for data in reversed(latest_data)]
        ram_data = [data.ram_usage for data in reversed(latest_data)]
        power_data = [data.power_watts for data in reversed(latest_data)]
        eco_data = [data.eco_score for data in reversed(latest_data)]
        co2_data = [data.co2_equiv_g for data in reversed(latest_data)]

        # Prepare data for table
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
            'chart_labels': labels,
            'cpu_data': cpu_data,
            'ram_data': ram_data,
            'power_data': power_data,
            'eco_data': eco_data,
            'co2_data': co2_data,
            'latest_data': table_data,
        }

        return JsonResponse(data, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

def hardware_view(request):
    # Récupérer les dernières données matérielles
    latest_data = IoTData.objects.order_by('-created_at')[:10]

    # Préparer les données pour les graphiques matériels
    labels = [str(data.created_at.strftime('%H:%M:%S')) for data in reversed(latest_data)]
    cpu_data = [data.cpu_usage for data in reversed(latest_data)]
    ram_data = [data.ram_usage for data in reversed(latest_data)]
    battery_data = [data.battery_health for data in reversed(latest_data)]
    age_data = [data.age_years for data in reversed(latest_data)]

    context = {
        'latest_data': latest_data,
        'chart_labels': json.dumps(labels),
        'cpu_data': json.dumps(cpu_data),
        'ram_data': json.dumps(ram_data),
        'battery_data': json.dumps(battery_data),
        'age_data': json.dumps(age_data),
    }
    return render(request, 'iot/hardware.html', context)

def energy_view(request):
    # Récupérer les dernières données énergétiques
    latest_data = IoTData.objects.order_by('-created_at')[:10]

    # Préparer les données pour les graphiques énergétiques
    labels = [str(data.created_at.strftime('%H:%M:%S')) for data in reversed(latest_data)]
    power_data = [data.power_watts for data in reversed(latest_data)]
    co2_data = [data.co2_equiv_g for data in reversed(latest_data)]
    overheating_data = [data.overheating for data in reversed(latest_data)]
    active_devices_data = [data.active_devices for data in reversed(latest_data)]

    context = {
        'latest_data': latest_data,
        'chart_labels': json.dumps(labels),
        'power_data': json.dumps(power_data),
        'co2_data': json.dumps(co2_data),
        'overheating_data': json.dumps(overheating_data),
        'active_devices_data': json.dumps(active_devices_data),
    }
    return render(request, 'iot/energy.html', context)

def network_view(request):
    # Récupérer les dernières données réseau
    latest_data = IoTData.objects.order_by('-created_at')[:10]

    # Préparer les données pour les graphiques réseau
    labels = [str(data.created_at.strftime('%H:%M:%S')) for data in reversed(latest_data)]
    network_load_data = [data.network_load_mbps for data in reversed(latest_data)]
    requests_data = [data.requests_per_min for data in reversed(latest_data)]
    cloud_dependency_data = [data.cloud_dependency_score for data in reversed(latest_data)]

    context = {
        'latest_data': latest_data,
        'chart_labels': json.dumps(labels),
        'network_load_data': json.dumps(network_load_data),
        'requests_data': json.dumps(requests_data),
        'cloud_dependency_data': json.dumps(cloud_dependency_data),
    }
    return render(request, 'iot/network.html', context)

def scores_view(request):
    # Récupérer les dernières données de scores
    latest_data = IoTData.objects.order_by('-created_at')[:10]

    # Préparer les données pour les graphiques de scores
    labels = [str(data.created_at.strftime('%H:%M:%S')) for data in reversed(latest_data)]
    eco_data = [data.eco_score for data in reversed(latest_data)]
    obsolescence_data = [data.obsolescence_score for data in reversed(latest_data)]
    bigtech_data = [data.bigtech_dependency for data in reversed(latest_data)]
    co2_savings_data = [data.co2_savings_kg_year for data in reversed(latest_data)]

    context = {
        'latest_data': latest_data,
        'chart_labels': json.dumps(labels),
        'eco_data': json.dumps(eco_data),
        'obsolescence_data': json.dumps(obsolescence_data),
        'bigtech_data': json.dumps(bigtech_data),
        'co2_savings_data': json.dumps(co2_savings_data),
    }
    return render(request, 'iot/scores.html', context)
