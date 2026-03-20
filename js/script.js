/* -------------------------------- */
/* Variáveis de exibição do pokémon */
/* -------------------------------- */
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
const pokemonSound = document.querySelector(".pokemon_sound")


/* --------------------- */
/* Indicadores de scroll */
/* --------------------- */
const rightIndicator = document.querySelector(".right-indicator")
const leftIndicator = document.querySelector(".left-indicator")


/* ------------- */
/* Controladores */
/* ------------- */
const menu = document.querySelector(".menu")
const form = document.querySelector(".form")
const input = document.querySelector(".input_search")

const buttonPrev = document.querySelector(".btn-prev")
const buttonNext = document.querySelector(".btn-next")
const buttonConfirm = document.querySelector(".btn-confirm")
const buttonUp = document.querySelector(".btn-up")
const buttonDown = document.querySelector(".btn-down")
const buttonSound = document.querySelector(".btn-sound")

var pokemonSoundTimeout;
let searchPokemon = 1;

var soundStatus = localStorage.getItem("sound_status") ?? true


/* -------------------------------------------------------- */
/* Pegar imagem do Type sem precisar consultar a API sempre */
/* -------------------------------------------------------- */
async function fetchImageType(typeId){
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-vi/x-y/${typeId}.png`
}


/* ----------------------------- */
/* Buscar informações do Pokémon */
/* ----------------------------- */
async function fetchPokemon(pokemon){
    const apiResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`)

    if(apiResponse.status === 200){
        const data = await apiResponse.json()
        
        return data;
    }
}

