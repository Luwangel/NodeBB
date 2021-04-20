'use strict';

const db = require('../database');
const plugins = require('../plugins');
const utils = require('../utils');

const intFields = [
	'uid',
	'pid',
	'tid',
	'deleted',
	'timestamp',
	'upvotes',
	'downvotes',
	'deleterUid',
	'edited',
	'replies',
	'bookmarks',
];

module.exports = function (Posts) {
	Posts.getPostsFields = async function (pids, fields) {
		if (!Array.isArray(pids) || !pids.length) {
			return [];
		}
		const keys = pids.map(pid => 'post:' + pid);
		const postData = await (fields.length ?
			db.getObjectsFields(keys, fields) :
			db.getObjects(keys));
		const result = await plugins.hooks.fire('filter:post.getFields', {
			pids: pids,
			posts: postData,
			fields: fields,
		});

		const uniquePostAuthorNames = buildUniquePostAuthorNames(result.posts);

		result.posts.forEach(post => modifyPost(post, fields, uniquePostAuthorNames)
		);
		return Array.isArray(result.posts) ? result.posts : null;
	};

	Posts.getPostData = async function (pid) {
		const posts = await Posts.getPostsFields([pid], []);
		return posts && posts.length ? posts[0] : null;
	};

	Posts.getPostsData = async function (pids) {
		return await Posts.getPostsFields(pids, []);
	};

	Posts.getPostField = async function (pid, field) {
		const post = await Posts.getPostFields(pid, [field]);
		return post ? post[field] : null;
	};

	Posts.getPostFields = async function (pid, fields) {
		const posts = await Posts.getPostsFields([pid], fields);
		return posts ? posts[0] : null;
	};

	Posts.setPostField = async function (pid, field, value) {
		await Posts.setPostFields(pid, { [field]: value });
	};

	Posts.setPostFields = async function (pid, data) {
		await db.setObject('post:' + pid, data);
		plugins.hooks.fire('action:post.setFields', { data: { ...data, pid } });
	};
};

function convertNumberToOrdinal(n) {
	const s = ['th', 'st', 'nd', 'rd'];
	const v = n % 100;
	return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function buildUniquePostAuthorNames(posts) {
	return Array.from(new Set(posts.map(author => author.uid))).reduce(
		(anonymizedAuthors, authorUid, index) => {
			anonymizedAuthors[authorUid] = convertNumberToOrdinal(index + 1);
			return anonymizedAuthors;
		},
		{}
	);
}

function modifyPost(post, fields, authors) {
	if (post) {
		post.secretAuthorName = authors[post.uid];
		console.log(post);
		db.parseIntFields(post, intFields, fields);
		if (post.hasOwnProperty('upvotes') && post.hasOwnProperty('downvotes')) {
			post.votes = post.upvotes - post.downvotes;
		}
		if (post.hasOwnProperty('timestamp')) {
			post.timestampISO = utils.toISOString(post.timestamp);
		}
		if (post.hasOwnProperty('edited')) {
			post.editedISO = post.edited !== 0 ? utils.toISOString(post.edited) : '';
		}
	}
}
