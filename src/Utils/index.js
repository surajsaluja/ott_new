const getDeviceId = () => {
    if (window.webapis && typeof window.webapis !== 'undefined' && window.webapis.appcommon) {
        return window.webapis.appcommon.getUuid();
    }
    return 'unknown-device-id';
};

const getDeviceName = () => {
    if (window.webapis && typeof window.webapis !== 'undefined' && window.webapis.productinfo) {
        return window.webapis.productinfo.getModel();
    }
    return 'unknown-device';
};

const getDeviceOS = () => {
    if (window.webapis && typeof window.webapis !== 'undefined' && window.webapis.appcommon) {
        return window.webapis.appcommon.getVersion();
    }
    return 'unknown-device-id';
}



export const getDeviceInfo = () => {
    const deviceInfo = {
        deviceId: getDeviceId(),
        deviceName: getDeviceName(),
        deviceOS: getDeviceOS()
    }
    return deviceInfo;
}