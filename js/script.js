const pokemonName = document.querySelectorAll('.pokemon_name')
const pokemonNumber = document.querySelector('.pokemon_number')
const pokemonImage = document.querySelector(".pokemon_image")
const pokemonDescription = document.querySelector(".pokemon_description")
const pokemonWeight = document.querySelector(".pokemon_weight")
const pokemonHeight = document.querySelector(".pokemon_height")
const pokemonHp = document.querySelector(".pokemon_hp")
const pokemonAttack = document.querySelector(".pokemon_attack")
const pokemonDefense = document.querySelector(".pokemon_defense")
const pokemonTypes = document.querySelector(".pokemon_types")
const rightIndicator = document.querySelector(".right-indicator")
const leftIndicator = document.querySelector(".left-indicator")

const menu = document.querySelector(".menu")

const form = document.querySelector(".form")
const input = document.querySelector(".input_search")

const buttonPrev = document.querySelector(".btn-prev")
const buttonNext = document.querySelector(".btn-next")
const buttonConfirm = document.querySelector(".btn-confirm")
const buttonUp = document.querySelector(".btn-up")
const buttonDown = document.querySelector(".btn-down")

let searchPokemon = 1;

async function fetchImageType(typeId){
    /*const url = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-v/black-white/${typeId}.png`
    const res = fetch(url)

    if(res.status===200){
        return url
    }*/
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-vi/x-y/${typeId}.png`
}

async function fetchPokemon(pokemon){
    const apiResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`)

    if(apiResponse.status === 200){
        const data = await apiResponse.json()
        
        return data;
    }
}

