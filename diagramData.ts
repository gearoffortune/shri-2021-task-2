import {Commit, Sprint, Summary} from './examples/types'
import {DiagramData} from './examples/stories'
const Polyglot = require('node-polyglot');

export function getDiagramData(currentSprintName: string, currentCommits: Commit[], previousSprint: Sprint, allCommits: Commit[], allSummaries: Summary[]): DiagramData{
  const polyglot = new Polyglot({ locale: "ru" });
  polyglot.extend({num_commits: "%{smart_count} коммит |||| %{smart_count} коммита |||| %{smart_count} коммитов "})
  polyglot.extend({num_lines: "%{smart_count} строка |||| %{smart_count} строки |||| %{smart_count} строк "})
  const prevCommits = allCommits.filter(entity => previousSprint.startAt <= entity.timestamp && entity.timestamp <= previousSprint.finishAt)
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
  .map(commits => commits.reduce((acc, iter) => acc + 1, 0))
  const prevByAmount = [
    prevCommitsWithLOC.filter(commit => commit.linesOfCode > 1000),
    prevCommitsWithLOC.filter(commit => commit.linesOfCode > 500 && commit.linesOfCode <= 1000),
    prevCommitsWithLOC.filter(commit => commit.linesOfCode > 100 && commit.linesOfCode <= 500),
    prevCommitsWithLOC.filter(commit => commit.linesOfCode > 0 && commit.linesOfCode <= 100),
  ]
  .map(commits => commits.reduce((acc, iter) => acc + 1, 0))

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
    title: "Размер коммитов",
    subtitle: currentSprintName,
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