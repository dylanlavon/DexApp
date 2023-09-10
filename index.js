// Set up requirements
const pokemon = require('pokemontcgsdk');
const express = require('express');
const bodyParser = require('body-parser'); // Require the body-parser middleware
const app = express();
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'));

const API_KEY = '9926f1ab-1b23-4897-9311-c7266b6ca406'
const PORT = 3000

pokemon.configure({apiKey: API_KEY})
app.set('view engine', 'ejs')

// Parse URL-encoded form data
app.use(bodyParser.urlencoded({ extended: false }));

// Initial data collection
let setNumMap = {}
pokemon.set.all()
    .then(sets => {
    const setsArray = sets.map(set => set.id);
    
    let numSetsComplete = 0;

    const apiCalls = setsArray.map((setId, index) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                pokemon.card.all({ q: `set.id:${setId}`, orderBy: "number"})
                    .then(setData => {
                        const cardIds = setData.map(card => card.id);
                        console.log(++numSetsComplete)
                        console.log(cardIds)
                        setNumMap[setId] = cardIds;
                        resolve(); // Resolve the promise to move to the next iteration
                    })
            }, index * 500); // Adjust the delay duration as needed (in milliseconds)
        });
    });

    return Promise.all(apiCalls)
    .then(() => {
        console.log(setNumMap)
        console.log("Initialization complete!")
    });
    })

const classicCollectionImageArray = ["2_A", "4_A", "8_A", "9_A", "15_A", "15_B", "15_C", "15_D", "17_A", "20_A", "24_A", "54_A", "60_A", "66_A", "73_A", "76_A", "86_A", "88_A", "93_A", "97_A", "107_A", "109_A", "113_A", "114_A", "145_A"]
const classicCollectionDataArray = ["2_A", "4_A", "8_A", "9_A", "15_A1", "15_A2", "15_A3", "15_A4", "17_A", "20_A", "24_A", "54_A", "60_A", "66_A", "73_A", "76_A", "86_A", "88_A", "93_A", "97_A", "107_A", "109_A", "113_A", "114_A", "145_A"]

// HOME PAGE
app.get('/', (req, res) => {
    res.render('home', {page: 'home'})
})

// ABOUT PAGE
app.get('/about', (req, res) =>
{
    res.render('about', {page: 'about'}) 
})

// SEARCH PAGE
app.get('/search', (req, res) => {

    // Basic name query
    if(req.query.q)
    {
    const baseUserQuery = req.query.q;
    let query = 'name:"' + baseUserQuery + '"'; 

    pokemon.card.all({ q: query, orderBy: "name" })
     .then(result => {
        res.render('search', {page: 'Search', query: query, searchResults: result}) 
    })
    }
    // Advanced query
    else
    {
        const queryString = `${req.query.name ? ` name:${req.query.name}` : ''} ${req.query.artist ? ` artist:"${req.query.artist}"` : ''} 
                             ${req.query.supertype ? ` supertype:${req.query.supertype}` : ''} ${req.query.set ? ` set.id:${req.query.set}` : ''} 
                             ${req.query.subtype ? ` subtypes:"${req.query.subtype}"` : ''} ${req.query.rarity ? ` rarity:"${req.query.rarity}"` : ''}`;
        
        console.log(queryString)
        pokemon.card.all({ q: queryString, orderBy: "name"})
            .then(result => {
        res.render('search', {page: 'Search', searchResults: result}) 
        })
    }
  });

// ADVANCED SEARCH PAGE
app.get('/advancedSearch', (req, res) =>
{
    Promise.all(
        [
            pokemon.type.all(),
            pokemon.subtype.all(),
            pokemon.supertype.all(),
            pokemon.rarity.all(),
            pokemon.set.all({orderBy: 'releaseDate'})
        ]
    )
    .then(results => 
        {
            setInfo = results[0];
            res.render('advancedSearch', { page: 'Advanced Search', types: results[0], subtypes: results[1], supertypes: results[2], rarities: results[3], sets: results[4]});
        })
})

