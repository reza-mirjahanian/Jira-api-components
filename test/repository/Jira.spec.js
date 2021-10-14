const {
  expect
} = require("chai");

const _ = require('lodash');
const nock = require('nock');
const JiraRepo = require('../../src/repository/Jira');

const {
  URLSearchParams
} = require("url");

const PROJECT_KEY = 'IC';

const mockAllComponentsResponse = require('../testData/allComponents.json');
const mockComponent10103Response = require('../testData/search_components/search_component_10103.json');
const mockComponent10104Response = require('../testData/search_components/search_component_10104.json');
const mockComponent10105Response = require('../testData/search_components/search_component_10105.json');

suite('Testing Jira Repository', () => {

  suite('async getAllNonLeadComponents()', () => {
    test('should return all none components correctly ', async () => {
      const jiraRepo = new JiraRepo();

      const componentsPath = `${jiraRepo.JIRA_API_PATH}/project/IC/components`;
      nock(jiraRepo.JIRA_HOST)
        .get(componentsPath)
        .reply(200, mockAllComponentsResponse); // mock has 1(lead) + 3(non-lead) member.

      const result = await jiraRepo.getAllNonLeadComponents();
      expect(result.length).to.be.equal(3);
      expect(result[1]).to.have.keys('assigneeType', 'description', 'id', 'isAssigneeTypeValid', 'name', 'project', 'projectId', 'realAssigneeType', 'self');
      nock.cleanAll();
    });
  });

  suite('async getNonLeadComponentsWithIssuesCount()', () => {

    test('should return the list of non-lead components along with the number of issues correctly ', async () => {
      const jiraRepo = new JiraRepo();

      const componentsPath = `${jiraRepo.JIRA_API_PATH}/project/IC/components`;
      nock(jiraRepo.JIRA_HOST)
        .get(componentsPath)
        .reply(200, mockAllComponentsResponse);

      const query10105 = `jql=project=${PROJECT_KEY} and component = 10105 &fields=components`;
      const query10104 = `jql=project=${PROJECT_KEY} and component = 10104 &fields=components`;
      const query10103 = `jql=project=${PROJECT_KEY} and component = 10103 &fields=components`;
      const searchPath = `${jiraRepo.JIRA_API_PATH}/search`;
      nock(jiraRepo.JIRA_HOST)
        .get(searchPath)
        .query(new URLSearchParams(query10105))
        .reply(200, mockComponent10105Response)
        .get(searchPath)
        .query(new URLSearchParams(query10104))
        .reply(200, mockComponent10104Response)
        .get(searchPath)
        .query(new URLSearchParams(query10103))
        .reply(200, mockComponent10103Response);


      const result = await jiraRepo.getNonLeadComponentsWithIssuesCount();
      expect(result).to.be.an('array').that.have.lengthOf(3);
      const result10103 = _.find(result, ['id', '10103']);
      const result10104 = _.find(result, ['id', '10104']);
      const result10105 = _.find(result, ['id', '10105']);
      expect(result10103.issuesCount).to.be.equal(mockComponent10103Response.total);
      expect(result10104.issuesCount).to.be.equal(mockComponent10104Response.total);
      expect(result10105.issuesCount).to.be.equal(mockComponent10105Response.total);

      nock.cleanAll();
    });
  });


});
