## Created by Dylan Britain for CS4395 Senior Project at the University of Houston-Downtown.

All data is provided by the [Pokemon TCG Developers API](https://pokemontcg.io/). 

---

## Known Issues

- McDonald's Sets for '14, '15, '17, and '18 are all missing images (due to them not being uploaded yet to pkmncards.io).
- HGSS18 missing image.
- Some sets have missing card data altogether, causing the app to crash when attempting acces the resouce.
  - SWSH Black Star Promos need to skip SWSH 299-301
  - SM Black Star Promos don't account for SM30a, SM103a since they don't match the parsing convention.
  - XY Black Star Promos don't account for XY67a, 150a, 177a, 198a, 200a since they don't match the parsing convention.
- Some logos and symbols don't scale correctly

---
Pokémon characters, images, and card images belong to Pokémon USA, Inc. and Nintendo. This website or it's
    creators are in no way affiliated with or endorsed by Nintendo LLC, Creatures, GAMEFREAK inc, The Pokémon
    Company, Pokémon USA, Inc., The Pokémon Company International, or Wizards of the Coast.
