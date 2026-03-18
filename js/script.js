const pokemonName = document.querySelectorAll('.pokemon_name')
const pokemonNumber = document.querySelector('.pokemon_number')
const pokemonImage = document.querySelector(".pokemon_image")
const pokemonHeight = document.querySelector(".pokemon_height")
const pokemonWeight = document.querySelector(".pokemon_weight")
const pokemonHp = document.querySelector(".pokemon_hp")
const pokemonAttack = document.querySelector(".pokemon_attack")
const pokemonDefense = document.querySelector(".pokemon_defense")
const pokemonTypes = document.querySelector(".pokemon_types")


const menu = document.querySelector(".menu")

const form = document.querySelector(".form")
const input = document.querySelector(".input_search")

const buttonPrev = document.querySelector(".btn-prev")
const buttonNext = document.querySelector(".btn-next")
const buttonConfirm = document.querySelector(".btn-confirm")

let searchPokemon = 1;

async function fetchPokemon(pokemon){
    const apiResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`)

    if(apiResponse.status === 200){
        const data = await apiResponse.json()
        
        return data;
    }
    
}

async function renderPokemon(pokemon){
    pokemonName.forEach((name)=>{name.innerHTML = 'Loading...'});
    pokemonNumber.innerHTML = ''

    const data = await fetchPokemon(pokemon);

    menu.classList.remove("open")
    
    if(!data){
        searchPokemon = null
        pokemonImage.style.display='none'
        pokemonTypes.replaceChildren()
        pokemonName.forEach((name)=>{name.innerHTML = 'Not found :c'});
        pokemonNumber.innerHTML = ''
        return;
    }
    
    Promise.all(
        data.types.map((type)=> type.type.url).map((url)=>fetch(url))
    ).then((types)=>{
        console.log(types)
        pokemonTypes.replaceChildren()
        types.forEach(async(res)=>{
            const type = await res.json();
            const imageType = document.createElement("img")

            imageType.classList.add("pokemon_type")
            imageType.src=type['sprites']['generation-v']['black-white']["name_icon"] ?? type['sprites']['generation-vi']['x-y']["name_icon"]

            pokemonTypes.appendChild(imageType)
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
    renderPokemon(input.value.toLowerCase())
})

buttonPrev.addEventListener('click', ()=>{
    if(searchPokemon<=1) return;

    searchPokemon--
    renderPokemon(searchPokemon)
})

buttonNext.addEventListener('click', ()=>{
    searchPokemon+=1
    renderPokemon(searchPokemon)
})

buttonConfirm.addEventListener('click', ()=>{
    if(searchPokemon!=null){
        menu.classList.toggle("open")
    }
})

renderPokemon(searchPokemon)