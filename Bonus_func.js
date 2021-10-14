/**
 *  Bonus function, with pagination. If the counts of components are high, it should be more efficient rather than request per each component :)
 *  Limited with 'component  IN ( 10103, 10104, 10105, 10106 )'
 *  We add only 'fields=components' for reducing loaded data.
 *  We should handle the pagination.
 *  @see {@link https://developer.atlassian.com/cloud/jira/platform/rest/v3/intro/#expansion| Expansion}
 *  @return {Promise<Array>}
 */

async function _getNonLeadComponentsWithIssuesCount() {

    let start = 0, startAt, maxResults = 100, total;
    const componentsTable = {};
    try {
        const components = await this.getAllNonLeadComponents();
        if (components.length < 1) {
            return [];
        }
        const componentIds = _.map(components, 'id').join(','); // 10103, 10104, 10105, 10106

        while (true) {
            const {data} = await axios.get(`${this.JIRA_API_URL}/search?jql=project=${this.PROJECT_KEY} and component IN (${componentIds}) &startAt=${start}&maxResults=100&fields=components`);

            ({startAt, maxResults, total} = data);

            if (!_.isNumber(startAt) || !_.isNumber(maxResults) || !_.isNumber(total)) {
                throw Error('Wrong response from server!')
            }

            //Count issues per each component
            _.forEach(_.get(data, 'issues'), n => {
                _.forEach(_.get(n, 'fields.components'), c => {
                    const {id} = c;
                    if (!componentsTable[id]) {
                        componentsTable[id] = 0;
                    }
                    componentsTable[id]++;
                })
            });

            //Check we are on the last page
            if (startAt + maxResults >= total) {
                break
            }
            start += Number(maxResults);
        }

        // Merge issuesCount with each component
        return _.map(components, c => {
            return {
                issuesCount: _.get(componentsTable, c.id, 0),
                ...c
            }
        });

    } catch (e) {
        console.error("Jira:getNonLeadComponentsWithIssuesCount()", e.message);
        throw e;
    }
}
