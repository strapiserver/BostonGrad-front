import { gql } from "graphql-request";

export const CreateRedirectMutation = gql`
  mutation CreateRedirect(
    $direction: String
    $id_related_to: String
    $isP2P: Boolean
    $give: Float
    $get: Float
    $ip: String
  ) {
    createRedirect(
      data: {
        direction: $direction
        give: $give
        get: $get
        id_related_to: $id_related_to
        isP2P: $isP2P
        ip: $ip
      }
    ) {
      data {
        id
      }
    }
  }
`;
