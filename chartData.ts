import {User, Commit, Sprint} from './examples/types'
import {ChartData} from './examples/stories'
import {getUsersSortByCommits} from './usersSortByCommits.ts'
export function getChartData(
    allUsers: User[], 
    allCommits: Commit[], 
    currentCommits: Commit[], 
    sprints: Sprint[],
    currentSprint: Sprint,
    ): ChartData {
    return {
      title: "Коммиты",
      subtitle: currentSprint.name,
      values: sprints
      .sort((a, b) => a.id - b.id)
      .map(sprint => {
        const relevantCommits = allCommits.filter(commit => sprint.startAt <= commit.timestamp && commit.timestamp <= sprint.finishAt);
        return sprint.id === currentSprint.id ? {
          title: String(sprint.id),
          value: relevantCommits.length,
          active: true,
          hint: sprint.name
        } : {
          title: String(sprint.id),
          value: relevantCommits.length,
          hint: sprint.name
        }

      }),
      users: getUsersSortByCommits(allUsers, currentCommits)
    }
  }
  
