import { ActivityData } from './examples/stories';
import {Commit, Sprint} from './examples/types'

export function getActivityData(currentSprint: Sprint, currentCommits: Commit[]): ActivityData {
  const commitsByDay = [0, 1, 2, 3, 4, 5, 6].map(number => {
    return currentCommits.filter(commit => (new Date(commit.timestamp)).getUTCDay() === number)
  })
  const numberOfCommitsByHour = commitsByDay.map(commits => {
    return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23].map(hour => {
      return commits.filter(commit => (new Date(commit.timestamp)).getUTCHours() === hour).length
    })
  })
  return {
    title: "Коммиты, 1 неделя",
    subtitle: currentSprint.name,
    data: {
      mon: numberOfCommitsByHour[0],
      tue: numberOfCommitsByHour[1],
      wed: numberOfCommitsByHour[2],
      thu: numberOfCommitsByHour[3],
      fri: numberOfCommitsByHour[4],
      sat: numberOfCommitsByHour[5],
      sun: numberOfCommitsByHour[6],
    }
  }
}