import path from 'path';

const
  isDevMode = process.env.NODE_ENV !== 'production',
  isTestMode = process.env.NODE_ENV === 'test',
  JIRA_HOST =   process.env.JIRA_JIRA_HOST ||  'https://herocoders.atlassian.net',
  JIRA_API_PATH =   process.env.JIRA_API_PATH ||  '/rest/api',
  JIRA_API_VERSION =   Number(process.env.JIRA_API_VERSION) || 3,
  TEST_DATA_PATH = path.resolve(__dirname, '../testData');

export default {
  TEST_DATA_PATH: process.env.TEST_DATA_PATH || TEST_DATA_PATH,
  TEST_DATA_ONE: process.env.TEST_DATA_ONE || path.resolve(TEST_DATA_PATH, 'commands1.txt'),
  JIRA: {
    JIRA_HOST,
    API: {
      URL: process.env.JIRA_API_URL || `${JIRA_HOST}${JIRA_API_PATH}/${JIRA_API_VERSION}`, // Full url
      PATH: `${JIRA_API_PATH}/${JIRA_API_VERSION}`, // /rest/api/3
      PAGINATION_SIZE: Number(process.env.JIRA_API_PAGINATION_SIZE) || 100,
    },
    COMPONENT_LEAD_LABEL: process.env.COMPONENT_LEAD_LABEL || 'COMPONENT_LEAD',
  }
};
