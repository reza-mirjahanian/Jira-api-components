import constants from '../constants';
import Logger from '../utils/logger';
import axios from 'axios';
import _ from 'lodash';
import {
  Component, ComponentWithIssueCount
} from '../Types';
export default class Jira {

  private readonly JIRA_API_URL
  private readonly PROJECT_KEY

  constructor(projectKey = 'IC') {
    this.JIRA_API_URL = constants.JIRA.API.URL;
    this.PROJECT_KEY = encodeURI(projectKey);
  }

  /**
   * Return the list of all components (including lead components)
   */
  async getAllComponents(): Promise < Component[] > {
    try {
      const {
        data
      } = await axios.get(`${this.JIRA_API_URL}/project/${this.PROJECT_KEY}/components`);

      return data;

    } catch (e) {
      Logger.error("Jira:getAllComponents()", {
        message: (e as Error).message
      });
      throw e;
    }
  }

  /**
   * Return the list of non-lead components
   */
  async getAllNonLeadComponents(): Promise < Component[] > {
    try {
      const components = await this.getAllComponents();
      return _.filter(components, o => o.assigneeType !== constants.JIRA.COMPONENT_LEAD_LABEL);

    } catch (e) {
      Logger.error("Jira:getAllNonLeadComponents()", {
        message: (e as Error).message
      });
      throw e;
    }
  }

  /**
   *  We add only 'fields=components' for reducing loaded data.
   *  We should handle the pagination.
   *  @see {@link https://developer.atlassian.com/cloud/jira/platform/rest/v3/intro/#expansion| Expansion}
   *  @param {number} paginationSize - Manage the maximum returned size of data from the server. There is a limit from Jira on the number.
   */
  async countIssuesForNonEmptyComponents(paginationSize = constants.JIRA.API.PAGINATION_SIZE): Promise < Record < string, number >> {
    let start = 0;
    let startAt, maxResults, total;
    const componentsTable: Record < string, number > = {};
    try {
      //Maybe Promise.All()
      while (true) {
        const {
          data
        } = await axios.get(`${this.JIRA_API_URL}/search?jql=project=${this.PROJECT_KEY} and component is not empty&startAt=${start}&maxResults=${paginationSize}&fields=components`);

        ({
          startAt,
          maxResults,
          total,
        } = data);

        if (!_.isNumber(startAt) || !_.isNumber(maxResults) || !_.isNumber(total)) {
          throw Error('Wrong response from server!')
        }

        //Count issues per each component
        _.forEach(_.get(data, 'issues'), n => {
          _.forEach(_.get(n, 'fields.components'), c => {
            const {
              id
            } = c;
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

      return componentsTable;

    } catch (e) {
      Logger.error("Jira:countIssuesForNonEmptyComponents()", {
        message: (e as Error).message
      });
      throw e;
    }
  }


  /**
   * Return the list of non-lead components along with the number of issues.
   */
  async getNonLeadComponentsWithIssuesCount(): Promise<ComponentWithIssueCount[]> {
    try {
      const components = await this.getAllNonLeadComponents();
      const issuesCount = await this.countIssuesForNonEmptyComponents();
      return _.map(components, c => {
        const {
          id
        } = c;

        //@todo pick only required keys, not all of the data (...c)
        return {
          issuesCount: _.get(issuesCount, id, 0),
          ...c
        }
      });

    } catch (e) {
      Logger.error("Jira:getNonLeadComponentsWithIssuesCount()", {
        message: (e as Error).message
      });
      throw e;
    }
  }
}
