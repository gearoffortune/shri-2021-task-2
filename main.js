"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var activityData_ts_1 = require("./activityData.ts");
var Polyglot = require('node-polyglot');
function prepareData(entities, _a) {
    var sprintId = _a.sprintId;
    var sprints = entities.filter(function (entity) { return entity.type === 'Sprint'; });
    var currentSprint = sprints.filter(function (sprint) { return sprint.id === sprintId; })[0];
    var previousSprint = sprints.filter(function (sprint) { return sprint.id === sprintId - 1; })[0];
    var relevantToCurrentSprint = entities.filter(function (entity) {
        if (entity.type === 'Comment') {
            return currentSprint.startAt < entity.createdAt && entity.createdAt < currentSprint.finishAt;
        }
        if (entity.type === 'Commit') {
            return currentSprint.startAt < entity.timestamp && entity.timestamp < currentSprint.finishAt;
        }
    });
    var allSummaries = entities.filter(function (entity) { return entity.type === 'Summary'; });
    var allUsers = entities.filter(function (entity) { return entity.type === 'User'; });
    var allCommits = entities.filter(function (entity) { return entity.type === 'Commit'; });
    var commitsFromCurrentSprint = relevantToCurrentSprint.filter(function (x) { return x.type === 'Commit'; });
    var leadersData = getLeadersData(allUsers, commitsFromCurrentSprint);
    var commentsWithLikes = relevantToCurrentSprint.filter(function (entity) { return entity.type === 'Comment' && entity.likes.length > 0; });
    var usersLiked = getLikesByUsers(allUsers, commentsWithLikes);
    var chartData = getCommitsInASprint(allUsers, allCommits, commitsFromCurrentSprint, sprints, currentSprint);
    var polyglot = new Polyglot({ locale: "ru" });
    var diagramData = getDiagramData(commitsFromCurrentSprint, currentSprint, previousSprint);
    var activityData = activityData_ts_1.getActivityData(currentSprint, commitsFromCurrentSprint);
    return [
        { alias: 'leaders', data: leadersData },
        { alias: 'vote', data: usersLiked },
        { alias: 'chart', data: chartData },
        { alias: 'diagram', data: diagramData },
        { alias: 'activity', data: activityData }
    ];
    function getDiagramData(currentCommits, currentSprint, previousSprint) {
        polyglot.extend({ num_commits: "%{smart_count} коммит |||| %{smart_count} коммита |||| %{smart_count} коммитов " });
        polyglot.extend({ num_lines: "%{smart_count} строка |||| %{smart_count} строки |||| %{smart_count} строк " });
        var prevCommits = entities.filter(function (entity) { return entity.type === 'Commit' && previousSprint.startAt < entity.timestamp && entity.timestamp < previousSprint.finishAt; });
        var currentCommitsWithLOC = currentCommits.map(function (commit) {
            return __assign({ linesOfCode: commit.summaries.reduce(function (acc, summary) {
                    if (typeof summary === 'number') {
                        var s = allSummaries.find(function (s) { return s.id === summary; });
                        return acc + s.removed + s.added;
                    }
                    else {
                        return acc + summary.removed + summary.added;
                    }
                }, 0) }, commit);
        });
        var prevCommitsWithLOC = prevCommits.map(function (commit) {
            return __assign({ linesOfCode: commit.summaries.reduce(function (acc, summary) {
                    if (typeof summary === 'number') {
                        var s = allSummaries.find(function (s) { return s.id === summary; });
                        return acc + s.removed + s.added;
                    }
                    else {
                        return acc + summary.removed + summary.added;
                    }
                }, 0) }, commit);
        });
        var diff = currentCommits.length - prevCommits.length;
        var currentByAmount = [
            currentCommitsWithLOC.filter(function (commit) { return commit.linesOfCode > 1000; }),
            currentCommitsWithLOC.filter(function (commit) { return commit.linesOfCode > 500 && commit.linesOfCode <= 1000; }),
            currentCommitsWithLOC.filter(function (commit) { return commit.linesOfCode > 100 && commit.linesOfCode <= 500; }),
            currentCommitsWithLOC.filter(function (commit) { return commit.linesOfCode > 0 && commit.linesOfCode <= 100; }),
        ]
            .map(function (commits) { return commits.reduce(function (acc, iter) { return acc + iter.linesOfCode; }, 0); });
        var prevByAmount = [
            prevCommitsWithLOC.filter(function (commit) { return commit.linesOfCode > 1000; }),
            prevCommitsWithLOC.filter(function (commit) { return commit.linesOfCode > 500 && commit.linesOfCode <= 1000; }),
            prevCommitsWithLOC.filter(function (commit) { return commit.linesOfCode > 100 && commit.linesOfCode <= 500; }),
            prevCommitsWithLOC.filter(function (commit) { return commit.linesOfCode > 0 && commit.linesOfCode <= 100; }),
        ]
            .map(function (commits) { return commits.reduce(function (acc, iter) { return acc + iter.linesOfCode; }, 0); });
        function getDifferenceText(a, b) {
            var difference = a - b;
            if (difference > 0) {
                return '+' + polyglot.t('num_commits', difference);
            }
            if (difference < 0) {
                return '-' + polyglot.t('num_commits', -difference);
            }
            return polyglot.t('num_commits', difference);
        }
        return {
            title: "Размер Коммитов",
            subtitle: "\u0421\u043F\u0440\u0438\u043D\u0442 \u2116 " + currentSprint.id,
            totalText: "" + polyglot.t('num_commits', currentCommits.length),
            differenceText: "" + (diff > 0 ? "+" + diff + " \u0441 \u043F\u0440\u043E\u0448\u043B\u043E\u0433\u043E \u0441\u043F\u0440\u0438\u043D\u0442\u0430" : diff + " \u0441 \u043F\u0440\u043E\u0448\u043B\u043E\u0433\u043E \u0441\u043F\u0440\u0438\u043D\u0442\u0430"),
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
        };
    }
    function getLeadersData(allUsers, commits) {
        return {
            "title": "Больше всего коммитов",
            "subtitle": currentSprint.name,
            "emoji": "👑",
            users: getUsersSortByCommits(allUsers, commits)
        };
    }
    function getCommitsInASprint(allUsers, allCommits, currentCommits, sprints, currentSprint) {
        return {
            title: "Коммиты",
            subtitle: currentSprint.name,
            values: sprints.map(function (sprint) {
                var relevantCommits = allCommits.filter(function (commit) { return sprint.startAt < commit.timestamp && commit.timestamp < sprint.finishAt; });
                return {
                    title: String(sprint.id),
                    value: relevantCommits.length,
                    active: sprint.id === currentSprint.id ? true : undefined
                };
            }),
            users: getUsersSortByCommits(allUsers, currentCommits)
        };
    }
    function getUsersSortByCommits(allUsers, commits) {
        return allUsers.map(function (user) {
            return {
                id: user.id,
                name: user.name,
                avatar: user.avatar,
                commits: commits.reduce(function (accum, iter) {
                    return iter.author === user || iter.author === user.id ? accum + 1 : accum;
                }, 0)
            };
        })
            .sort(function (a, b) { return b.commits - a.commits; })
            .map(function (user) {
            return {
                id: user.id,
                name: user.name,
                avatar: user.avatar,
                valueText: String(user.commits)
            };
        });
    }
    function getLikesByUsers(allUsers, commentsWithLikes) {
        return {
            "title": "Самый 🔎 внимательный разработчик",
            "subtitle": currentSprint.name,
            "emoji": "🔎",
            users: allUsers.map(function (user) {
                return {
                    id: user.id,
                    name: user.name,
                    avatar: user.avatar,
                    likes: commentsWithLikes.reduce(function (accum, iter) {
                        return iter.author === user || iter.author === user.id ? accum + iter.likes.length : accum;
                    }, 0)
                };
            })
                .sort(function (a, b) { return b.likes - a.likes; })
                .map(function (user) {
                return {
                    id: user.id,
                    name: user.name,
                    avatar: user.avatar,
                    valueText: String(user.likes)
                };
            })
        };
    }
}
module.exports = { prepareData: prepareData };
