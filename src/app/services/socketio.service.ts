import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import * as io from 'socket.io-client';
import { BehaviorSubject } from 'rxjs';
const ICE_SERVERS: RTCIceServer[] = [
  {urls: 'stun:stun.l.google.com:19302'},
  // {urls: ['stun:stun.example.com', 'stun:stun-1.example.com']}
];
const PEER_CONNECTION_CONFIG: RTCConfiguration = {
  bundlePolicy: 'max-compat',
  rtcpMuxPolicy: 'negotiate',
  iceServers: ICE_SERVERS
};
@Injectable({
  providedIn: 'root'
})
export class SocketioService {
  receivedMsg = new BehaviorSubject<string>('null');
  signalingSocketConnection;
  uuid;
  peerConnection: RTCPeerConnection;
  sendChannel: RTCDataChannel;
  constructor() {
    this.uuid = this.createUuid();
  }

  setupSocketConnection() {
    this.setupSignalServer();
    this.setupPeerServer();
    this.setupDataChannel();
  }
  /**
   * setup rtc servers
   */
  private setupSignalServer() {
    this.signalingSocketConnection = io(environment.SOCKET_ENDPOINT, {
      query: {
        token: this.uuid
      }
    });
    this.signalingSocketConnection.on('message', this.getSignalMessageCallback() );
    // this.signalingSocketConnection.emit('message', 'Hello there from Angular.');
    // this.signalingSocketConnection.on('log', console.log);
  }
  private setupPeerServer() {
    console.log('peerserver setup starting !');
    this.peerConnection = new RTCPeerConnection(PEER_CONNECTION_CONFIG);
    this.peerConnection.onicecandidate = this.getIceCandidateCallback();
  }
  private setupDataChannel() {
    this.sendChannel = this.peerConnection.createDataChannel('sendDataChannel');

    this.peerConnection.ondatachannel = (dc) => {
      console.log(`received message from channel`);
      console.log(dc);
      const receiveChannel = dc.channel;
      receiveChannel.onmessage = (ev) => {
        console.log("ondatachannel message:", ev.data);
        this.receivedMsg.next(ev.data);
      };
    };

    this.sendChannel.onopen = (ev) => {
      console.log('data channel opended');
    };
    this.sendChannel.onclose = (ev) => {
      console.log('data channel closed');
    }
    this.peerConnection
    .createOffer()
    .then(this.setDescription())
    .catch(this.errorHandler);
  }
  /**
   * signal server callback
   */
  private getSignalMessageCallback(): (string) => void {
    return (message) => {
      // console.log('message !!!! => ');
      // console.log(message);
      const signal = JSON.parse(message);
      if (signal.uuid === this.uuid) {
        return;
      }

      // console.log('Received signal');
      // console.log(signal);

      if (signal.sdp) {
        this.peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp))
          .then(() => {
            if (signal.sdp.type === 'offer') {
              this.peerConnection.createAnswer()
                .then(this.setDescription())
                .catch(this.errorHandler);
            }
          })
          .catch(e => this.errorHandler2('set remote description failed', e));
      } else if (signal.ice) {
        console.log('adding ice candidate!!!');
        this.peerConnection.addIceCandidate(new RTCIceCandidate(signal.ice)).catch(this.errorHandler);
      }
    };
  }
  /**
   * ice server callback
   */
  private getIceCandidateCallback(): (string) => void {
    return (event) => {
      // console.log(`got ice candidate:`);
      // console.log(event);

      if (event.candidate != null) {
        console.log(JSON.stringify({ 'ice': event.candidate, 'uuid': this.uuid }));
        this.signalingSocketConnection.emit('message', JSON.stringify({ 'ice': event.candidate, 'uuid': this.uuid }));
      }
    };
  }
  createUuid(): any {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  }

  private setDescription(): (string) => void {
    return (description) => {
      // console.log('got description');
      // console.log(description);

      this.peerConnection.setLocalDescription(description)
        .then(() => {
          this.signalingSocketConnection
          .emit('message', JSON.stringify({ 'sdp': this.peerConnection.localDescription, 'uuid': this.uuid }));
        })
        .catch(e => this.errorHandler2('error while setDescription', e));
    };
  }
  send(str: string) {
    console.log('current sendChannel state =>', this.sendChannel.readyState);
    if (this.sendChannel.readyState === 'open') {
      console.log('sendchannel sending => ', str);
      this.sendChannel.send(str || 'empty string');
    } else {
      console.log('this.sendChannel not opened');
    }
  }
  private errorHandler(error) {
    console.log(error);
  }
  private errorHandler2(val: string, error) {
    console.log(val, error);
  }
}
