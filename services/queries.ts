import { Image } from "@chakra-ui/react";
import { gql } from "graphql-request";

//reusable not to make a mistake
const pmGroup = gql`
    data {
      id
      attributes {
        en_name
        ru_name
        countries
        prefix
        options {
          ... on ComponentSelectorSubgroup {
            id
            name
            code
            alternative_codes
            currency {
              data {
                id
                attributes {
                  code
                  accuracy
                }
              }
            }
          }
          ... on ComponentSelectorCurrency {
            id
            currency {
              data {
                id
                attributes {
                  code
                  accuracy
                }
              }
            }
          }
        }
        color

        icon {
          data {
            id
            attributes {
              alternativeText
              url
            }
          }
        }
      }
    }
  
`;

export const pmsQuery = gql`
  {
    pms(pagination: { start: 0, limit: 1000 }) {
      data {
        id
        attributes {
          code
          popular_as
          pm_group{${pmGroup}}
        }
      }
    }
  }
`;

export const pmGroupsByNamesQuery = gql`
  query pmGroupsByNames($giveName: String, $getName: String) {
    pmGroups(
      filters: {
        or: [{ en_name: { eqi: $giveName } }, { en_name: { eqi: $getName } }]
      }
    ) {
      ${pmGroup}
    }
  }
`;

export const dirsTextQuery = gql`
  query dirsText(
    $locale: I18NLocaleCode # $section_give: String # $section_get: String
  ) {
    dirsTexts(
      locale: $locale # filters: { #   section_give: { eqi: $section_give } #   section_get: { eqi: $section_get } # }
    ) {
      data {
        id
        attributes {
          section_give
          section_get
          seo_title
          seo_description
          header
          subheader
          text
        }
      }
    }
  }
`;

export const exchangerQuery = gql`
  query ExchangerQuery($name: String!) {
    exchangers(
      filters: {
        name: { eqi: $name }
        status: { in: ["active", "suspended"] }
        ref_link: { notNull: true }
        rates_link: { notNull: true }
      }
    ) {
      data {
        id
        attributes {
          name
          display_name
          status
          ref_link
          admin_rating
          exchanger_card {
            id
            telegram
            email
            phone_number
            whatsapp
            date_created
            working_time
            en_description
            ru_description
            text
            total_reserve_usd
          }
          logo {
            data {
              id
              attributes {
                name
                alternativeText
                url
              }
            }
          }
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
                exchanger {
                  data {
                    id
                    attributes {
                      name
                      display_name
                      logo {
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
          offices {
            data {
              id
              attributes {
                coordinates
                city
                visible
                working_time
                description
                address
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
          monitorings {
            ... on ComponentExchangerMonitoring {
              id
              link
              monitoring {
                data {
                  id
                  attributes {
                    name
                    url
                    logo {
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
          exchanger_templates {
            data {
              id
              attributes {
                show_in_rates
                top_parameter {
                  data {
                    id
                    attributes {
                      code
                      parameter {
                        en_description
                        ru_description
                        icon {
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
                      en_name
                      ru_name
                    }
                  }
                }
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
        }
      }
    }
  }
`;
// export const exchangerQuery = gql`
//   query ExchangerQuery($name: String!) {
//     exchangers(filters: { name: { eqi: $name } }) {
//       data {
//         id
//         attributes {
//           name
//           ref_link

//           admin_rating
//           updatedAt
//           exchanger_card {
//             en_description
//             ru_description
//             telegram
//             email
//             working_time
//           }

//           offices(filters: { visible: { eq: true } }) {
//             data {
//               id
//               attributes {
//                 visible
//               }
//             }
//           }
//           logo {
//             data {
//               id
//               attributes {
//                 alternativeText
//                 url
//               }
//             }
//           }
//         }
//       }
//     }
//   }
// `;

