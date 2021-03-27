import { ActivityData, ChartData, DiagramData, LeadersData, StoryData, VoteData, User as StoryUser } from './examples/stories';
import {Commit, Entity, Sprint, User, Comment, SprintId, Summary} from './examples/types'
//@ts-ignore
import {getActivityData} from './activityData.ts'
const Polyglot = require('node-polyglot')
// const json = require('./examples/input.json') as Entity[];


function prepareData(entities: Entity[], {sprintId}: {sprintId: SprintId}): StoryData {
  const sprints = entities.filter(entity => entity.type==='Sprint') as Sprint[];
  const currentSprint = sprints.filter(sprint => sprint.id === sprintId)[0];
  const previousSprint = sprints.filter(sprint => sprint.id === sprintId - 1)[0];
  
  const relevantToCurrentSprint = entities.filter(entity => {
    if(entity.type==='Comment'){
      return currentSprint.startAt < entity.createdAt && entity.createdAt < currentSprint.finishAt ;
    }
    if(entity.type==='Commit'){
      return currentSprint.startAt < entity.timestamp && entity.timestamp < currentSprint.finishAt ;
    }
  })
  const allSummaries = entities.filter(entity => entity.type === 'Summary') as Summary[];
  const allUsers = entities.filter(entity => entity.type==='User') as User[];
  const allCommits = entities.filter(entity => entity.type==='Commit') as Commit[];

  const commitsFromCurrentSprint = relevantToCurrentSprint.filter(x => x.type==='Commit') as Commit[];
  const leadersData = getLeadersData(allUsers, commitsFromCurrentSprint)

  
  const commentsWithLikes = relevantToCurrentSprint.filter(entity => entity.type==='Comment'&&entity.likes.length > 0) as Comment[];
  const usersLiked = getLikesByUsers(allUsers, commentsWithLikes)
  const chartData = getCommitsInASprint(allUsers, allCommits, commitsFromCurrentSprint, sprints, currentSprint)
  const polyglot = new Polyglot({ locale: "ru" });
  const diagramData = getDiagramData(commitsFromCurrentSprint, currentSprint, previousSprint);
  const activityData = getActivityData(currentSprint, commitsFromCurrentSprint);
  return [
    {alias: 'leaders', data: leadersData},
    {alias: 'vote', data: usersLiked},
    {alias: 'chart', data: chartData},
    {alias: 'diagram', data: diagramData},
    {alias: 'activity', data: activityData}
  ]
  function getDiagramData(currentCommits: Commit[], currentSprint: Sprint, previousSprint: Sprint): DiagramData{
    polyglot.extend({num_commits: "%{smart_count} коммит |||| %{smart_count} коммита |||| %{smart_count} коммитов "})
    polyglot.extend({num_lines: "%{smart_count} строка |||| %{smart_count} строки |||| %{smart_count} строк "})
    const prevCommits = entities.filter(entity => entity.type === 'Commit' && previousSprint.startAt < entity.timestamp && entity.timestamp < previousSprint.finishAt) as Commit[]
    const currentCommitsWithLOC = currentCommits.map((commit) => {
      return {
        linesOfCode: commit.summaries.reduce((acc: number, summary) => {
          if (typeof summary === 'number') {
            const s = allSummaries.find(s => s.id === summary)
            return acc + s.removed + s.added;
          } else {
            return acc + summary.removed + summary.added
          }
        }, 0) as number,
        ...commit
      }
    })
    const prevCommitsWithLOC = prevCommits.map((commit) => {
      return {
        linesOfCode: commit.summaries.reduce((acc: number, summary) => {
          if (typeof summary === 'number') {
            const s = allSummaries.find(s => s.id === summary)
            return acc + s.removed + s.added;
          } else {
            return acc + summary.removed + summary.added
          }
        }, 0) as number,
        ...commit
      }
    })
    const diff = currentCommits.length - prevCommits.length
    /**
     * 
     */
    const currentByAmount = [
      currentCommitsWithLOC.filter(commit => commit.linesOfCode > 1000),
      currentCommitsWithLOC.filter(commit => commit.linesOfCode > 500 && commit.linesOfCode <= 1000),
      currentCommitsWithLOC.filter(commit => commit.linesOfCode > 100 && commit.linesOfCode <= 500),
      currentCommitsWithLOC.filter(commit => commit.linesOfCode > 0 && commit.linesOfCode <= 100),
    ]
    .map(commits => commits.reduce((acc, iter) => acc + iter.linesOfCode, 0))
    const prevByAmount = [
      prevCommitsWithLOC.filter(commit => commit.linesOfCode > 1000),
      prevCommitsWithLOC.filter(commit => commit.linesOfCode > 500 && commit.linesOfCode <= 1000),
      prevCommitsWithLOC.filter(commit => commit.linesOfCode > 100 && commit.linesOfCode <= 500),
      prevCommitsWithLOC.filter(commit => commit.linesOfCode > 0 && commit.linesOfCode <= 100),
    ]
    .map(commits => commits.reduce((acc, iter) => acc + iter.linesOfCode, 0))

    function getDifferenceText(a:number, b: number): string {
      const difference = a - b;
      if(difference > 0){
        return '+' + polyglot.t('num_commits', difference)
      }
      if(difference < 0){
        return '-' + polyglot.t('num_commits', -difference)
      }
      return polyglot.t('num_commits', difference)
    }

    return {
      title: "Размер Коммитов",
      subtitle: currentSprint.name,
      totalText: `${polyglot.t('num_commits', currentCommits.length)}`,
      differenceText: `${
        diff > 0 ? `+${diff} с прошлого спринта` : `${diff} с прошлого спринта`
      }`,
      categories: [
        {
          title: '> 1001 строки',
          valueText: polyglot.t('num_commits', currentByAmount[0]),
          differenceText: getDifferenceText(currentByAmount[0], prevByAmount[0])
        },

        {
          title: '501 — 1000 строк',
          valueText: polyglot.t('num_commits', currentByAmount[1]),
          differenceText: getDifferenceText(currentByAmount[1], prevByAmount[1])
        },

        {
          title: '101 — 500 строк',
          valueText: polyglot.t('num_commits', currentByAmount[2]),
          differenceText: getDifferenceText(currentByAmount[2], prevByAmount[2])
        },

        {
          title: '1 — 100 строк',
          valueText: polyglot.t('num_commits', currentByAmount[3]),
          differenceText: getDifferenceText(currentByAmount[3], prevByAmount[3])
        },

      ]
    }
  }

  function getLeadersData(allUsers: User[], commits: Commit[]): LeadersData {
    return { 
      "title": "Больше всего коммитов",
      "subtitle": currentSprint.name,
      "emoji": "👑",
      users: getUsersSortByCommits(allUsers, commits)
    };
  }

  function getCommitsInASprint(
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
      .sort((a, b) => b.id - a.id)
      .map(sprint => {
        const relevantCommits = allCommits.filter(commit => sprint.startAt < commit.timestamp && commit.timestamp < sprint.finishAt);
        return {
          title: String(sprint.id),
          value: relevantCommits.length,
          active: sprint.id === currentSprint.id ? true : undefined,
        }
      }),
      users: getUsersSortByCommits(allUsers, currentCommits)
    }
  }
  
  function getUsersSortByCommits(allUsers: User[], commits: Commit[]): StoryUser[] {
    return allUsers.map(user => {
      return {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        commits: commits.reduce((accum, iter) => {
          return iter.author === user || iter.author === user.id ? accum + 1 : accum;
        }, 0)
      };
    })
      .sort((a, b) => b.commits - a.commits)
      .map(user => { return { 
        id: user.id, 
        name: user.name, 
        avatar: user.avatar, 
        valueText: String(user.commits) 
      }; 
    });
  }

  function getLikesByUsers(allUsers: User[], commentsWithLikes: Comment[]): VoteData {
    return {
      "title": "Самый 🔎 внимательный разработчик",
      "subtitle": currentSprint.name,
      "emoji": "🔎",
      users: allUsers.map(user => {
      return { 
         id: user.id,
         name: user.name, 
         avatar: user.avatar, 
         likes: commentsWithLikes.reduce((accum, iter) =>{ 
           return iter.author === user || iter.author === user.id ? accum + iter.likes.length : accum 
          }, 0) };
      })
      .sort((a, b) => b.likes - a.likes)
      .map(user => {return {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        valueText: String(user.likes)
      }
    })
    }
  }
}
// console.log(JSON.stringify(prepareData(json, {sprintId: 990})));
module.exports = { prepareData }