import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, GuildEmoji, Collection } from 'discord.js';
import { Pokemon, PokemonListResponse, Type } from '../types';
import { get } from 'fast-levenshtein';
import { load } from 'cheerio';
import '../func/index';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bdex')
        .setDescription('Show battle relevant Pokémon information')
        .addStringOption(
            option =>
                option
                    .setName('pokemon')
                    .setDescription('The Pokémon to search for')
                    .setRequired(true)
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;
        await interaction.deferReply();
        const pokemon = interaction.options.getString('pokemon');
        if (!pokemon) return;

        const emojiFinder = (emojis: Collection<string, GuildEmoji>, name: string) => {
            return emojis.find(emoji => emoji.name?.toLowerCase() === name.toLowerCase())?.toString();
        }

        const operate = async (pokemon: string) => {
            try {
                let emojis: Collection<string, GuildEmoji> | undefined;
                if(process.env.GUILD_EMOJIS_ID) emojis = interaction.client.guilds.cache.get(process.env.GUILD_EMOJIS_ID)?.emojis.cache;
 
                const pokemonData = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.toLowerCase()}`).then(res => res.json()) as Pokemon;

                const typeData = await Promise.all(pokemonData.types.map(type => fetch(type.type.url).then(res => res.json()))) as Type[];

                interface TypeCounts {
                    [key: string]: number;
                }
                const typeCounts: TypeCounts = typeData
                .map(type => type.damage_relations.double_damage_from)
                .flat()
                .map(type => type.name)
                .reduce((acc, word) => {
                    (acc as TypeCounts)[word] = ((acc as TypeCounts)[word] || 0) + 1;
                    return acc;
                }, {});
                  
                const quadrupleDamageFromTypes = Object.keys(typeCounts).filter(word => typeCounts[word] > 1);

                const html = await fetch(`https://www.pokemon.com/us/pokedex/${pokemon.toLowerCase()}`).then(res => res.text());
                const $ = load(html);
                const attributesDiv = $('div.pokedex-pokemon-attributes').first();
                const weaknessDiv = attributesDiv.find('div.dtm-weaknesses');
                const spanElements = weaknessDiv.find('ul > li > a > span');
                spanElements.length;
                const text = spanElements.map(((index, element) => {
                    return $(element).text().trim()
                })).get();
                const weakTypes: string[] = [... new Set(text)];

                let EVs = pokemonData.stats.filter(stat => stat.effort > 0);
                let highestBaseStat = pokemonData.stats.reduce((prev, current) => (prev.base_stat > current.base_stat) ? prev : current);
                const embed = new EmbedBuilder()
                    .setAuthor({ name: 'Pokédex', url: `https://www.pokemon.com/us/pokedex/${pokemon}` })
                    .setThumbnail(pokemonData.sprites.other['official-artwork'].front_default)
                    .setURL(`https://www.pokemon.com/us/pokedex/${pokemon.toLowerCase()}`)
                    .setColor('#2b2d31')
                    .setTitle(pokemonData.name.capitalize())
                    .addFields([
                        { name: 'Type', value: pokemonData.types.map(type => `${emojis ? emojiFinder(emojis, type.type.name) + ' ' : ''}${type.type.name.capitalize()}`).join('\n'), inline: true },
                        { name: 'Specialty', value: `${highestBaseStat.stat.name.capitalize()} (${highestBaseStat.base_stat})`, inline: true },
                        { name: 'EVs', value: EVs.map(stat => `${stat.effort} ${stat.stat.name.capitalize()}`).join('\n'), inline: true },
                        { name: 'Weak To', value: weakTypes.map(type => `${quadrupleDamageFromTypes.includes(type.toLowerCase()) ? '**4x**' : '2x'} ${emojis ? emojiFinder(emojis, type.toLowerCase()) + ' ' : ''}${type.capitalize()}`).join('\n'), inline: true },
                        { name: 'Resistant To', value: typeData.map(type => type.damage_relations.half_damage_from).flat().length > 0 ? typeData.map(type => type.damage_relations.half_damage_from).flat().map(type => `${emojis ? emojiFinder(emojis, type.name) + ' ' : ''}${type.name.capitalize()}`).join('\n') : 'None', inline: true },
                        { name: 'Immune To', value: typeData.map(type => type.damage_relations.no_damage_from).flat().length > 0 ? typeData.map(type => type.damage_relations.no_damage_from).flat().map(type => `${emojis ? emojiFinder(emojis, type.name) + ' ' : ''}${type.name.capitalize()}`).join('\n') : 'None', inline: true },
                    ])
                    .setFooter({ text: `#${pokemonData.id.toString().padStart(3, '0')} • Pokemon.com`, iconURL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Pok%C3%A9_Ball_icon.svg/1200px-Pok%C3%A9_Ball_icon.svg.png' });
                return interaction.editReply({ embeds: [embed] });
            } catch (error) {
                console.error(error);
            }
        };

        let pokemonList: PokemonListResponse;
        const check = async () => {
            pokemonList = await fetch(`https://pokeapi.co/api/v2/pokemon-species/?limit=1010`).then(res => res.json()) as PokemonListResponse;
            if(!pokemonList.results.find(p => p.name.toLowerCase() === pokemon.toLowerCase())) {
                let minDistance = Infinity;
                let closestName: string | undefined;

                for (const poke of pokemonList.results) {
                    const distance = get(pokemon, poke.name);
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestName = poke.name;
                    }
                };

                if(!closestName) {
                    return interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setAuthor({ name: 'Pokédex', iconURL: interaction.client.user.displayAvatarURL() })
                                .setThumbnail('https://66.media.tumblr.com/f4918498af34c8764de970a2ca76795b/tumblr_mvzj2elEQA1rfjowdo1_500.gif')
                                .setColor('Red')
                                .setTitle(`Pokémon not found`)
                                .setDescription(`I tried my hardest but I couldn't find a Pokémon with the name **${pokemon}**!`)
                        ]
                    });
                };

                await operate(closestName);
            } else if(pokemonList.results.find(p => p.name.toLowerCase() === pokemon.toLowerCase())) {
                await operate(pokemon);
            }
        };

        await check();
    },
};