export const exchangersQuery = gql`
  {
    exchangers(
      pagination: { start: 0, limit: 2000 }
      filters: {
        status: { in: ["active", "suspended"] }
        ref_link: { notNull: true }
        rates_link: { notNull: true }
      }
    ) {
      data {
        id
        attributes {
          name
          display_name
          ref_link
          status
          admin_rating
          updatedAt
          exchanger_card {
            en_description
            ru_description
            telegram
            email
            working_time
          }
          exchanger_templates {
            data {
              id
              attributes {
                include
                exclude
                cities
                top_parameter {
                  data {
                    id
                    attributes {
                      code
                    }
                  }
                }
              }
            }
          }
          offices(filters: { visible: { eq: true } }) {
            data {
              id
              attributes {
                visible
              }
            }
          }
          logo {
            data {
              id
              attributes {
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

export const exchangersMapQuery = gql`
  query ExchangersMap {
    exchangers(
      pagination: { start: 0, limit: 2000 }
      filters: {
        exchanger_card: {
          ru_description: { notNull: true }
          en_description: { notNull: true }
        }
        ref_link: { notNull: true }
        rates_link: { notNull: true }
        offices: { id: { notNull: true } }
      }
    ) {
      data {
        id
        attributes {
          name
          display_name
          ref_link

          admin_rating
          updatedAt
          exchanger_card {
            telegram
            email
            working_time
          }
          logo {
            data {
              id
              attributes {
                alternativeText
                url
              }
            }
          }
          offices {
            data {
              id
              attributes {
                visible
                coordinates
                city
                working_time
                description
                address
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
        }
      }
    }
  }
`;

export const selectorQueryAll = gql`
   query Selector  {
    selector {
      data {
        id
        attributes {
          en_give_header
          ru_give_header
          en_get_header
          ru_get_header
          search_bar {
            ru_placeholder
            en_placeholder
            ru_give_adornment
            en_give_adornment
            ru_get_adornment
            en_get_adornment
          }
          sections {
            id
            rows
            columns
            ru_title
            en_title
            pm_groups(pagination: { start: 0, limit: 2000 } ) {
              ${pmGroup}
          }
        }
      }
    }
  }
   }
`;

export const selectorQuery = gql`
   query Selector  {
    selector {
      data {
        id
        attributes {
          en_give_header
          ru_give_header
          en_get_header
          ru_get_header
          search_bar {
            ru_placeholder
            en_placeholder
            ru_give_adornment
            en_give_adornment
            ru_get_adornment
            en_get_adornment
          }
          sections {
            id
            rows
            columns
            ru_title
            en_title
            pm_groups(
              pagination: { start: 0, limit: 2000 }
              filters: { countries: { null: true } }
            ) {
              ${pmGroup}
          }
        }
      }
    }
  }
   }
`;

export const citiesQuery = gql`
  {
    parserSetting {
      data {
        attributes {
          cities
        }
      }
    }
  }
`;

export const blogQuery = gql`
  query GetArticlesPreview($locale: I18NLocaleCode) {
    articles(
      locale: $locale
      pagination: { start: 0, limit: 1200 }
      filters: { text: { notNull: true }, type: { eq: "blog" } }
    ) {
      data {
        id
        attributes {
          code
          header
          subheader
          updatedAt
          preview {
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

export const articleQuery = gql`
  query GetArticle($locale: I18NLocaleCode, $code: String!) {
    articles(
      locale: $locale

      filters: {
        code: { eqi: $code }
        or: [{ type: { ne: "page" } }, { type: { null: true } }]
      }
      pagination: { start: 0, limit: 1200 }
    ) {
      data {
        id
        attributes {
          code
          header
          subheader
          seo_title
          seo_description
          updatedAt
          chapters
          stats
          text
          preview {
            data {
              id
              attributes {
                name
                alternativeText
                url
              }
            }
          }
          wallpaper {
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

export const articleCodesQuery = gql`
  query Articles($locale: I18NLocaleCode) {
    articles(
      locale: $locale
      pagination: { start: 0, limit: 1000 }
      filters: { or: [{ type: { ne: "page" } }, { type: { null: true } }] }
    ) {
      data {
        attributes {
          code
        }
      }
    }
  }
`;

export const MainTextsQuery = gql`
  query MainTexts($locale: I18NLocaleCode) {
    mainTexts(locale: $locale, pagination: { start: 0, limit: 2000 }) {
      data {
        id
        attributes {
          title
          description
          link {
            id
            text
            href
            isExternal
            isBlank
          }
          image {
            data {
              id
              attributes {
                name
                alternativeText
                url
                formats
              }
            }
          }
        }
      }
    }
  }
`;

export const unisQuery = gql`
  query Unis {
    unis(pagination: { page: 1, pageSize: 10 }, sort: "header:ASC") {
      data {
        id
        attributes {
          header
          subheader
          image {
            data {
              id
              attributes {
                name
                alternativeText
                url
                formats
              }
            }
          }
          article {
            data {
              id
              attributes {
                code
                header
              }
            }
          }
        }
      }
    }
  }
`;

export const mainSingleQuery = gql`
  query Main($locale: I18NLocaleCode) {
    mains(locale: $locale, pagination: { start: 0, limit: 1 }, sort: "id:asc") {
      data {
        id
        attributes {
          title
          subtitle
          seo_title
          seo_subtitle
          program_title
          reasons_title
          guarantee_title
          price_title
          price_value
          price_note
          price_button_text
          benefit {
            ... on ComponentSharedBenefit {
              id
              text
            }
          }
          program_weeks {
            id
            title
            items {
              id
              icon
              text
            }
          }
          reasons {
            id
            icon
            title
            subtitle
          }
          guarantees {
            id
            icon
            text
          }
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
  }
`;

export const storiesQuery = gql`
  query Stories($locale: I18NLocaleCode) {
    stories(locale: $locale, pagination: { start: 0, limit: 30 }, sort: ["id:asc"]) {
      data {
        id
        attributes {
          name
          age
          city
          short_description
          article {
            data {
              id
              attributes {
                code
                header
              }
            }
          }
        }
      }
    }
  }
`;

export const TextBoxQuery = gql`
  query TextBox($locale: I18NLocaleCode, $key: String) {
    textBoxes(
      locale: $locale
      filters: { key: { eqi: $key } }
      pagination: { start: 0, limit: 200000 }
    ) {
      data {
        id
        attributes {
          header
          subheader
          text
          seo_description
          seo_title
          updatedAt
        }
      }
    }
  }
`;

export const TopParametersQuery = gql`
  {
    topParameters(pagination: { limit: 2000 }) {
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
                  name
                  url
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const reviewFingerprintQuery = gql`
  query ReviewFingerprint($id: ID) {
    reviews(filters: { id: { eq: $id } }) {
      data {
        id
        attributes {
          fingerprint
        }
      }
    }
  }
`;

export const allReviewsQuery = gql`
  query AllReviews {
    reviews(
      filters: { isApproved: { eq: true } }
      pagination: { limit: 8 }
      sort: ["updatedAt:desc"]
    ) {
      data {
        id
        attributes {
          exchanger {
            data {
              id
              attributes {
                name
                display_name
                logo {
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

export const exchangerReviewCategoriesQuery = gql`
  query ExchangerReviewCategories {
    reviewCategories(pagination: { limit: 2000 }) {
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
  }
`;

export const massDirTextIdsQuery = gql`
  query massDirTextIdsQuery($locale: I18NLocaleCode, $isSell: Boolean) {
    massDirsTexts(
      locale: $locale
      pagination: { start: 0, limit: 200000 }
      filters: { isSell: { eq: $isSell } }
    ) {
      data {
        id
        attributes {
          code
          currency {
            data {
              id
              attributes {
                code
              }
            }
          }
          isSell
          # header
          # subheader
          # seo_title
          # seo_description
          # text
        }
      }
    }
  }
`;

export const massDirTextQuery = gql`
  query massDirTextQuery(
    $locale: I18NLocaleCode
    $isSell: Boolean
    $code: String
    $currencyCode: String
  ) {
    massDirsTexts(
      locale: $locale
      pagination: { start: 0, limit: 200000 }
      filters: {
        isSell: { eq: $isSell }
        code: { eqi: $code }
        currency: { code: { eqi: $currencyCode } }
      }
    ) {
      data {
        id
        attributes {
          code
          currency {
            data {
              id
              attributes {
                code
              }
            }
          }
          isSell
          header
          subheader
          seo_title
          seo_description
          text
        }
      }
    }
  }
`;

export const FAQbyCategoryCodeQuery = gql`
  query FAQbyCategoryCode($code: String) {
    xFaqCategories(
      pagination: { start: 0, limit: 200000 }
      filters: { code: { eqi: $code } }
    ) {
      data {
        id
        attributes {
          code
          description
          color
          x_faqs {
            data {
              id
              attributes {
                question
                response
              }
            }
          }
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
  }
`;

export const FAQsQuery = gql`
  query FAQs {
    xFaqCategories(pagination: { start: 0, limit: 200000 }) {
      data {
        id
        attributes {
          code
          description
          color
          x_faqs {
            data {
              id
              attributes {
                question
                response
              }
            }
          }
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
  }
`;

export const createLeadMutation = gql`
  mutation CreateLead($data: LeadInput!) {
    createLead(data: $data) {
      data {
        id
      }
    }
  }
`;

export const createP2POfferMutation = gql`
  mutation createP2POffer($data: P2POfferInput!) {
    createP2POffer(data: $data) {
      data {
        id
      }
    }
  }
`;

export const updateP2POfferMutation = gql`
  mutation updateP2POffer($id: ID!, $data: P2POfferInput!) {
    updateP2POffer(id: $id, data: $data) {
      data {
        id
      }
    }
  }
`;

export const updateP2PMakerOffersMutation = gql`
  mutation updateP2PMakerOffers($id: ID!, $offers: [ID]) {
    updateP2PMaker(id: $id, data: { offers: $offers }) {
      data {
        id
      }
    }
  }
`;

export const updateP2PMakerMutation = gql`
  mutation updateP2PMaker($id: ID!, $data: P2PMakerInput!) {
    updateP2PMaker(id: $id, data: $data) {
      data {
        id
      }
    }
  }
`;
