const users = {
    "zachary": {
        "id": "zachary",
        "discord": "zachary.bachary",
        "discordid": "804839006403428423",
        "gamename": "ZacharyBachary",
        "awards": [
            "eurasiaModern_winner",
            "hre_winner",
			"owbcaribean_winner",
			"feudalismac_winner",
			"world1861_winner",
			"eurasia6coalition_winner",
			"worldww2_winner",
			"eurasia5_winner",
			"mars_winner",
			"usa_winner",
			"eurasia2_winner",
			"tigerland_winner",
			"eurasia1_winner",
			"crimeanwar_super",
			"euammodern_global",
			"eurasiaww2_global",
			"worldkaiserreichp2_global",
			"euammodern_global",
			"ussr_global",
			"tigerlandnew_global",
			"usanew_global",
			"paraguayanwar_global",
			"euro4modern_global",
			"eurasia3_global",
			"historicalww1_global",
			"africa_global",
			"middleeast_global",
			"ww2og_global",
        ],
        "events": [
		    "worldNapoleon",
			"eurasiaModern",
            "hre",
			"owbcaribean",
			"feudalismac",
			"world1861",
			"eurasia6coalition",
			"worldww2",
			"eurasia5",
			"mars",
			"usa",
			"eurasia2",
			"tigerland",
			"eurasia1",
			"crimeanwar",
			"euammodern",
			"eurasiaww2",
			"worldkaiserreichp2",
			"euammodern",
			"ussr",
			"tigerlandnew",
			"usanew",
			"paraguayanwar",
			"euro4modern",
			"eurasia3",
			"historicalww1",
			"africa",
			"middleeast",
			"ww2og",
		],
    },
	"inka": {
		"id": "inka",
		"discord": "plagers1",
		"discordid": "1050563653394505728",
		"gamename": "Plagers",
		"awards": [
		    "tigerlandnew_global",
			"eurasia3_global",
			"eurasia3_global",
			"eurasia1_global",
			"owbcaribean_great",
			"feudalismac_great",
			"eurasiaww2_great",
			"eurasia6coalition_great",
			"ussr_great",
			"worldww2_great",
			"paraguayanwar_great",
			"hre_former",
		],
		"events": [
		    "worldNapoleon",
			"tigerlandnew",
			"eurasia3",
			"eurasia3",
			"eurasia1",
			"owbcaribean",
			"feudalismac",
			"eurasiaww2",
			"eurasia6coalition",
			"ussr",
			"worldww2",
			"paraguayanwar",
			"hre",
		],
	},
	"napoleon": {
		"id": "napoleon",
		"discord": "napoleon0544",
		"discordid": "1192203917757517825",
		"gamename": "Napoleon",
		"awards": [
		    "hre_global",
			"owbcaribean_global",
			"crimeanwar_former",
		],
		"events": [
		    "hre",
			"owbcaribean",
			"crimeanwar",
		],
	},
	"publicnuisance": {
	    "id": "publicnuisance",
		"discord": "stewardconstruct.",
		"discordid": "1114590604668706927",
		"gamename": "Public Nuisance",
		"awards": [
		    "euoemodern_great",
		],
		"events": [
		    "euomodern",
			"world_napoleon",
		],
	},
	"mrgoxlem": {
	    "id": "mrgoxlem",
		"discord": "self_presev",
		"discordid": "1223823017004634206",
		"gamename": "Mrgoxlem",
		"awards": [
		    "feudalismac_global",
			"eurasiaModern_former",
		],
		"events": [
		    "feudalismac",
			"eurasiaModern",
		],
	},
	"useless": {
	    "id": "useless",
		"discord": "useless_yo",
		"discordid": "1111413830443081728",
		"gamename": "Useless",
		"awards": [
		    "eurasia6coalition_great",
		],
		"events": [
		    "eurasia6coalition",
		],
	},
	"eenot": {
		"id": "eenot",
		"discord": "enot_enot",
		"discordid": "794675642037567498",
		"gamename": "EEnot",
		"awards": [
		    "eurasiaModern_super",
			"euammodern_great",
		],
		"events": [
		    "eurasiaModern",
			"euammodern",
		],
	},
};

const types = {
    "winner": {
        score: 15,
        name: "Winner of Event! "
    },
    "super": {
        score: 10,
        name: "Super Power! "
    },
    "global": {
        score: 5,
        name: "Global Power, "
    },
    "great": {
        score: 3,
        name: "Great Power, "
    },
    "former": {
        score: 3,
        name: "Honorary Former Power, "
    },
};

