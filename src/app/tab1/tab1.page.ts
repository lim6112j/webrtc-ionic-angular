import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit, ViewChildren } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { Plugins } from '@capacitor/core';
import { Subscription } from 'rxjs';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import { SocketioService } from '../services/socketio.service';

const { Storage } = Plugins;

const getGroupGql = gql`
  query GetGroup($groupId: ID!)
  {
    group(id: $groupId){
      id
      title
    }
  }
`;
// const getActivities = gql`
//   query GetActivities()
//   {

//   }
// `;

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit, OnDestroy, AfterViewInit {
  subs: Subscription;
  uuid: string;
  rates: any[];
  loading = true;
  error: any;
  image: string;
  private querySubscription: Subscription;
  private activirySubscription: Subscription;
  textareas: FormGroup;
  private peerConnection: RTCPeerConnection;
  private signalingConnection: WebSocket;
  private sendChannel: RTCDataChannel;
  private formBuilder: FormBuilder;
  datarcv: string;
  @ViewChild('dataChannelSend', {static: false}) dataChannelSend: ElementRef;
  constructor(
    private apollo: Apollo,
    fb: FormBuilder,
    private socketio: SocketioService
  ) {
    this.uuid = this.socketio.uuid;
    this.image = '../assets/그룹 3677@3x.png';
    this.textareas = fb.group({
      dataChannelSend: new FormControl({value: '', disabled: true}),
      dataChannelReceive: ['']
    });
  }
  ngOnInit() {
    this.querySubscription = this.apollo
    .watchQuery({
      query: getGroupGql,
      variables: {
        groupId: '67656e6573697347726f7570'
      },
    })
    .valueChanges.subscribe(result => {
      console.log(result);
      // this.rates = result.data && result.data.;
      // this.loading = result.loading;
      // this.error = result.errors;
    });
  }
  ngAfterViewInit() {
    this.dataChannelSend.nativeElement.placeholder = 'Press Start, enter some text, then press Send...';
  }

  ngOnDestroy() {
    this.querySubscription.unsubscribe();
    this.subs.unsubscribe();
  }
  async setObj() {
    await Storage.set({
      key: 'user',
      value: JSON.stringify({
        id: 1,
        name: 'max'
      })
    });
  }
  start() {
    this.socketio.setupSocketConnection();
    this.dataChannelSend.nativeElement.disabled = false;
    this.subs = this.socketio.receivedMsg.subscribe((rcvmsg) => {
      this.datarcv = rcvmsg;
    });
  }
  send() {
    // console.log(this.dataChannelSend.nativeElement.value);
    this.socketio.send(this.dataChannelSend.nativeElement.value);
  }
}
