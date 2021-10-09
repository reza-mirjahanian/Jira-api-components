import {
  expect
} from "chai";
import constants from '../../src/constants';
import sinon from "sinon";

import chai from "chai";
const sinonChai = require("sinon-chai");
const nock = require('nock')
chai.use(sinonChai);
import JiraRepo from '../../src/repository/Jira';

import {URLSearchParams} from "url";
const PROJECT_KEY = 'IC';

const mockAllComponentsResponse = require('../testData/mock/allComponents.json');
const mockAllIssuesResponse = require('../testData/mock/search_all_issues_24.json');
const mockIssuesPage0Response = require('../testData/mock/search_pagination/search_0_2.json');
const mockIssuesPage1Response = require('../testData/mock/search_pagination/search_1_2.json');
const mockIssuesPage2Response = require('../testData/mock/search_pagination/search_2_2.json');
suite('Testing Jira Repository', () => {
  suite('async getAllComponents()', () => {
    test('should return all components correctly ', async () => {

      const componentsPath = `${constants.JIRA.API.PATH}/project/IC/components`;
      nock(constants.JIRA.JIRA_HOST)
          .get(componentsPath)
          .reply(200, mockAllComponentsResponse);

      const jiraRepo = new JiraRepo();
      const result = await jiraRepo.getAllComponents();
      expect(result.length).to.be.equal(4);
      expect(result[0].project).to.be.equal('IC');
    });
  });

  suite('async getAllNonLeadComponents()', () => {
    test('should return all none components correctly ', async () => {
      const jiraRepo = new JiraRepo();
      const getAllComponentsStub = sinon.stub(jiraRepo, "getAllComponents");
      getAllComponentsStub.returns(Promise.resolve(mockAllComponentsResponse));
      const result = await jiraRepo.getAllNonLeadComponents();
      expect(result.length).to.be.equal(3);
      expect(result[1]).to.have.keys('assigneeType', 'description', 'id', 'isAssigneeTypeValid', 'name', 'project', 'projectId', 'realAssigneeType', 'self');
      getAllComponentsStub.restore();

    });
  });

  suite('async countIssuesForNonEmptyComponents()', () => {
    test('should count all the components', async () => {
      let startAt = 0;
      const query1 = `jql=project=${PROJECT_KEY} and component is not empty&startAt=${startAt}&maxResults=${constants.JIRA.API.PAGINATION_SIZE}&fields=components`;
      const searchPath = `${constants.JIRA.API.PATH}/search`;
      nock(constants.JIRA.JIRA_HOST)
          .get(searchPath)
          .query(new URLSearchParams(query1))
          .reply(200, mockAllIssuesResponse);

      const jiraRepo = new JiraRepo();
      const result = await jiraRepo.countIssuesForNonEmptyComponents();

      expect(result).to.be.deep.equal({ '10103': 6, '10104': 9, '10105': 8, '10106': 1 });
      nock.cleanAll();
    });

    test('should count all the components with pagination', async () => {
      let maxResult = 10;
      const query1 = `jql=project=${PROJECT_KEY} and component is not empty&startAt=${0}&maxResults=${maxResult}&fields=components`;
      const query2 = `jql=project=${PROJECT_KEY} and component is not empty&startAt=${maxResult}&maxResults=${maxResult}&fields=components`;
      const query3 = `jql=project=${PROJECT_KEY} and component is not empty&startAt=${maxResult * 2}&maxResults=${maxResult}&fields=components`;
      const searchPath = `${constants.JIRA.API.PATH}/search`;
      nock(constants.JIRA.JIRA_HOST)
          .get(searchPath)
          .query(new URLSearchParams(query1))
          .reply(200, mockIssuesPage0Response)
          .get(searchPath)
          .query(new URLSearchParams(query2))
          .reply(200, mockIssuesPage1Response)
          .get(searchPath)
          .query(new URLSearchParams(query3))
          .reply(200, mockIssuesPage2Response);

      const jiraRepo = new JiraRepo();
      const result = await jiraRepo.countIssuesForNonEmptyComponents(maxResult);

      expect(result).to.be.deep.equal({ '10103': 6, '10104': 9, '10105': 8, '10106': 1 });
      nock.cleanAll();
    });
  });

  suite('async getNonLeadComponentsWithIssuesCount()', () => {
    test('should return the list of non-lead components along with the number of issues correctly ', async () => {

      const componentsPath = `${constants.JIRA.API.PATH}/project/IC/components`;
      const query1 = `jql=project=${PROJECT_KEY} and component is not empty&startAt=${0}&maxResults=${constants.JIRA.API.PAGINATION_SIZE}&fields=components`;
      const searchPath = `${constants.JIRA.API.PATH}/search`;
      nock(constants.JIRA.JIRA_HOST)
          .persist()
          .get(componentsPath)
          .reply(200, mockAllComponentsResponse)
          .get(searchPath)
          .query(new URLSearchParams(query1))
          .reply(200, mockAllIssuesResponse);

      const jiraRepo = new JiraRepo();
      const result = await jiraRepo.getNonLeadComponentsWithIssuesCount();
      const countTable = await jiraRepo.countIssuesForNonEmptyComponents();
      result.forEach(c=>{
        const {id} = c;
        expect(c.issuesCount).to.be.equal(countTable[id])
      })

      nock.cleanAll();

    });
  });

});