const events = {
    worldww2: {
        name: 'WW2: World Map',
        date: '12.04.2025',
        map: 'zachary_world_v1_ww2',
    },
    ussr: {
        name: 'USSR',
        date: '03.05.2025',
        img: 'ussr.png',
    },
    eurasia6coalition: {
        name: 'Sixth Coalition',
        date: '04.05.2025',
        img: 'eurasia_6coalition.png',
    },
    euammodern: {
        name: 'Modern day North American and Europe',
        date: '15.06.2025',
        map: 'pelo_euam_v1_modern-en',
    },
    worldkaiserreichp2: {
        name: 'Kaiserreich Part 2',
        date: '28.06.2025',
        img: 'world_kaiserreich_p2.png',
    },
    eurasiaww2: {
        name: 'Eurasia WW2',
        date: '09.08.2025',
        img: 'eurasia_ww2.png',
    },
    world1861: {
        name: '1861 World Map',
        date: '23.08.2025',
        img: 'world_1861.png',
    },
    euoemodern: {
        name: 'Europe our Empire Modern',
        date: '06.09.2025',
        img: 'euoe_modern.png',
    },
    feudalismac: {
        name: 'Feudalism and Chivalry',
        date: '20.09.2025',
        img: 'euro4_1100s.png',
    },
    owbcaribean: {
        name: 'Old World Bones Carribean',
        date: '21.09.2025',
        img: 'owb_carribean.png',
    },
    crimeanwar: {
        name: 'Crimean War',
        date: '27.09.2025',
        img: 'euro4_crimeanwar.png',
    },
    hre: {
        name: 'Holy Roman Empire 1944',
        date: '28.09.2025',
        img: 'hre_1944.png',
    },
    eurasiaModern: {
        name: 'Eurasia Modern Day',
        date: '04.10.2025',
        map: 'zachary_eurasia_v2_modern',
    },
    worldNapoleon: {
        name: 'EU Our Empire Great War',
        date: '12.10.2025',
        img: 'world_napoleon.png',
        //map: 'zahcary_world_v1_napoleon',
    },
	og: {
		name: 'Warnament Multiplayer Event',
		date: '26.10.2024',
		img: 'og.png',
	},
	ww2og: {
		name: 'WW2',
		date: '27.10.2024',
		img: 'ww2_og.png',
	},
	africa: {
		name: 'Africa',
		date: '02.11.2024',
		img: 'africa.jpg',
	},
	middleeast: {
		name: 'Middle East',
		date: '09.11.2024',
		img: 'middleeast.png',
	},
	eurasia1: {
		name: 'Eurasia: Part 1',
		date: '23.11.2024',
		img: 'eurasia1.png',
	},
	historicalww2: {
		name: 'World War II Historical',
		date: '24.11.2024',
		img: 'historicalww2.png'
	},
	historicalww1: {
		name: 'Historical WW1 Standarn EU',
		date: '07.12.2024',
		img: 'historicalww1.png',
	},
	tigerland: {
		name: 'Tigerland Civil War',
		date: '08.12.2024',
		img: 'tigerland.png',
	},
	talonia: {
		name: 'Talonia World Map',
		date: '14.12.2024',
		img: 'talonia.png',
	},
	eurasia2: {
		name: 'Eurasia: Part 2',
		date: '21.12.2024',
		img: 'eurasia2.png',
	},
	eurasia3: {
		name: 'Eurasia: Part 3',
		date: '04.01.2025',
		img: 'eurasia3.png',
	},
	usa: {
		name: 'United States',
		date: '05.01.2025',
		img: 'usa.png',
	},
    eurasia4: {
		name: 'Eurasia: Part 4',
		date: '12.01.2025',
		img: 'eurasia4.png',
	},
	owb: {
		name: 'Old World Blues',
		date: '11.01.2025',
		img: 'owb.png',
	},
	euro4modern: {
		name: 'Euro4 Modern Day',
		date: '19.01.2025',
		img: 'euro4modern.png',
	},
	lanperna: {
		name: 'Lanperna',
		date: '18.01.2025',
		img: 'lanperna.png'
	},
	mars: {
		name: 'Terraformed Mars',
		date: '25.01.2025',
		img: 'mars.png'
	},
	ah: {
		name: 'Austria Hungary',
		date: '01.03.2025',
		img: 'ah.png',
	}
}
