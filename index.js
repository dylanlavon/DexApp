const pokemon = require('pokemontcgsdk');
const express = require('express');
const app = express();
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'));


const API_KEY = '9926f1ab-1b23-4897-9311-c7266b6ca406'
const PORT = 3000

pokemon.configure({apiKey: API_KEY})
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    res.send("Welcome home!")
})

app.get('/about', (req, res) =>
{
    res.send("This is the About page!")   
})

app.get('/sets', (req, res) =>
{
    pokemon.set.all()
        .then((sets) => {

        // Create hashmap for Series:set pairs
        const setMap = {}; 
        sets.forEach(item => {
        const { series, name } = item; 
        if(setMap.hasOwnProperty(series)) { 
            setMap[series].push(name); 
        } else { 
            setMap[series] = [name]; 
        } 
        }); 

    res.render('sets', {setsInfo: sets, setMap: setMap}); 
    console.log(sets)
  })
})

app.get('/set/:setId', (req, res) =>
{
    res.send(`This is where we will render the set page for a set, if it exists! The passed in set is: ${req.params.setId}`)   
})

app.get('/card/:cardId', (req, res) =>
{
    pokemon.card.find(req.params.cardId)
        .then(card => {
    res.render('card', {cardInfo: card}) 
    
    // console.log(card)
})
    
})

// pokemon.card.find('base1-4')
// .then(card => {
//     console.log(card) // "Charizard"
// })

app.listen(PORT, () => 
{
    console.log("App is listening on port ", PORT)
})