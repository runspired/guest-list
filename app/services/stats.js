import Service from "@ember/service";
import { computed } from "@ember-decorators/object";
import { service } from "@ember-decorators/service";
import { capitalize } from "@ember/string";

function hasFullAddress(address) {
  return (
    typeof address.street === "string" &&
    address.street.length > 2 &&
    typeof address.zipcode === "string" &&
    address.zipcode.length > 4
  );
}

function capitalizeWords(str) {
  return str
    .split(" ")
    .map(capitalize)
    .join(" ");
}

export default class StatsService extends Service {
  @service session;
  @service store;

  @computed(
    "invitations.data.@each.{isInvited,name,address}",
    "addresses.data.@each.{street,street2,city,state,zipcode}"
  )
  get csvData() {
    let { invitations, addresses, store } = this;
    let data = [
      [
        "Name on Envelope",
        "Address 1",
        "Address 2",
        "City",
        "State",
        "Zip",
        "Country"
      ]
    ];
    let missingAddresses = [];
    invitations.data.forEach(invite => {
      if (invite.isInvited) {
        let id = invite.belongsTo("address").id();

        if (!id) {
          missingAddresses.push(invite);
          return;
        }

        let address = store.peekRecord("address", id);

        if (address !== null && hasFullAddress(address)) {
          let country = address.state.toLowerCase() === "uk" ? "UK" : "USA";
          let state = country === "USA" ? address.state : "";

          let row = [
            capitalizeWords(invite.name),
            capitalizeWords(address.street),
            capitalizeWords(address.street2),
            capitalizeWords(address.city),
            capitalizeWords(state),
            address.zipcode,
            country
          ];

          data.push(row);
        } else {
          missingAddresses.push(invite);
        }
      }
    });

    this.missingAddresses = missingAddresses;

    return data;
  }

  @computed(
    "guests.data.@each.{isInvited,invitation}",
    "invitations.data.@each.{isInvited,sideOfTheWedding}"
  )
  get guestCounts() {
    let { guests, invitations } = this;
    let wedding = this.session.wedding;
    let { party1, party2 } = wedding;

    let counts = {
      invitationsToSend: 0,
      invitationsToHold: 0,
      guestsToInvite: 0,
      guestsToHold: 0,
      guestsNotOnInvitations: 0,
      party1Invites: 0,
      party2Invites: 0,
      invitationsWithoutParty: 0,
      party1Guests: 0,
      party2Guests: 0,
      guestsWithoutParty: 0,
      firstWaveInvitations: 0,
      firstWaveGuests: 0,
      secondWaveInvitations: 0,
      secondWaveGuests: 0
    };

    invitations.data.forEach(invite => {
      invite.isInvited
        ? counts.invitationsToSend++
        : counts.invitationsToHold++;
      if (invite.isInvited) {
        if (invite.sideOfTheWedding === party1) {
          counts.party1Invites++;
        } else if (invite.sideOfTheWedding === party2) {
          counts.party2Invites++;
        } else {
          counts.invitationsWithoutParty++;
        }
        invite.isSecondWave
          ? counts.secondWaveInvitations++
          : counts.firstWaveInvitations++;
      }
    });

    guests.data.forEach(guest => {
      guest.isInvited ? counts.guestsToInvite++ : counts.guestsToHold++;

      if (guest.isInvited) {
        let invite = guest.belongsTo("invitation").value();

        invite.isSecondWave
          ? counts.secondWaveGuests++
          : counts.firstWaveGuests++;

        if (!invite) {
          counts.guestsNotOnInvitations++;
          counts.guestsWithoutParty++;
        } else {
          if (invite.sideOfTheWedding === party1) {
            counts.party1Guests++;
          } else if (invite.sideOfTheWedding === party2) {
            counts.party2Guests++;
          } else {
            counts.guestsWithoutParty++;
          }
        }
      }
    });

    return counts;
  }
}
