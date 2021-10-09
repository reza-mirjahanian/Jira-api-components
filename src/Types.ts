export interface ComponentNonLead {
    self: string,
    id: string,
    name: string,
    description: string,
    assigneeType: 'PROJECT_DEFAULT' | 'COMPONENT_LEAD',
    realAssigneeType: string,
    isAssigneeTypeValid: boolean,
    project: string,
    projectId: number,
    assignee: {}
}

export interface Component extends ComponentNonLead {
    lead: [],
}

export interface ComponentWithIssueCount extends ComponentNonLead {
    issuesCount: number
}

export interface IssuesSearch {
    expand: string,
    startAt: number,
    maxResults: number,
    total: number,
    issues: [{
        expand: string,
        id: string,
        self: string,
        key: string,
        fields: {
            components: [
                [{
                    self: string,
                    id: string,
                    name: string,
                    description: string
                }]
            ]
        }
    }]
}

export interface IPrint {
    print(data: ComponentWithIssueCount[]): Promise<void>;
}
