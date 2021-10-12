// <nowiki>
/**
 * Workaround for [[phabricator:T2708]] via [[Template:InterProject]].
 * Originally based on code from [[wikt:de:MediaWiki:Common.js]] by
 * [[wikt:de:User:Melancholie]], cleaned up and modified for compatibility
 * with the Vector skin.
 *
 * This script is being used by several Wikimedia Wikis, not only Wikimedia
 * Commons.
 *
 * Maintainers: [[User:Krinkle]], [[User:Ilmari Karonen]]
 */
/* global  mw, $ */
'use strict';
$( function () {
	var interPr;
	// avoid double execution
	if ( document.getElementById( 'p-interproject' ) || !( interPr = document.getElementById( 'interProject' ) ) ) {
		return;
	}

	var sisterPr = document.getElementById( 'sisterProjects' ),
		toolBox = document.getElementById( 'p-tb' ),
		legacyPanel,
		interProject = document.createElement( 'div' );

	if ( !toolBox ) {
		// legacy skins
		var panelIds = [ 'mw-panel', 'panel', 'column-one', 'mw_portlets' ];
		for ( var i = 0; !legacyPanel && i < panelIds.length; i++ ) {
			legacyPanel = document.getElementById( panelIds[ i ] );
		}
		// can't find a place for the portlet, try to undo hiding
		if ( !legacyPanel ) {
			sisterPr.style.display = 'block';
			interPr.style.display = 'block';
			return;
		}
	}

	sisterPr.style.display = 'none';
	interPr.style.display = 'none';

	interProject.id = 'p-interproject';

	interProject.className = ( mw.config.get( 'skin' ) === 'vector' ? 'portal vector-menu-portal' : 'portlet' );

	interProject.innerHTML =
		'<h3>' +
		( sisterPr && sisterPr.firstChild ? sisterPr.firstChild.innerHTML : 'Sister Projects' ) +
		'</h3><div class="' + ( mw.config.get( 'skin' ) === 'vector' ? 'body' : 'pBody' ) + '">' +
		interPr.innerHTML + '</div>';

	if ( legacyPanel ) {
		legacyPanel.appendChild( interProject );
	} else {
		$( toolBox ).after( interProject );
	}
} );
// </nowiki>