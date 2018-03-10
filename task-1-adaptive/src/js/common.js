/* global data */

'use strict';

(function () {
  const cardTmpl = document.querySelector('#card').innerHTML;
  const postsElem = document.querySelector('.posts');
  const postsItems = [];
  const titleMax = {
    's': 85,
    'm': 90,
    'l': 35
  };

  data.forEach(item => {
    // Break image url to parts
    if (item.image) {
      const pathArr = item.image.split('/');
      const fullName = pathArr[pathArr.length - 1];
      const fullNameArr = fullName.split('.');
      const name = fullNameArr[0];
      const ext = fullNameArr[1];
      const pathToFolder = pathArr.slice(0, pathArr.length - 1).join('/');

      item.image = {
        src: item.image,
        pathToFolder: pathToFolder,
        name: name,
        ext: ext,
        toString: () => {
          return item.image.src;
        }
      };
    }

    // Cut title
    if (item.title) {
      const titleMaxForSize = titleMax[item.size];
      item.title = cutText(item.title, titleMaxForSize);
    }

    // \n to <br>
    if (item.description) {
      item.description = item.description.replace(/\n/g, '<br>');
    }

    // Check display conditions
    const tmplHtml = cardTmpl.replace(/{{#([^#]{0,}{{\/[^}]*}})/g, (match, contentSrc) => {
      let result = '';
      const itemToCheck = contentSrc.match(/\S{1,}/)[0];

      // If content exist in data
      if (item[itemToCheck]) {
        // Take & return meaningful part
        const content = contentSrc.match(/}}([^]{0,}){{\//)[1];
        result = content;
      }
      return result;
    });

    // Fill template with data
    const replacements = tmplHtml.replace(/{{([^{]*)}}/g, (match, content) => {
      content = content.replace(/\s/g, '');
      let result = '';

      // For example: img.name
      if (content.indexOf('.') >= 0) {
        const parts = content.split('.');
        result = parts.reduce((prev, current) => {
          return prev[current];
        }, item);
      } else {
        result = item[content] ? item[content] : '';
      }
      return result;
    });

    postsItems.push(replacements);
  });

  // ------------------------------

  function cutText (str, maxLength) {
    const titleArr = str.split(' ');
    let result = str;

    if (str.length > maxLength) {
      let isCutted = false;
      let titleCutted = titleArr.reduce((prev, current) => {
        if (prev.length + current.length <= maxLength &&
          isCutted === false) {
          prev += ` ${current}`;
        } else {
          isCutted = true;
        }
        return prev;
      }, '');

      titleCutted += '&hellip;';
      result = titleCutted;
    }

    return result;
  }

  postsElem.innerHTML = postsItems.join('');
})();
