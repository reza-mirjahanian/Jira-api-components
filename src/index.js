const print = require('./utils/print')
const JiraRepo = require('./repository/Jira');

const test = async () => {
  const jiraRepo = new JiraRepo();
  const data = await jiraRepo.getNonLeadComponentsWithIssuesCount();
  print(data);
};

test().catch((error) => {
  console.error(error, {
    message: 'Error in running test()'
  });
}).finally(() => {
  process.exit();
});
