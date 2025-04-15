const getDeviceId = () => {
    if (webapis && typeof webapis !== 'undefined' && webapis.appcommon) {
        return webapis.appcommon.getUuid();
    }
    return 'unknown-device-id';
};

const getDeviceName = () => {
    if (webapis && typeof webapis !== 'undefined' && webapis.productinfo) {
        return webapis.productinfo.getModel();
    }
    return 'unknown-device';
};

const getDeviceOS = () => {
    if (webapis && typeof webapis !== 'undefined' && webapis.appcommon) {
        return webapis.appcommon.getVersion();
    }
    return 'unknown-device-id';
}



export const getDeviceInfo = () => {
    const deviceInfo = {
        deviceId: getDeviceId,
        deviceName: getDeviceName,
        deviceOS: getDeviceOS
    }
    return deviceInfo;
}