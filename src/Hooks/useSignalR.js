import { useState, useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { API_BASE_URL } from '../Api/constants';
import { getDeviceInfo } from '../Utils';
import { useUserContext } from '../Context/userContext';

export function useSignalR() {
  const connectionRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [playCapability, setPlayCapability] = useState(null);
  const isConnectedRef = useRef(false);

  const deviceInfo  = getDeviceInfo();
  const {uid: userId} = useUserContext();


  const baseUrl = API_BASE_URL;
  const deviceId = deviceInfo.deviceId;


  useEffect(() => {
    const connect = async () => {
      try {
        const connection = new signalR.HubConnectionBuilder()
          .withUrl(`${API_BASE_URL}/`.replace(/\/api\//, '/') + 'StreamHub', {
            headers: {
              UserId: userId,
              DeviceId: deviceId,
              apiKey: localStorage.getItem('apiKey')
            }
          })
          .build();

        connection.onclose(() => {
          setIsConnected(false);
          isConnectedRef.current = false;
        });

        connection.on("notifyStreamingCapability", (data) => {
          setPlayCapability(data.streamCapability); // or adapt based on payload structure
        });

        await connection.start();
        console.log('<< connection established');
        setIsConnected(true);
        isConnectedRef.current = true;
        connectionRef.current = connection;
      } catch (err) {
        console.error("Error starting SignalR connection:", err);
      }
    };

    connect();

    return () => {
      // if (connectionRef.current) {
      //   connectionRef.current.stop();
      // }
    };
  }, [baseUrl, userId, deviceId]);

  const connectManuallyV2 = async () => {
    if (connectionRef.current && connectionRef.current.state === signalR.HubConnectionState.Connected) {
      try {
        const response = await connectionRef.current.invoke("ConnectMannuallyV2", userId.toString(), deviceId);
        setPlayCapability(response.streamCapability); // Update state
        return response;
      } catch (err) {
        console.error("Error invoking ConnectMannuallyV2:", err);
        throw err;
      }
    }
  };

  const disconnectManually = async () => {
    console.log('<< connection mannually disconnect called');
    if (connectionRef.current && connectionRef.current.state === signalR.HubConnectionState.Connected) {
      try {
        console.log(' connection disconnected');
        await connectionRef.current.invoke("DisconnectMannually", userId.toString(), deviceId);
       
      } catch (err) {
        console.error("Error invoking DisconnectMannually:", err);
      }
    }
  };

  return {
    isConnected,
    playCapability,
    connectManuallyV2,
    disconnectManually,
    isConnectedRef
  };
}
