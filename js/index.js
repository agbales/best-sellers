var nytimesKey = config.NYT_KEY;
var googleBooksKey = config.GOOGLE_BOOKS_KEY;

fetch('https://api.nytimes.com/svc/books/v3/lists.json?list-name=hardcover-fiction&api-key=' + nytimesKey, {
    method: 'get',
  })
  .then(response => { return response.json(); })
  .then(json => { 
    updateBestSellers(json); 
    console.log(json);
  })
  .catch(error => {
    console.log('NYT API Error: Defaulting to nytimes archival data.');
    updateBestSellers(nytimesArchive);
  });

function updateBestSellers(nytimesBestSellers) {
  nytimesBestSellers.results.forEach(function(book) {
    var isbn = book.isbns[1].isbn10;
    var bookInfo = book.book_details[0];
    var lastWeekRank = book.rank_last_week || 'n/a';
    var weeksOnList = book.weeks_on_list || 'New this week!';
    var listing = 
        '<div id="' + book.rank + '" class="entry">' + 
          '<p>' + 
          '<img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/387928/book%20placeholder.png" class="book-cover" id="cover-' + book.rank + '">' + 
          '</p>' + 
          '<h2><a href="' + book.amazon_product_url + '" target="_blank">' + bookInfo.title + '</a></h2>' +
          '<h4>By ' + bookInfo.author + '</h4>' +
          '<h4 class="publisher">' + bookInfo.publisher + '</h4>' +
          '<p>' + bookInfo.description + '</p>' + 
          '<div class="stats">' +
            '<hr>' + 
            '<p>Last Week: ' + lastWeekRank + '</p>' + 
            '<p>Weeks on list: ' + weeksOnList + '</p>' +
          '</div>' +
        '</div>';

    $('#best-seller-titles').append(listing);
    $('#' + book.rank).attr('nyt-rank', book.rank);

    updateCover(book.rank, isbn);
  });
}

function updateCover(id, isbn) {
  fetch('https://www.googleapis.com/books/v1/volumes?q=isbn:' + isbn + "&key=" + googleBooksKey, {
    method: 'get'
  })
  .then(response => { return response.json(); })
  .then(data => {
    var img = data.items[0].volumeInfo.imageLinks.thumbnail;
    img = img.replace(/^http:\/\//i, 'https://');
    $('#cover-' + id).attr('src', img);
  })
  .catch(error => {
    console.log(error);
    console.log('Googel API Error: Defaulting to archival images for book #' + id + ' ISBN: ' + isbn);
    var index = id - 1;
    var img = archivedImages[index];
    $('#cover-' + id).attr('src', img);
  });
}

$(window).scroll(function (event) {
    var scroll = $(window).scrollTop();
    if (scroll > 50) {
      $('#masthead').css({'height':'50', 'padding' : '8'})
      $('#nyt-logo').css({'height':'35'})
    } else {
      $('#masthead').css({'height':'100', 'padding':'10'});
      $('#nyt-logo').css({'height':'80'})
    }
});