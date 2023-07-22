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

app.get('/set', (req, res) =>
{
    pokemon.set.all()
        .then((set) => {
            console.log(set[0].name)
        // Create hashmap for Series:set pairs
        const setMap = {}; 
        const idMap = {};
        set.forEach(item => {
        const { series, name, id } = item; 
        
        if(setMap.hasOwnProperty(series)) { 
            setMap[series].push(name); 
            idMap[series].push(id);
        } else { 
            setMap[series] = [name]; 
            idMap[series] = [id];
        } 
        }); 

    res.render('set', {setInfo: set, setMap: setMap, idMap: idMap, page: "set"}); 
  })
})

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

app.get('/card/:cardId', (req, res) =>
{
    pokemon.card.find(req.params.cardId)
        .then(card => {
    res.render('card', {cardInfo: card, page: "card"}) 
    
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