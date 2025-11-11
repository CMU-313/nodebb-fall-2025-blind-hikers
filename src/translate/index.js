'use strict';

const winston = require('winston');

const translatorApi = module.exports;

const fetchFn = typeof global.fetch === 'function' ? global.fetch.bind(global) : async (...args) => {
	const { default: fetch } = await import('node-fetch');
	return fetch(...args);
};

function getTranslatorBaseUrl() {
	return (process.env.TRANSLATOR_SERVICE_URL || 'http://host.docker.internal:5000/translate/').trim();
}

translatorApi.translate = async function (postData = {}) {
	const content = (postData.content || '').toString();

	// Short-circuit empty posts to avoid unnecessary network calls.
	if (!content.trim()) {
		return [true, content];
	}

	const baseUrl = getTranslatorBaseUrl();

	try {
		const response = await fetchFn(baseUrl, {
			method: 'POST',
			headers: {
				accept: 'application/json',
				'content-type': 'application/json',
			},
			body: JSON.stringify({ content }),
		});

		if (!response.ok) {
			throw new Error(`Unexpected status ${response.status}`);
		}

		const data = await response.json();

		const isEnglish = typeof data.is_english === 'boolean' ? data.is_english : true;
		const translated = typeof data.translated_content === 'string' ? data.translated_content : content;

		return [isEnglish, translated];
	} catch (err) {
		winston.warn(`[translator] Fallback to original content due to error: ${err.message}`);
		return [true, content];
	}
};