// SET PAGE
app.get('/set', (req, res) =>
{
    pokemon.set.all()
        .then((set) => {
        // Create hashmap for Series:set pairs
        const setMap = {}; 
        const idMap = {};

        set.forEach(item => {
        const { series, name, id, releaseDate} = item; 

        // Convert releaseDate to a valid date object
        const dateParts = releaseDate.split('/');
        const validDate = new Date(`${dateParts[0]}-${dateParts[1]}-${dateParts[2]}`);

        
        if(setMap.hasOwnProperty(series)) { 
            setMap[series].push({ name, releaseDate: validDate }); // Store name and converted date 
            idMap[series].push({ id, releaseDate: validDate }); // Store name and converted date 
        } else { 
            setMap[series] = [{ name, releaseDate: validDate }]; // Store name and converted date as an object 
            idMap[series] = [{ id, releaseDate: validDate }]; // Store name and converted date as an object 
        }
        }); 

        // Convert setMap to an array of key-value pairs and sort it based on the earliest release date
        const sortedSetMapArray = Object.entries(setMap).sort(([, a], [, b]) => {
            const earliestSetA = a.reduce((earliest, set) => set.releaseDate < earliest ? set.releaseDate : earliest, new Date());
            const earliestSetB = b.reduce((earliest, set) => set.releaseDate < earliest ? set.releaseDate : earliest, new Date());
            return earliestSetA - earliestSetB;
        });

        // Convert idMap to an array of key-value pairs and sort it based on the earliest release date
        const sortedIdMapArray = Object.entries(idMap).sort(([, a], [, b]) => {
            const earliestSetA = a.reduce((earliest, set) => set.releaseDate < earliest ? set.releaseDate : earliest, new Date());
            const earliestSetB = b.reduce((earliest, set) => set.releaseDate < earliest ? set.releaseDate : earliest, new Date());
            return earliestSetA - earliestSetB;
        });

        // Convert the sorted array back into the sorted setMap object
        const sortedSetMap = Object.fromEntries(sortedSetMapArray);
        const sortedIdMap = Object.fromEntries(sortedIdMapArray);

        // Sort the setMap based on releaseDate
        for (const series in sortedSetMap) 
        {
            sortedSetMap[series].sort((a, b) => a.releaseDate - b.releaseDate);
            sortedIdMap[series].sort((a, b) => a.releaseDate - b.releaseDate);
        }

    res.render('set', {setInfo: set, setMap: sortedSetMap, idMap: sortedIdMap, page: "set"}); 
  })
})

// SETLIST PAGE
app.get('/set/:setId', (req, res) =>
{
    const setId = req.params.setId;
    pokemon.set.find(setId)
        .then(setInfo => {
        res.render('setlist', {setInfo: setInfo, page: "setList", setNumMap: setNumMap, classicCollectionImageArray: classicCollectionImageArray, classicCollectionDataArray: classicCollectionDataArray}) 
        })
        .catch(error => {
            if(error.response.status === 404)
            {
                res.status(404).render('error404', {page: "404"});
            }
            else{
                res.status(500).render('error500', {page: "500"});
            }
        })
})


// CARD PAGE
app.get('/card/:cardId', (req, res) => {
    pokemon.card.find(req.params.cardId)
        .then(card => {
            console.log(card)
            res.render('card', { cardInfo: card, page: "card", setNumMap: setNumMap, classicCollectionImageArray: classicCollectionImageArray, classicCollectionDataArray: classicCollectionDataArray});
        })
        .catch(error => {
            if(error.response.status === 404)
            {
                res.status(404).render('error404', {page: "404"});
            }
            else{
                res.status(500).render('error500', {page: "500"});
            }
        })
});


// 404 PAGE
app.use((req, res, next) => {
    // Create a custom error object for the 404 error
    const error = new Error('Not Found');
    error.status = 404;
  
    // Pass the error to the next middleware
    next(error);
  });
  
  // Custom error handling middleware
  app.use((err, req, res, next) => {
    // Check if the error status is 404
    if (err.status === 404) {
      // Handle the 404 error here
      res.status(404).render('error404', {page: "404"}); // Render your custom 404 page
    } else {
      // Handle other errors (e.g., 500 Internal Server Error)
      console.error(err); // Log the error for debugging
      res.status(500).render('error500', {page: "500"}); // Render a generic error page
    }
  });
// Listen on PORT 3000
app.listen(PORT, () => 
{
    console.log("App is listening on port ", PORT)
})