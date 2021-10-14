const axios = require('axios');
const _ = require('lodash');

module.exports = class Jira {
    JIRA_HOST = 'https://herocoders.atlassian.net'
    JIRA_API_PATH = '/rest/api/3'
    JIRA_API_URL = ''
    PROJECT_KEY = ''

    /**
     * @param  {string} [projectKey=IC]
     */
    constructor(projectKey = 'IC') {
        this.JIRA_API_URL = `${this.JIRA_HOST}${this.JIRA_API_PATH}`;
        this.PROJECT_KEY = encodeURI(projectKey);
    }


    /**
     * Return the list of non-lead components.
     * We get all the components. Then filter out lead components.
     * @return {Promise<Array>}
     */
    async getAllNonLeadComponents() {
        try {
            const {
                data: components
            } = await axios.get(`${this.JIRA_API_URL}/project/${this.PROJECT_KEY}/components`);

            return _.filter(components, o => _.get(o, 'assigneeType') !== 'COMPONENT_LEAD');
        } catch (e) {
            console.error("Jira:getAllNonLeadComponents()", e.message);
            throw e;
        }
    }


    /**
     *  We create a new request for each component and run it in parallel. We should be careful about if there are many components ...
     *  We add only 'fields=components' for reducing loaded data.
     *  @return {Promise<Array>}
     */
    async getNonLeadComponentsWithIssuesCount() {
        try {
            const components = await this.getAllNonLeadComponents();

            const _calCount = async (component) => {
                //@todo I think 'project=IC and ' is redundant
                const {
                    data: {
                        total
                    }
                } = await axios.get(`${this.JIRA_API_URL}/search?jql=project=${this.PROJECT_KEY} and component = ${component.id} &fields=components`);
                return {
                    issuesCount: total,
                    ...component
                }
            }

            //Create and call new request for each component.
            return await Promise.all(components.map(component => _calCount(component)));

        } catch (e) {
            console.error("Jira:getNonLeadComponentsWithIssuesCount()", e.message);
            throw e;
        }
    }


}
