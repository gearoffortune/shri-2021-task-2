import {User, Commit} from './examples/types'
import {LeadersData} from './examples/stories'
import {getUsersSortByCommits} from './usersSortByCommits.ts'
export function getLeadersData(currentSprintName: string,allUsers: User[], commits: Commit[]): LeadersData {
  return { 
    "title": "Больше всего коммитов",
    "subtitle": currentSprintName,
    "emoji": "👑",
    users: getUsersSortByCommits(allUsers, commits)
  };
}