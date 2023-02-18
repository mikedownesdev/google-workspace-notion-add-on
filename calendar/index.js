import { Client } from '@notionhq/client';
const notion = new Client({ auth: process.env.NOTION_ACCESS_TOKEN });

function calendarHomepage() {
    const card = {
        name: "CALENDAR_HOME",
        sections: [
            {
              "header": "CALENDAR_HOME",
              "widgets": [
                {
                  "decoratedText": {
                    "text": "Database Name",
                    "bottomLabel": "Bottom Label",
                    "topLabel": "",
                    "startIcon": {
                      "knownIcon": "EMAIL",
                      "altText": "Send an email"
                    }
                  }
                },
              ]
            }
        ],
    };

    return card
}

// TODO: Typescript
// TODO: Handle Errors
async function calendarEventOpen(eventId) {
    // TODO: Change to configured databaseId
    const databaseId = "98fb65ff99354dbf9f48f958a1eb03a6"

    // TODO: Change to Promise.awaitAll to prevent blocking
    const database = await notion.databases.retrieve({ database_id: databaseId })
    const databaseProps = database.properties;
    const response = await notion.databases.query({
        database_id: databaseId,
        filter: {
          property: "Event ID",
          rich_text: {
            contains: eventId
          },
        },
        page_size: 2
    })

    
    const results = response.results

    if (results && results.length == 1) {
        const page = results[0];
        const pageProperties = page.properties;
        const [titlePropertyLabel, titleProperty] = getTitlePropertyForPage(page);

        const widgets = getWidgetsFromProperties(databaseProps, pageProperties);

        const card = {
            name: "CALENDAR_EVENT",
            header: {
                title: titleProperty.title[0].plain_text,
                subtitle: page.id,
                imageUrl: "https://source.unsplash.com/featured/320x180?nature&sig=8",
                imageType: "CIRCLE"
            },
            sections: [
                {
                    widgets: widgets
                }
            ]
            // sections: [
            //     {
            //       "widgets": [
            //         {
            //           "textInput": {
            //             "label": "Prop 1",
            //             "type": "SINGLE_LINE",
            //             "name": "fieldOne",
            //             "hintText": "hint",
            //             "value": ""
            //           }
            //         },
            //         {
            //           "selectionInput": {
            //             "type": "DROPDOWN",
            //             "label": "Dropdown",
            //             "name": "select1",
            //             "items": [
            //               {
            //                 "text": "Choice 1",
            //                 "value": "1",
            //                 "selected": false
            //               },
            //               {
            //                 "text": "Choice 2",
            //                 "value": "2",
            //                 "selected": false
            //               },
            //               {
            //                 "text": "Choice 3",
            //                 "value": "3",
            //                 "selected": false
            //               }
            //             ]
            //           }
            //         },
            //         {
            //           "dateTimePicker": {
            //             "label": "Property Label",
            //             "name": "dateTime",
            //             "type": "DATE_AND_TIME"
            //           }
            //         },
            //         {
            //           "decoratedText": {
            //             "topLabel": "Property Label",
            //             "text": "Content here",
            //           },
            //           "horizontalAlignment": "START"
            //         },
            //         {
            //           "decoratedText": {
            //             "topLabel": "Top label",
            //             "text": "Content here"
            //           }
            //         },
            //         {
            //           "decoratedText": {
            //             "topLabel": "Top label",
            //             "text": "Content here"
            //           }
            //         }
            //       ],
            //     }
            // ]
        };

        return card

    }
}

// TODO: Expand, abstract and refactor properties to widgets
function getTitlePropertyForPage(page) {
    const asArray = Object.entries(page.properties);
    const filtered = asArray.filter(([propLabel, propDetails]) => propDetails.id === 'title');
    if (filtered.length === 1) { 
        return filtered[0];
    }

    throw `Title Property for Page ${page.id} could not be determined`
}

function getWidgetsFromProperties(databaseProperties, pageProperties) {

    const propertyPairs = Object.entries(pageProperties);
    const x = propertyPairs
        .filter(([propLabel, propDetails]) => {
            return propDetails.type === "select"
        })
        .map((propertyPair) => {
            const [propLabel, propDetails] = propertyPair
            const propertySchema = databaseProperties[propLabel] 
            return getWidgetFromPropertyValue(propertySchema, propertyPair)
        })

    return x

    function getWidgetFromPropertyValue(propertySchema, [propertyLabel, propertyDetails]) {
        
        var widget = {}
        const propertyType = propertyDetails.type

        switch (propertyType) {
            case "select":
                let options = propertySchema.select.options.map((option) => {
                    return ({
                        text: option.name,
                        value: option.id,
                        selected: (option.id === propertyDetails.select?.id)
                    })
                })
                widget["selectionInput"] = {
                    "type": "DROPDOWN",
                    "label": propertyLabel,
                    "name": propertyLabel,
                    "items": options
                }
        }

        return widget
    }
}

export { calendarHomepage, calendarEventOpen }