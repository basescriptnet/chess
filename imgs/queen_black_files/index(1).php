/**
* Ajax Translations
*
* Translates layout templates (licenses templates)
* See talk page for documentation.
*
* Maintainers: [[User:ערן]], ([[User:Ilmari Karonen]], [[User:DieBuche]])
* Last update: 2019-09-16
*/
// Avoid post-save expansion: <nowiki>
/* global mw:false, $:false */
/* eslint indent:[error,tab,{outerIIFEBody:0}] */
/* jshint curly:false, browser:true */
(function () {
'use strict';

var langLinkRgx;
var AT = {
	state: 'Waiting for DOM-ready',

	/**
	 * Add click handler to all language links in a given chunk of document,
	 * or in the whole document.
	 *
	 * @param {jQuery|null} $content A jQuery object to add handlers to descendants of,
	 *  or null if in the whole document
	 */
	updateLangLinks: function ($content) {
		if (window.disableAjaxTranslation || !$content) return;
		// Initialized here because it uses mw.RegExp, which is not available initially
		langLinkRgx = new RegExp(
			'(' + mw.util.escapeRegExp(mw.config.get('wgServer')) +
			'|)' + mw.util.escapeRegExp(mw.config.get('wgArticlePath'))
				.replace('\\$1', '(Template:.*/[a-z]{2,3}(-[a-z]+)?)') + '$'
		);

		if (AT.state !== 'Ready') {
			$content.find('div.layouttemplate a, table.layouttemplate a').each(function (i, el) {
				// If not translation link, skip it
				if (langLinkRgx.test(el.href)) {
					$(el).one('click', AT.loadAjaxTranslation);
				}
				AT.state = 'Ready';
			});
		}
	},

	/**
	 * Click handler.
	 *
	 * @param {jQuery.Event} e
	 */
	loadAjaxTranslation: function (e) {
		var tmpParts,
			tmpArgs = '',
			linkEl = e.target,
			tmpName = linkEl.href;

		if (!tmpName) return;

		tmpName = langLinkRgx.exec(tmpName);
		if (tmpName) tmpName = decodeURI(tmpName[2]);

		tmpParts = /^Template:(.*)\/([a-z]{2,3}(-[a-z]+)?)$/.exec(tmpName);

		if (!tmpParts || !tmpParts.length) return;

		e.preventDefault();

		AT.lastLayoutTemplate = $(linkEl).parents('.layouttemplate');

		// Try to find encoded template args, if supplied (EXPERIMENTAL)
		AT.lastLayoutTemplate.find('.layouttemplateargs').each(function () {
			var args = this.title.split(/\s+/);
			args.shift();
			$.each(args, function (key, val) {
				if (!/\S/.test(val)) return true;
				tmpArgs += '|' + decodeURIComponent(val.replace(/\+/g, ' ')).replace(/\|/g, '{{!}}');
			});
		});

		// {{urlencode:}} turns parser extension tags into garbage; we can't undo it, so we just give up if that's happened
		if (/\x7FUNIQ/.test(tmpArgs)) tmpArgs = '';

		$.ajax({
			url: mw.util.wikiScript('api'),
			type: 'POST',
			data: {
				format: 'json',
				action: 'parse',
				prop: 'text',
				text: '{{' + tmpName + tmpArgs + '}}',
				title: mw.config.get('wgPageName'),
				uselang: tmpParts[2]
			},
			dataType: 'json',
			success: function (res, s) {
				if (res && (res = res.parse) && (res = res.text['*'])) {
					try {
						res = $.parseHTML(res)[0];
					} catch (e) {
						return;
					}
					res = $(res).find('.layouttemplate').unwrap();
					// Don't insert false content
					if (!res[0]) return AT.lastLayoutTemplate.prevObject.get(0).click();
					// Create parsing container
					s = AT.lastLayoutTemplate.wrap('<div>').parent();
					AT.lastLayoutTemplate.replaceWith(res);
					s = s.children(':first').unwrap();
					s.find('.translatedTag').hide();
					mw.hook('wikipage.content').fire(s); // AT.updateLangLinks(mw.util.$content);
				}
			}
		});
	}
};

if (mw.libs.AjaxTranslations) return;

mw.loader.using(['mediawiki.util'], function () {
	mw.hook('wikipage.content').add(AT.updateLangLinks);
});

mw.libs.AjaxTranslations = AT;

}());
// </nowiki>