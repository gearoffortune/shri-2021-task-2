import { StoryData } from './examples/stories';
import {Commit, Entity, Sprint, User, Comment, SprintId, Summary} from './examples/types'
import {getActivityData} from './activityData.ts'
import {getDiagramData} from './diagramData.ts'
import {getLeadersData} from './leadersData.ts'
import {getChartData} from './chartData.ts'
import {getVoteData} from './voteData.ts'


export function prepareData(entities: Entity[], {sprintId}: {sprintId: SprintId}): StoryData {
  const sprints = entities.filter(entity => entity.type==='Sprint') as Sprint[];
  const currentSprint = sprints.filter(sprint => sprint.id === sprintId)[0];
  const previousSprint = sprints.filter(sprint => sprint.id === sprintId - 1)[0];
  
  const relevantToCurrentSprint = entities.filter(entity => {
    if(entity.type==='Comment'){
      return currentSprint.startAt <= entity.createdAt && entity.createdAt <= currentSprint.finishAt ;
    }
    if(entity.type==='Commit'){
      return currentSprint.startAt <= entity.timestamp && entity.timestamp <= currentSprint.finishAt ;
    }
  })
  const allSummaries = entities.filter(entity => entity.type === 'Summary') as Summary[];
  const allUsers = entities.filter(entity => entity.type==='User') as User[];
  const allCommits = entities.filter(entity => entity.type==='Commit') as Commit[];

  const commitsFromCurrentSprint = relevantToCurrentSprint.filter(x => x.type==='Commit') as Commit[];
  const leadersData = getLeadersData(currentSprint.name, allUsers, commitsFromCurrentSprint)

  
  const commentsWithLikes = relevantToCurrentSprint.filter(entity => entity.type==='Comment'&&entity.likes.length > 0) as Comment[];
  const voteData = getVoteData(currentSprint.name, allUsers, commentsWithLikes)
  const chartData = getChartData(allUsers, allCommits, commitsFromCurrentSprint, sprints, currentSprint)
  const diagramData = getDiagramData(currentSprint.name,commitsFromCurrentSprint, previousSprint, allCommits, allSummaries);
  const activityData = getActivityData(currentSprint, commitsFromCurrentSprint);
  return [
    {alias: 'leaders', data: leadersData},
    {alias: 'vote', data: voteData},
    {alias: 'chart', data: chartData},
    {alias: 'diagram', data: diagramData},
    {alias: 'activity', data: activityData}
  ]
}
module.exports = { prepareData }