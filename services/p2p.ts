import { gql } from "graphql-request";

const p2pTopParametersFields = `
  data {
    id
    attributes {
      code
      en_name
      ru_name
      type
      parameter {
        id
        en_description
        ru_description
        icon {
          data {
            id
            attributes {
              url
              alternativeText
            }
          }
        }
      }
    }
  }
`;

export const p2pMakersQuery = gql`
  query p2pMakersQuery {
    p2PMakers(
      filters: { status: { in: ["active", "suspended", "disabled"] } }
    ) {
      data {
        id
        attributes {
          telegram_name
          telegram_username
          status
          createdAt
          offers {
            data {
              id
              attributes {
                side
                dir
                isActive
                follow_market
                course
                min
                max
                fee_type
                fee_amount
                city_from
                city_to
                top_parameters {
                  ${p2pTopParametersFields}
                }
              }
            }
          }
          top_parameters {
            ${p2pTopParametersFields}
          }
          p2p_level {
            data {
              id
              attributes {
                level
                description
                limit_online_usd
                limit_offline_usd
                title
                deals_needed
                deposit_usd
                p2p_conditions {
                  data {
                    id
                    attributes {
                      title
                      description
                    }
                  }
                }
              }
            }
          }
          p2p_conditions_completed {
            data {
              id
              attributes {
                title
                description
              }
            }
          }

          exchanger_tags {
            data {
              id
              attributes {
                name
                description
                color
              }
            }
          }
          avatar {
            data {
              id
              attributes {
                url
                alternativeText
              }
            }
          }

          reviews(filters: { isApproved: { eq: true } }) {
            data {
              id
            }
          }
        }
      }
    }
  }
`;

export const p2pMakerQuery = gql`
  query p2pMakerQuery($telegramUsername: String) {
    p2PMakers(
      filters: {
        telegram_username: { eqi: $telegramUsername }
        status: { in: ["active", "suspended", "disabled"] }
      }
    ) {
      data {
        id
        attributes {
          telegram_name
          telegram_username
          deals_finished
          deals_canceled
          rating
          need_ai_helper
          deposit_usd
          status
          createdAt
          offers {
            data {
              id
              attributes {
                side
                dir
                isActive
                follow_market
                course
                min
                max
                fee_type
                fee_amount
                city_from
                city_to
                top_parameters {
                  ${p2pTopParametersFields}
                }
              }
            }
          }
          top_parameters {
            ${p2pTopParametersFields}
          }
          p2p_level {
            data {
              id
              attributes {
                level
                description
                limit_online_usd
                limit_offline_usd
                title
                deals_needed
                deposit_usd
                p2p_conditions {
                  data {
                    id
                    attributes {
                      title
                      description
                    }
                  }
                }
              }
            }
          }
          p2p_conditions_completed {
            data {
              id
              attributes {
                title
                description
              }
            }
          }
          coordinates
          exchanger_tags {
            data {
              id
              attributes {
                name
                description
                color
              }
            }
          }
          avatar {
            data {
              id
              attributes {
                url
                alternativeText
              }
            }
          }
          description

          reviews(filters: { isApproved: { eq: true } }) {
            data {
              id
              attributes {
                fingerprint
                ipAddress
                name
                text
                type
                isDispute
                isClosed
                isApproved
                review_categories {
                  data {
                    id
                    attributes {
                      title
                      description
                      isNegative
                      image {
                        data {
                          id
                          attributes {
                            name
                            alternativeText
                            url
                          }
                        }
                      }
                    }
                  }
                }
                userAgent
                location
                updatedAt
                screenshots {
                  data {
                    id
                    attributes {
                      name
                      alternativeText
                      url
                    }
                  }
                }
                review_replies {
                  data {
                    id
                    attributes {
                      text
                      from
                      iaApproved
                      updatedAt
                      screenshots {
                        data {
                          id
                          attributes {
                            name
                            alternativeText
                            url
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const p2pMakerTopParametersQuery = gql`
  query p2pMakerTopParametersQuery {
    topParameters(
      filters: { type: { eq: "p2p_maker" } }
      pagination: { start: 0, limit: 2000 }
    ) {
      ${p2pTopParametersFields}
    }
  }
`;

export const p2pOfferTopParametersQuery = gql`
  query p2pOfferTopParametersQuery {
    topParameters(
      filters: { type: { eq: "p2p_offer" } }
      pagination: { start: 0, limit: 2000 }
    ) {
      ${p2pTopParametersFields}
    }
  }
`;

export const testReviewQuery = gql`
  query TestReviewQuery {
    reviews(filters: { fingerprint: { eq: "test" } }) {
      data {
        id
        attributes {
          fingerprint
          ipAddress
          name
          text
          type
          isDispute
          isClosed
          isApproved
          userAgent
          location
          updatedAt
          review_replies {
            data {
              id
              attributes {
                text
                from
                iaApproved
                updatedAt
                screenshots {
                  data {
                    id
                    attributes {
                      name
                      alternativeText
                      url
                    }
                  }
                }
              }
            }
          }
          screenshots {
            data {
              id
              attributes {
                name
                alternativeText
                url
              }
            }
          }
        }
      }
    }
  }
`;

export const p2pLevelsQuery = `
{
  p2PLevels{
    data{
      id
      attributes{
        level
        description
        limit_online_usd
        limit_offline_usd
        title
        deals_needed
        deposit_usd
        p2p_conditions{
          data{
            id
            attributes{
              title
              description
            }
          }
        }
      }
    }
  }
}`;

export const p2pAdsQuery = `
{
  p2PAds{
    data{
      id
     attributes{
      title
      description
      details
      slug
      image{
        data{
          id
          attributes{
            url
            alternativeText
          }
        }
      }
    } 
    }
  }
}`;
