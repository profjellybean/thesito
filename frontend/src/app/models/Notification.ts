import {gql} from "@apollo/client/core";
import {Listing} from "./Listing";
import {User} from "./User";
import {NotificationType} from "./Enums";

export interface Notification {
  id: number;
  connectedListing: Listing;
  connectedUser: User;
  notificationType: NotificationType;
  createdAt: Date,
}

export const getAllNotificationsForUserWithId = gql`
  query getAllNotificationsForUserWithId($id: BigInteger!) {
    getAllNotificationsForUserWithId(id: $id) {
        id
        notificationType
        connectedListing {
            id
            title
        }
        createdAt
    }
}
`;
