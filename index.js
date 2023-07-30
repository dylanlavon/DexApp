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
        const queryString = `${req.query.name ? ` name:${req.query.name}` : ''} ${req.query.artist ? ` artist:"${req.query.artist}"` : ''} ${req.query.supertype ? ` supertype:${req.query.supertype}` : ''} ${req.query.set ? ` set.id:${req.query.set}` : ''} ${req.query.subtype ? ` subtypes:"${req.query.subtype}"` : ''} ${req.query.rarity ? ` rarity:"${req.query.rarity}"` : ''}`;
        
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
            //setList = results[1];
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
    let setInfo;
    //let setList;

    Promise.all(
        [
            pokemon.set.find(setId),
            //pokemon.card.where({ q: `set.id:${setId}` })
        ]
    )
    .then(results => 
        {
            setInfo = results[0];
            //setList = results[1];
            res.render('setlist', { setInfo: setInfo, page: "setList"});
        })

})

// CARD PAGE
app.get('/card/:cardId', (req, res) => {
    pokemon.card.find(req.params.cardId)
        .then(card => {
            res.render('card', { cardInfo: card, page: "card" });
        });
});

// Listen on PORT 3000
app.listen(PORT, () => 
{
    console.log("App is listening on port ", PORT)
})