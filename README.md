# homebridge-mqtt-dimmer
An homebridge plugin that create an HomeKit dimmer accessory mapped on MQTT topics.

# Installation
Follow the instruction in [homebridge](https://www.npmjs.com/package/homebridge) for the homebridge server installation.
The plugin is published through [NPM](https://www.npmjs.com/package/homebridge-mqtt-dimmer) and should be installed "globally" by typing:

    npm install -g homebridge-mqtt-dimmer

# Configuration
Remember to configure the plugin in config.json in your home directory inside the .homebridge directory. Configuration parameters:
```javascript
{
  "accessory": "mqtt-dimmer",
  "name": "<name of the dimmer>",
  "url": "<url of the broker>", // i.e. "http://mosquitto.org:1883"
  "username": "<username>",
  "password": "<password>",
  "caption": "<label>",
  "onValue": "<on value(default: true)>",
  "offValue": "<on value(default: false)>",
  "topics":
  {
    "statusGet":    "<topic to get the status>",
    "statusSet":    "<topic to set the status>",
  }
}
```
