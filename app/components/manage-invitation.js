import Component from "@ember/component";
import { action } from "@ember-decorators/object";
import { service } from "@ember-decorators/service";
import { metaFor } from "../helpers/meta-for";
import { set } from "@ember/object";

export default class ManageInvitationComponent extends Component {
  constructor() {
    super(...arguments);
    this.families = [
      this.session.user.get("wedding.content.party1"),
      this.session.user.get("wedding.content.party2")
    ];
  }

  @service store;
  @service session;
  @service router;

  @action
  toggleInvitationStatus(invitation, status) {
    invitation.set("isInvited", status);
    invitation.get("guests").then(guests => {
      guests.forEach(guest => {
        guest.set("isInvited", status);
        guest.save();
      });
      invitation.save();
    });
  }

  @action
  saveInvitation(invitation) {
    invitation.save();
  }

  @action
  toggleSecondWaveStatus(invitation, status) {
    invitation.set("isSecondWave", status);
    invitation.save();
  }

  @action
  deleteInvitation(invitation) {
    let prompt = `Are you sure you want to delete the invitation for ${
      invitation.name
    }?\n\nThis invitation contains the following guests:\n\t - ${invitation.guests
      .map(g => g.name)
      .join("\n\t - ")}`;
    if (confirm(prompt)) {
      invitation.deleteRecord();
      invitation
        .save({ adapterOptions: { cascadeDelete: ["guests"] } })
        .then(() => {
          invitation.unloadRecord();
          this.router.transitionTo("auth.invitations");
        });
    }
  }

  @action
  addInvitation(name) {
    let invitation = this.store.createRecord("invitation", {
      name,
      group: null
    });

    invitation.save().then(() => {
      let state = metaFor([invitation]);
      set(state, "isEditing", true);
      this.router.transitionTo("auth.invitations.invitation", invitation);
    });
  }

  @action
  addGuest(invitation, name) {
    let guest = this.store.createRecord("guest", {
      name,
      invitation
    });

    guest.save();
  }

  @action
  updateAddress(invitation, address) {
    invitation.set("address", address);
    address.save().then(() => invitation.save());
  }
}
