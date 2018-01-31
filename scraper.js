/**
 * Scraper Dependencies
 * request - for making http request and get HTML back
 * cheerio - for JQuery like functionality, allows scraping the HTML response
 * iconv-lite - for decoding string (hebrew in this scrapper).
 * sanitize-html - for sanitizing 'bad' HTML.
 */
const request = require('request'),
  cheerio = require('cheerio'),
  iconv = require('iconv-lite'),
  sanitizeHtml = require('sanitize-html');

/**
 * Scrape rotter main scoops url and send back the scraped data.
 * @param {string} url - The url of the scoops.
 * @param {function} cb - The callback function to manipulate data.
 */
exports.rotterScrape = (uri, amount, cb) => {

  const requestOptions = {
    encoding: null,
    uri: uri
  };

  // make http request
  request(requestOptions, (err, res, body) => {
    // handle error
    if (err) {
      cb({
        err: err
      });
      return;
    } else {
      // pass HTML document body (from the http request) to cheerio, decoded with iconv for hebrew support
      let $ = cheerio.load(iconv.decode(new Buffer(body), "win1255"), {
        decodeEntities: false
      });
      // array to hold each scoop
      const scoops = [];
      // get all the scoops table
      let $scoopsTable = $('table[dir="rtl"]').find('table').find('table').children().last().first();
      // get rows of the scoops table
      let rows = $scoopsTable.find('tr[bgcolor="#FDFDFD"]');      
      let scoopId = 0;
      // loop rows to extract each scoop
      for (var i = 0; i < amount /*rows.length*/ ; i++) {
        let current = rows[i];
        let iconUrl = $(current).first().find('img').attr('src');
        let title = $(current).find('td[align="right"] b').text();
        if (title) {
          let url = $(current).find('td[align="right"] a').attr('href');
          let hour = $(current).find('.text13b font b').text();
          let date = $(current).find('.text13b font[color="000000"]').text();
          let author = $(current).last().find('font[color="red"]').text();

          // create scoope object
          let scoop = {
            id: scoopId,
            iconUrl: iconUrl,
            title: title,
            url: url,
            hour: hour,
            date: date,
            author: author
          }

          // add scoop to scoops array
          scoops.push(scoop);
          scoopId++;
        }
      }
      // send scoops data back to callback function
      cb(scoops);
    }
  });
};

/**
 * Scrape 1 scoop from rotter by its id, saved upon loading /scoops from app.js.
 * @param {string} uri - The url of the 1 scoop.
 * @param {function} cb - The callback function to manipulate data.
 */
exports.scoopScrape = (uri, cb) => {

  const requestOptions = {
    encoding: null,
    uri: uri
  };
  // make http request
  request(requestOptions, (err, res, body) => {
    if (err) {
      cb({
        err: err
      });
      return;
    } else {
      // pass HTML document body (from the http request) to cheerio, decoded with iconv for hebrew support
      let $ = cheerio.load(iconv.decode(new Buffer(body), 'win1255'), {
        decodeEntities: false
      });
      
      // scoop title
      let title = $('tr[bgcolor="#FDFDFD"] h1').text();
      // scoop content
      let content = $('tr[bgcolor="#FDFDFD"] .text15').html();
      // sanitize scoop content from 'bad' html
      content = sanitizeHtml(content, {
        allowedTags: ['p', 'img'/*, 'br'*/, 'a'],
        allowedAttributes: {
          img: ['src'],
          a: ['href']
        }
      });
      
      // scoop comments objcet
      let comments = [];
      // object that hold the comments table from rotter
      let $comments = $('div[dir="RTL"] > font[color="#000099"] > center > table > tbody').first().find('tr');
      // loop comments to extract each comment data
      for (var i = 1; i < $comments.length ; i++) {
        let current = $comments[i];
        let commentRef = $(current).find('a').attr('href');
        // if a comment reference exist
        if(commentRef){          
          let commentId = commentRef.substr(1); // remove # from href="#..."
                    
          // get comment data
          let $commentTable = $('a[name="'+commentId+'"]').closest('tbody');
          let $commentRow = $commentTable.find('tr[bgcolor="#FDFDFD"]');
          let commentPad = $commentTable.closest('table[bgcolor="#000000"]').closest('tr')
                          .find('img[src="http://rotter.net/forum/Images/blank.gif"]').attr('width');
          let commentAuthor = $('a[name="'+commentId+'"]').text();
          let commentTitle = $commentRow.find('font.text16b').text();          
          let commentTo = $commentRow.find('font[color="#000099"] > a').text();
          let commentContent = $commentRow.find('table font.text15').html();
          // sanitize scoop comment content from 'bad' html
          commentContent = sanitizeHtml(commentContent, {
            allowedTags: ['p', 'img'/*, 'br'*/, 'a'],
            allowedAttributes: {
              img: ['src'],
              a: ['href']
            }
          });
          // create comment object
          let comment = {
            id: commentId,
            author: commentAuthor,
            title: commentTitle,
            to: commentTo.substr(18),
            content: commentContent,
            pad: commentPad ? commentPad : '0'
          }                   
          
          comments.push(comment);
          
        }
      }      
      
      // pass scoope data to callback
      cb({
        title: title,
        content: content,
        comments: comments
      });      
    }
  });
}