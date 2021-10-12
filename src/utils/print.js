const _ = require("lodash");
const {
  table
} = require("table");

module.exports = (data = []) => {
  data.forEach((item, index) => {
    const tmp = [];
    tmp.push(['Item Index', (index + 1).toLocaleString()]);
    tmp.push(['Component Name', _.get(item, 'name', '_')]);
    tmp.push(['Component Id', _.get(item, 'id', '_')]);
    tmp.push(['Issues Count', _.get(item, 'issuesCount', '_')]);
    tmp.push(['Project Id', _.get(item, 'projectId', '_')]);
    tmp.push(['Project', _.get(item, 'project', '_')]);
    tmp.push(['Description', _.get(item, 'description', '_')]);
    tmp.push(['Assignee Type', _.get(item, 'assigneeType', '_')]);
    tmp.push(['Real Assignee Type', _.get(item, 'realAssigneeType', '_')]);
    tmp.push(['Is Assignee Type Valid', _.get(item, 'isAssigneeTypeValid', '_')]);
    tmp.push(['Self', _.get(item, 'self', '_')]);
    console.log(table(tmp));
  });
}
