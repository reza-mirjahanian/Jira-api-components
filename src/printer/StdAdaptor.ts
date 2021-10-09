import {ComponentWithIssueCount, IPrint} from "../Types";

import _ from "lodash";
import {table} from "table";

export default class StdAdaptor implements IPrint{

    //Why async? For handling the IO write.
    async print(data: ComponentWithIssueCount[]) {
        data.forEach((item, index)=>{
            const tmp = [];
            tmp.push(['Item Index', (index +1).toLocaleString() ]);
            tmp.push(['Component Name', _.get(item,'name','_')]);
            tmp.push(['Component Id', Number(_.get(item,'id','_')).toLocaleString()]);
            tmp.push(['Issues Count', Number(_.get(item,'issuesCount','_')).toLocaleString()]);
            tmp.push(['Project Id', Number(_.get(item,'projectId','_')).toLocaleString()]);
            tmp.push(['Project', _.get(item,'project','_')]);
            tmp.push(['Description', _.get(item,'description','_')]);
            tmp.push(['Assignee Type', _.get(item,'assigneeType','_')]);
            tmp.push(['Real Assignee Type', _.get(item,'realAssigneeType','_')]);
            tmp.push(['Is Assignee Type Valid', _.get(item,'isAssigneeTypeValid','_')]);
            tmp.push(['Self', _.get(item,'self','_')]);
            console.log(table(tmp));
        });
    }
}
