import {User, Commit} from './examples/types'
import {User as StoryUser} from './examples/stories'
export function getUsersSortByCommits(allUsers: User[], commits: Commit[]): StoryUser[] {
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
    .sort((a, b) => {
      return b.commits - a.commits === 0 ?
      a.id - b.id :
      b.commits - a.commits
    })
    .map(user => { return { 
      id: user.id, 
      name: user.name, 
      avatar: user.avatar, 
      valueText: String(user.commits) 
    }; 
  });
}