/* ----------------------------- */
/* Buscar informações da espécie */
/* ----------------------------- */
async function fetchSpecie(pokemon){
    const apiResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemon}`)

    if(apiResponse.status === 200){
        const data = await apiResponse.json()
        
        return data;
    }
}


/* ---------------------- */
/* Renderizando o Pokémon */
/* ---------------------- */
async function renderPokemon(pokemon, is_search=false){
    
    /* ---------------------------------- */
    /* Configuraçõe iniciais para a busca */
    /* ---------------------------------- */
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

    
    
    
    /* ------------------------------------------------------------------------------------ */
    /* Busca dos Tipos do Pokémon Selecionado e das relações de batalha com outros pokémons */
    /* ------------------------------------------------------------------------------------ */
    Promise.all(
        data.types.map((type)=> fetch(type.type.url))
    ).then(async (types)=>{
        const damages = {}
        pokemonTypes.replaceChildren()
        const menuBattlesScreen = menu.querySelector(".battles-screen")

        /* ----------------------------- */
        /* Configura os tipos do pokémon */
        /* ----------------------------- */
        pokemonTypes.replaceChildren()
        for(const res of types){

            /* ------------------------------------------- */
            /* Configura imagem do Type na tela do pokémon */
            /* ------------------------------------------- */
            
            const type = await res.json();
            const imageType = document.createElement("img")

            imageType.classList.add("pokemon_type")
            imageType.src=type['sprites']['generation-v']['black-white']["name_icon"] ?? type['sprites']['generation-vi']['x-y']["name_icon"]

            pokemonTypes.appendChild(imageType)
            
            
            /* --------------------------------------------- */
            /* Mapeia os relacionamentos de tipos na batalha */
            /* --------------------------------------------- */
            
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

        }
        
        /* ------------------------- */
        /* Configura Tela de Batalha */
        /* ------------------------- */
        menuBattlesScreen.replaceChildren()
        
        const xpTitle = document.createElement("h4")
        xpTitle.textContent = "Experience for defeating:"
        xpTitle.classList.add("title-menu")
        menuBattlesScreen.appendChild(xpTitle)
        const xp = document.createElement("p")
        xp.textContent = data.base_experience+" XP"
        menuBattlesScreen.appendChild(xp)

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

    
    /* ---------------------- */
    /* Som do Pokémon em loop */
    /* ---------------------- */
    
    if(soundStatus===true){
        pokemonSound.src = data.cries.legacy
        pokemonSound.addEventListener('loadedmetadata', ()=>{
            pokemonSound.play()
            if(pokemonSoundTimeout){
                clearInterval(pokemonSoundTimeout)
            }
            pokemonSoundTimeout = setInterval(async()=>{
                pokemonSound.play()
            }, pokemonSound.duration*1000+8000)
        })
    }
    

    /* ------------------------------- */
    /* Busca de Habilidades do Pokémon */
    /* ------------------------------- */
    const menuAbilitiesScreen = menu.querySelector(".abilities-screen")

    Promise.all(
        data.abilities.map((ability)=> ability.ability.url).map((url)=>fetch(url))
    ).then((abilities)=>{

        menuAbilitiesScreen.replaceChildren()
        const title = document.createElement("h4")
        title.classList.add("title-menu")
        title.textContent="Habilidades"

        menuAbilitiesScreen.appendChild(title)

        
        abilities.forEach(async(res)=>{
            const ability = await res.json();

            const name = ability.names.filter((name)=>{return name.language.name==="en"})[0].name;
            const desc = ability.flavor_text_entries.filter((flavor)=>{return flavor.language.name==="en"})[0].flavor_text;

            const nameComp = document.createElement("p")
            nameComp.textContent=name
            menuAbilitiesScreen.appendChild(nameComp)

            const descComp = document.createElement("p")
            descComp.classList.add("description")
            descComp.textContent=desc
            menuAbilitiesScreen.appendChild(descComp)
        })
    })


    /* ------------------------------------------ */
    /* Configurando informações gerais do Pokémon */
    /* ------------------------------------------ */
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

    pokemonDescription.innerHTML = species["flavor_text_entries"].filter((desc)=>{return desc.language.name=='en'})[0].flavor_text

    input.value=''
}

/* ---------------------------------- */
/* Funções de gerenciamento do estado */
/* ---------------------------------- */
function resetScrolls(){
    menu.querySelector(".menu-container").scrollTo({left: 0})

    const screens = menu.querySelectorAll(".menu-screen")
    screens.forEach((screen)=>{
        screen.scrollTo({top:0})
    })
}

function handlePrevClick(){
    if(menu.classList.contains("open")){
        menu.querySelector(".menu-container").scrollBy({
            left: -100,
            behavior: "smooth",
        });

        const screens = menu.querySelectorAll(".menu-screen")
        screens.forEach((screen)=>{ screen.scrollTo({top: 0}) })
        return
    }

    if(searchPokemon <= 1) return;

    searchPokemon--
    renderPokemon(searchPokemon)
}

function handleNextClick(){
    if(menu.classList.contains("open")){
        menu.querySelector(".menu-container").scrollBy({
            left: 100,
            behavior: "smooth",
        });

        const screens = menu.querySelectorAll(".menu-screen")
        screens.forEach((screen)=>{ screen.scrollTo({top:0}) })
        return
    }
    searchPokemon+=1
    renderPokemon(searchPokemon)
}

function handleUpClick(){
    const screens = menu.querySelectorAll(".menu-screen")
    screens.forEach((screen)=>{
        screen.scrollBy({
            top: -50,
            behavior: 'smooth'
        })
    })
}

function handleDownClick(){
    const screens = menu.querySelectorAll(".menu-screen")
    screens.forEach((screen)=>{
        screen.scrollBy({
            top: 50,
            behavior: 'smooth'
        })
    })
}

function handleConfirmClick(){
    if(searchPokemon==null) return

    menu.classList.toggle("open")
    resetScrolls()
    pokemonImage.classList.remove("small")

    if(menu.classList.contains("open")){
        console.log("open")
        leftIndicator.classList.add("hide")
        rightIndicator.classList.remove("hide")
    }else{
        console.log("not open")
        leftIndicator.classList.remove("hide")
        rightIndicator.classList.remove("hide")
    }
}

function getSoundStatus(){
    const status = JSON.parse(localStorage.getItem("sound_status"))
    soundStatus = status ?? true
    
    localStorage.setItem("sound_status", soundStatus)
    handleSoundStatusChange(soundStatus)
}

function handleSoundStatusChange(newStatus = null){

    soundStatus = (newStatus!=null && typeof newStatus == "boolean") ? newStatus : !soundStatus
    console.log(soundStatus)
    localStorage.setItem("sound_status", soundStatus)

    if(!soundStatus && pokemonSoundTimeout){
        clearInterval(pokemonSoundTimeout)
    }

    buttonSound.querySelector("span").textContent = soundStatus ? "volume_up" : "volume_off"
}


/* ---------------------------------------- */
/* Event Listeners dos botões e formulários */
/* ---------------------------------------- */ 
form.addEventListener('submit', (event)=>{
    event.preventDefault()
    renderPokemon(input.value.toLowerCase(), true)
})

buttonPrev.addEventListener('click', handlePrevClick)
buttonNext.addEventListener('click', handleNextClick)
buttonUp.addEventListener('click', handleUpClick)
buttonDown.addEventListener('click', handleDownClick)
buttonConfirm.addEventListener('click', handleConfirmClick)
buttonSound.addEventListener('click', handleSoundStatusChange)

window.addEventListener("keydown", (event)=>{
    if(!["enter", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(event.key.toLowerCase()) || input === document.activeElement) return;
    event.preventDefault()
    switch(event.key.toLowerCase()){
        case "enter":
            handleConfirmClick();
            break;
        case "arrowup":
            handleUpClick()
            break;
        case "arrowdown":
            handleDownClick()
            break;
        case "arrowleft":
            handlePrevClick()
            break;
        case "arrowright":
            handleNextClick()
            break;
    }
})

menu.querySelector(".menu-container").addEventListener('scroll', ()=>{
    if(!menu.classList.contains("open")) return;

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

/* ---------------- */
/* Processo inicial */
/* ---------------- */
getSoundStatus()
renderPokemon(searchPokemon)