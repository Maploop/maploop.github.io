(function () { // Yes I know this is overengineered. I do not care. It was fun to make.
    'use strict';

    var CONTENT_URL = '/ARCHIVE/langs/english.xml';

    document.addEventListener('DOMContentLoaded', function () {
        fetch(CONTENT_URL)
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('Could not load ' + CONTENT_URL + ' (status ' + response.status + ')');
                }
                return response.text();
            })
            .then(function (xmlText) {
                var parser = new DOMParser();
                var xmlDoc = parser.parseFromString(xmlText, 'application/xml');

                var parserError = xmlDoc.querySelector('parsererror');
                if (parserError) {
                    throw new Error('Failed to parse ' + CONTENT_URL + ': ' + parserError.textContent);
                }

                applyContent(xmlDoc.documentElement);
            })
            .catch(function (err) {
                console.error('content-loader: ', err);
            });
    });

    function applyContent(xmlNode) {
        var children = xmlNode.children;

        for (var i = 0; i < children.length; i++) {
            var child = children[i];

            if (child.children.length === 0) {
                injectContent(child);
            } else {
                applyContent(child);
            }
        }
    }

    function injectContent(xmlNode) {
        var id = xmlNode.tagName;
        var target = document.getElementById(id);

        if (!target) {
            console.warn('content-loader: no element with id="' + id + '" found for <' + id + '> in content.xml');
            return;
        }

        var content = (xmlNode.textContent || '').trim();
        target.innerHTML = content;
    }
})();