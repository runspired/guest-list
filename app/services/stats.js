import Service from '@ember/service';
import { computed } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';

export default class StatsService extends Service {
  @service session;

  @computed('guests.data.@each.{isInvited,invitation}', 'invitations.data.@each.{isInvited,sideOfTheWedding}')
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
      party1Guests: 0,
      party2Guests: 0,
      guestsWithoutParty: 0
    };

    invitations.data.forEach(invite =>
      (invite.isInvited ? counts.invitationsToSend++ : counts.invitationsToHold++)
    );

    guests.data.forEach(guest => {
      guest.isInvited ? counts.guestsToInvite++ : counts.guestsToHold++;

      if (guest.isInvited) {
        let invite = guest.belongsTo('invitation').value();

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
