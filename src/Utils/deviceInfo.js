export const getDeviceId = () => {
    if (window.webapis && typeof window.webapis !== 'undefined' && window.webapis.appcommon) {
        return window.webapis.appcommon.getUuid();
    }
    return 'unknown-device-id';
};

export const getDeviceName = () => {
    if (window.webapis && typeof window.webapis !== 'undefined' && window?.webapis?.productinfo) {
        return window.webapis.productinfo.getRealModel();
    }
    return 'unknown-device';
};

export const getDeviceOS = () => {
    if (window.webapis && typeof window.webapis !== 'undefined' && window.webapis.appcommon) {
        return window.webapis.appcommon.getVersion();
    }
    return 'unknown-device-id';
}

