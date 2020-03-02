import { Component, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { Plugins } from '@capacitor/core';
import { Subscription } from 'rxjs';
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
@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit{
  rates: any[];
  loading = true;
  error: any;
  image: string;
  private querySubscription: Subscription;
  constructor(private apollo: Apollo) {
    this.image = '../assets/그룹 3677@3x.png';
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
  async setObj() {
    await Storage.set({
      key: 'user',
      value: JSON.stringify({
        id: 1,
        name: 'max'
      })
    });
  }
}
