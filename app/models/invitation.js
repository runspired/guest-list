import DS from "ember-data";
import { attr, belongsTo, hasMany } from "@ember-decorators/data";
const { Model } = DS;

export default class InvitationModel extends Model {
  @attr name;
  @attr({ defaultValue: "" })
  sideOfTheWedding;
  @attr({ defaultValue: true })
  isInvited;
  @attr({ defaultValue: false })
  isSecondWave;
  @belongsTo("group", { async: true, inverse: "invitations" }) group;
  @hasMany("guest", { async: true, inverse: "invitation" }) guests;
  @belongsTo("address", { async: true, inverse: "invitation" })
  address;
}
