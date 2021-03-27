import {User, Comment} from './examples/types'
import {VoteData} from './examples/stories'
const Polyglot = require('node-polyglot')
export function getVoteData(currentSprintName: string, allUsers: User[], commentsWithLikes: Comment[]): VoteData {
  const polyglot = new Polyglot({ locale: "ru" });
  polyglot.extend({num_votes: "%{smart_count} голос |||| %{smart_count} голоса |||| %{smart_count} голосов "})
  return {
    "title": "Самый 🔎 внимательный разработчик",
    "subtitle": currentSprintName,
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
    .sort((a, b) => {
      return b.likes - a.likes === 0 ?
      a.id - b.id :
      b.likes - a.likes
    })
    .map(user => {return {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      valueText: polyglot.t('num_votes', user.likes)
    }
  })
  }
}