const json = require('./examples/input.json')


/**
 * @param {import('./examples/types').Entity[]} entities 
 * @param {{sprintId: number}} param1 
 * @returns {import('./examples/stories').StoryData}
 */
function prepareData(entities, {sprintId}) {
  /**
   * @type {import('./examples/types').Sprint[]} sprints
   */
  const sprints = entities.filter(entity => entity.type==='Sprint')
  const currentSprint = sprints.filter(sprint => sprint.id === sprintId)[0];
  
  const relevantToCurrentSprint = entities.filter(entity => {
    if(entity.type==='Comment'){
      return currentSprint.startAt < entity.createdAt && entity.createdAt < currentSprint.finishAt ;
    }
    if(entity.type==='Commit'){
      return currentSprint.startAt < entity.timestamp && entity.timestamp < currentSprint.finishAt ;
    }
  })

  
  /**
   * @type {import('./examples/types').User[]}
   */
  const allUsers = entities.filter(entity => entity.type==='User');

  /**
   * @type {import('./examples/types').Commit[]}
   */
  const commitsFromCurrentSprint = relevantToCurrentSprint.filter(x => x.type==='Commit');
  const usersCommited = getCommitsByUsers(allUsers, commitsFromCurrentSprint)
  console.log(usersCommited)

  
  
  /**
   * @type {import('./examples/types').Comment[]}
   */
  const commentsWithLikes = relevantToCurrentSprint.filter(entity => entity.type==='Comment'&&entity.likes.length > 0)
  const usersLiked = getLikesByUsers(allUsers, commentsWithLikes)
  console.log(usersLiked);


  /**
   * 
   * @param {import('./examples/types').User[]} allUsers 
   * @param {import('./examples/types').Commit[]} commits 
   */
  function getCommitsByUsers(allUsers, commits) {
    return allUsers.map(user => {
      return {
        user, commitSum: commits.reduce((accum, iter) => {
          return iter.author === user || iter.author === user.id ? accum + 1 : accum;
        }, 0)
      };
    });
  }

  /**
   * 
   * @param {import('./examples/types').User[]} allUsers 
   * @param {import('./examples/types').Comment[]} commentsWithLikes 
   * @returns {{user: import('./examples/types').User, likesSum: number}}
   */
  function getLikesByUsers(allUsers, commentsWithLikes) {
    return allUsers.map(user => {
      return { user, likesSum: commentsWithLikes.reduce((accum, iter) => iter.author === user || iter.author === user.id ? accum + iter.likes.length : accum, 0) };
    });
  }
}
prepareData(json, {sprintId: 990});
module.exports = { prepareData }