'use strict';

var Service, Characteristic;
var mqtt = require("mqtt");

module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory("homebridge-mqtt-dimmer", "mqtt-dimmer", MqttDimmerAccessory);
};

function MqttDimmerAccessory(log, config) {
    this.log = log;
    this.name = config["name"];
    this.url = config["url"];
    this.client_Id = 'mqttjs_' + Math.random().toString(16).substr(2, 8);
    this.options = {
        keepalive: 10,
        clientId: this.client_Id,
        protocolId: 'MQTT',
        protocolVersion: 4,
        clean: true,
        reconnectPeriod: 1000,
        connectTimeout: 30 * 1000,
        will: {
            topic: 'WillMsg',
            payload: 'Connection Closed abnormally..!',
            qos: 0,
            retain: false
        },
        username: config["username"],
        password: config["password"],
        rejectUnauthorized: false
    };

    this.caption = config["caption"];
    this.topics = config["topics"];


    this.service = new Service.Lightbulb(this.name);

    this.service.getCharacteristic(Characteristic.On)
        .on('get', this.getStatus.bind(this))
        .on('set', this.setStatus.bind(this));

    this.service.getCharacteristic(Characteristic.Brightness)
        .on('get', this.getBrightness.bind(this))
        .on('set', this.setBrightness.bind(this));

    this.client = mqtt.connect(this.url, this.options);

    var self = this;

    this.on = false;
    this.brightness = 0;

    this.client.on('error', function (err) {
        self.log('Error event on MQTT:', err);
    });

    this.client.on('message', function (topic, message) {
        if (topic == self.topics.statusGet) {
            var status = message.toString();
            if (self.isInt(status)) {
                status = parseInt(status);
                self.on = status > 0;
                if (status > 0) {
                    self.brightness = status;
                }
                self.service.getCharacteristic(Characteristic.On).setValue(self.on, undefined, 'fromSetValue');
                self.service.getCharacteristic(Characteristic.Brightness).setValue(self.brightness, undefined, 'fromSetValue');
            }
        }
    });


    this.client.subscribe(self.topics.statusGet);
}

MqttDimmerAccessory.prototype.isInt = function (value) {
    return /^-?[0-9]+$/.test(value);
};

MqttDimmerAccessory.prototype.getStatus = function (callback) {
    callback(null, this.on);
};

MqttDimmerAccessory.prototype.setStatus = function (status, callback, context) {
    if (context !== 'fromSetValue') {
        this.on = status;
        this.client.publish(this.topics.statusSet, status ? this.brightness.toString() : "0");
    }
    callback();
};

MqttDimmerAccessory.prototype.getBrightness = function (callback) {
    callback(null, this.brightness);
};

MqttDimmerAccessory.prototype.setBrightness = function (brightness, callback, context) {
    if (context !== 'fromSetValue') {
        this.brightness = brightness;
        this.client.publish(this.topics.statusSet, this.brightness.toString());
    }
    callback();
};

MqttDimmerAccessory.prototype.getServices = function () {
    return [this.service];
};
