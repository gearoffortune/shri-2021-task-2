import { ActivityData } from './examples/stories';
import {Commit, Sprint} from './examples/types'
import {utcToZonedTime} from 'date-fns-tz'

export function getActivityData(currentSprint: Sprint, currentCommits: Commit[]): ActivityData {
  const commitsByDay = [0, 1, 2, 3, 4, 5, 6].map(number => {
    return currentCommits.filter(commit => (utcToZonedTime(new Date(commit.timestamp), 'Europe/Moscow')).getDay() === number)
  })
  const numberOfCommitsByHour = commitsByDay.map(commits => {
    return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23].map(hour => {
      return commits.filter(commit => (utcToZonedTime(new Date(commit.timestamp), 'Europe/Moscow')).getHours() === hour).length
    })
  })
  return {
    title: "Коммиты",
    subtitle: currentSprint.name,
    data: {
      mon: numberOfCommitsByHour[1],
      tue: numberOfCommitsByHour[2],
      wed: numberOfCommitsByHour[3],
      thu: numberOfCommitsByHour[4],
      fri: numberOfCommitsByHour[5],
      sat: numberOfCommitsByHour[6],
      sun: numberOfCommitsByHour[0],
    }
  }
}