import os
import json
import logging
import asyncio
import paho.mqtt.client as mqtt

logger = logging.getLogger("urbaneye.mqtt")

MQTT_BROKER = os.getenv("MQTT_BROKER", "localhost")
MQTT_PORT = int(os.getenv("MQTT_PORT", 1883))

class MQTTService:
    def __init__(self):
        self.client = mqtt.Client(client_id="urbaneye-cloud-backend")
        self.is_connected = False
        self.client.on_connect = self._on_connect
        self.client.on_message = self._on_message
        self.event_loop = None
        self.message_handler_callback = None

    def _on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            logger.info("Connected to MQTT Broker successfully.")
            self.is_connected = True
            client.subscribe("urbaneye/bus/+/detections")
            client.subscribe("urbaneye/bus/+/telemetry")
            client.subscribe("urbaneye/fog/detections")
        else:
            logger.warning(f"MQTT connection failed with code {rc}")
            self.is_connected = False

    def _on_message(self, client, userdata, msg):
        try:
            payload = json.loads(msg.payload.decode("utf-8"))
            topic = msg.topic
            if self.event_loop and self.message_handler_callback:
                asyncio.run_coroutine_threadsafe(
                    self.message_handler_callback(topic, payload),
                    self.event_loop
                )
        except Exception as e:
            logger.error(f"Error handling MQTT message on {msg.topic}: {e}")

    def start(self, event_loop, message_handler_callback):
        self.event_loop = event_loop
        self.message_handler_callback = message_handler_callback
        try:
            self.client.connect_async(MQTT_BROKER, MQTT_PORT, 60)
            self.client.loop_start()
        except Exception as e:
            logger.warning(f"MQTT Broker non-critical connection warning ({e}). Running in fallback mode.")

mqtt_service = MQTTService()
