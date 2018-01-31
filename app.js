
// App Dependencies
const express = require('express');
const app = express();
const scraper = require('./scraper');

//========================================================================================
// set app view engine
app.set("view engine", "ejs");
// set the root directory from which to serve static assets
app.use(express.static("public"));

// set the port of our application
// process.env.PORT lets the port be set by server the file is beeing served
let port = process.env.PORT || 3000;

// all scoops array
let scoops = [];

//========================================================================================
// ROUTES
app.get('/', (req, res)=>{
  res.redirect('/scoops');
});

app.get('/scoops', (req, res)=>{
  // scrape rotter scoops
  scraper.rotterScrape('http://rotter.net/forum/listforum.php', 80, (data)=>{
    scoops = data;
    // render scraped data
    res.render('index', {scoops});
  });
});

app.get('/scoops/:id', (req, res)=>{
  let id = req.params.id;
  // scrape 1 scoop by id
  if(!scoops[id]){
    res.redirect('/scoops');
    return;
  }
  scraper.scoopScrape(scoops[id].url, (data)=>{
    let scoop = data;
    scoop.author = scoops[id].author;
    scoop.date = scoops[id].date;
    scoop.hour = scoops[id].hour;
    // render scraped data
    res.render('show', {scoop});
  });
});

//========================================================================================
app.listen(port, ()=>{
  console.log('Server started on PORT' + port);
});
