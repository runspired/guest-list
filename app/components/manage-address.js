import Component from '@ember/component';
import { action } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';
import jQuery from 'jquery';
import PromiseToken from '../utils/promise-token';
import { Promise, resolve } from 'rsvp';
import {STATE_ABBR_MAP} from "../utils/options";
import { capitalize } from '@ember/string';

function isMaybeValidZipcode(zipcode) {
  if (zipcode.length !== 5) {
    return false;
  }
  return true;
}

const KNOWN_ZIPS = Object.create(null);

function requestZipcode(zipcode) {
  let promise;

  if (KNOWN_ZIPS[zipcode]) {
    promise = resolve(KNOWN_ZIPS[zipcode]);
  } else {
    promise = new Promise((resolve, reject) => {
      jQuery.ajax({
        url: `https://ziptasticapi.com/${zipcode}`,
        method: 'get',
        success: resolve,
        error: reject
      });
    }).then(strData => {
      let data = JSON.parse(strData);
      KNOWN_ZIPS[zipcode] = data;
      return data;
    });
  }

  return new PromiseToken(promise);
}

export default class ManageAddressComponent extends Component {
  @service store;
  @action
  createAddress() {
    if (this.address) {
      this.set('isEditing', true);
      return;
    }
    let address = this.store.createRecord('address');
    this.set('address', address);
    this.set('isEditing', true);
  }

  @action updateZipcode(event) {
    let zipcode = event.target.value;
    this.address.set('zipcode', zipcode);

    if (isMaybeValidZipcode(zipcode)) {
      if (this._lastZipRequest) {
        this._lastZipRequest.cancel();
      }
      this._lastZipRequest = requestZipcode(zipcode)
        .then((data) => {
          if (data.error) {
            alert(`The Zip Code ${zipcode} appears to be invalid.\n\tError: ${data.error}`);
          } else {
            let { address } = this;

            address.set('state', STATE_ABBR_MAP[data.state]);
            address.set('city', capitalize(data.city.toLowerCase()));
          }
        });
    }
  }

  @action
  saveAddress(address) {
    this.set('isEditing', false);
    this.onUpdate(address);
  }
}