async function fetchSpecie(pokemon){
    const apiResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemon}`)

    if(apiResponse.status === 200){
        const data = await apiResponse.json()
        
        return data;
    }
}

async function renderPokemon(pokemon, is_search=false){
    if(is_search){
        pokemonName.forEach((name)=>{name.innerHTML = 'Loading...'});
        pokemonNumber.innerHTML = ''
    }

    const [data, species] = await Promise.all([ fetchPokemon(pokemon), fetchSpecie(pokemon) ])

    menu.classList.remove("open")
    
    if(!data){
        searchPokemon = null
        pokemonImage.style.display='none'
        pokemonTypes.replaceChildren()
        pokemonName.forEach((name)=>{name.innerHTML = 'Not found :c'});
        pokemonNumber.innerHTML = ''
        return;
    }

    pokemonDescription.textContent = species["flavor_text_entries"].filter((desc)=>{return desc.language.name=='en'})[0].flavor_text

    
    Promise.all(
        data.types.map((type)=> fetch(type.type.url))
    ).then(async (types)=>{
        const damages = {}
        pokemonTypes.replaceChildren()
        const menuBattlesScreen = menu.querySelector(".battles-screen")

        for(const res of types){
            const type = await res.json();
            const imageType = document.createElement("img")

            imageType.classList.add("pokemon_type")
            imageType.src=type['sprites']['generation-v']['black-white']["name_icon"] ?? type['sprites']['generation-vi']['x-y']["name_icon"]

            const damageRelation = type["damage_relations"]

            for(let item in damageRelation){
                if(!damages[item]){
                    damages[item] = []
                }
                console.log(damageRelation[item])
                await damageRelation[item].forEach(async(dmType)=>{
                    const imageTypeDan = document.createElement("img")

                    imageTypeDan.classList.add("pokemon_type")
                    imageTypeDan.src= await fetchImageType(dmType.url.split("/").at(-2))
                    damages[item].push(imageTypeDan)
                })
            }

            pokemonTypes.appendChild(imageType)
        }
        menuBattlesScreen.replaceChildren()
        for(var key in damages){
            const title = document.createElement("h4")
            title.classList.add("title-menu")
            title.textContent = key.replaceAll("_", " ")
            
            menuBattlesScreen.appendChild(title)
            
            if(damages[key].length <=0){
                const p = document.createElement("p")
                p.textContent="Nenhum"
                menuBattlesScreen.appendChild(p)
            }

            const div = document.createElement("div")
            div.classList.add("row")
            damages[key].forEach((comp)=>{div.appendChild(comp)})

            menuBattlesScreen.appendChild(div)

        }
        
    })

    

    const menuAbilitiesScreen = menu.querySelector(".abilities-screen")
    menuAbilitiesScreen.scrollTo({
        top: 0
    })

    Promise.all(
        data.abilities.map((ability)=> ability.ability.url).map((url)=>fetch(url))
    ).then((types)=>{

        menuAbilitiesScreen.replaceChildren()
        const title = document.createElement("h4")
        title.classList.add("title-menu")
        title.textContent="Habilidades"

        menuAbilitiesScreen.appendChild(title)

        
        types.forEach(async(res)=>{
            const ability = await res.json();

            const name = ability.names.filter((name)=>{return name.language.name==="en"})[0].name;
            const desc = ability.flavor_text_entries.filter((flavor)=>{return flavor.language.name==="en"})[0].flavor_text;

            console.log(desc)

            const nameComp = document.createElement("p")
            nameComp.textContent=name
            menuAbilitiesScreen.appendChild(nameComp)

            const descComp = document.createElement("p")
            descComp.classList.add("description")
            descComp.textContent=desc
            menuAbilitiesScreen.appendChild(descComp)
        })
    })

    searchPokemon = data.id
    
    pokemonImage.style.display='block'
    pokemonName.forEach((name)=>{name.innerHTML = data.name})
    pokemonNumber.innerHTML = data.id
    pokemonImage.src = data['sprites']['versions']['generation-v']['black-white']['animated']['front_default'] ?? data['sprites']['front_default']
    
    pokemonHeight.innerHTML = (data.height >= 10) ? data.height/10 + " m" : pokemonHeight.innerHTML = data.height*10 + " cm"
    pokemonWeight.innerHTML = (data.weight >= 10) ? data.weight/10 + " kg" : data.weight*100 + " g"
    
    pokemonHp.innerHTML = data.stats.filter((stat)=>stat.stat.name==="hp")[0].base_stat
    pokemonAttack.innerHTML = data.stats.filter((stat)=>stat.stat.name==="attack")[0].base_stat
    pokemonDefense.innerHTML = data.stats.filter((stat)=>stat.stat.name==="defense")[0].base_stat

    input.value=''
}

form.addEventListener('submit', (event)=>{
    event.preventDefault()
    renderPokemon(input.value.toLowerCase(), true)
})

menu.querySelector(".menu-container").addEventListener('scroll', ()=>{
    setTimeout(() => {
        const scrollLeft = menu.querySelector(".menu-container").scrollLeft
        const clientWidth = menu.querySelector(".menu-screen").clientWidth
        const scrollWidth = menu.querySelector(".menu-container").scrollWidth
            
        if(scrollLeft < clientWidth *2) {
            pokemonImage.classList.remove("small")
        }else{
            pokemonImage.classList.add("small")
        }

        if(scrollLeft<=20){
            leftIndicator.classList.add("hide")
        }else{
            leftIndicator.classList.remove("hide")
        }

        if(scrollWidth - scrollLeft <= clientWidth){
            rightIndicator.classList.add("hide")
        }else{
            rightIndicator.classList.remove("hide")
        }

    }, 50);
})

buttonPrev.addEventListener('click', ()=>{
    if(menu.classList.contains("open")){
        menu.querySelector(".menu-container").scrollBy({
            left: -100,
            behavior: "smooth",
        });

        const screens = menu.querySelectorAll(".menu-screen")
        screens.forEach((screen)=>{
            screen.scrollTo({top: 0})
        })
        
        return
    }

    if(searchPokemon <= 1) return;

    searchPokemon--
    renderPokemon(searchPokemon)
})

buttonNext.addEventListener('click', ()=>{
    if(menu.classList.contains("open")){
        menu.querySelector(".menu-container").scrollBy({
            left: 100,
            behavior: "smooth",
        });
        
        return
    }
    searchPokemon+=1
    renderPokemon(searchPokemon)
})

buttonUp.addEventListener('click', ()=>{
    const screens = menu.querySelectorAll(".menu-screen")
    screens.forEach((screen)=>{
        screen.scrollBy({
            top: -50,
            behavior: 'smooth'
        })
    })
})

buttonDown.addEventListener('click', ()=>{
    const screens = menu.querySelectorAll(".menu-screen")
    screens.forEach((screen)=>{
        screen.scrollBy({
            top: 50,
            behavior: 'smooth'
        })
    })
})

buttonConfirm.addEventListener('click', ()=>{
    if(searchPokemon!=null){
        menu.classList.toggle("open")
        resetScrolls()

        if(menu.classList.contains("open")){
            leftIndicator.classList.add("hide")
            rightIndicator.classList.remove("hide")
        }else{
            leftIndicator.classList.remove("hide")
            rightIndicator.classList.remove("hide")
        }
    }
})

function resetScrolls(){

    menu.querySelector(".menu-container").scrollTo({left: 0})

    const screens = menu.querySelectorAll(".menu-screen")
    screens.forEach((screen)=>{
        screen.scrollTo({top:0})
    })
}

renderPokemon(searchPokemon)