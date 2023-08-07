import { AutocompleteInteraction, CommandInteraction, SlashCommandBuilder } from "discord.js";

export interface SlashCommand {
    data: SlashCommandBuilder,
    execute: (interaction: CommandInteraction) => Promise<void>,
    autocomplete?: (interaction: AutocompleteInteraction) => void,
    cooldown?: number
}

declare global {
    interface String {
        capitalize(): string;
    }
}

interface Ability {
    ability: {
        name: string;
        url: string;
    };
    is_hidden: boolean;
    slot: number;
}

interface Version {
    name: string;
    url: string;
}

interface GameIndex {
    game_index: number;
    version: Version;
}

interface Form {
    name: string;
    url: string;
}

interface Sprites {
    back_default: string;
    back_female: string | null;
    back_shiny: string;
    back_shiny_female: string | null;
    front_default: string;
    front_female: string | null;
    front_shiny: string;
    front_shiny_female: string | null;
    other: {
        dream_world?: {
            front_default: string;
            front_female: string | null;
        };
        home: {
            front_default: string;
            front_female: string | null;
        };
        "official-artwork": {
            front_default: string;
        };
    };
    versions: {
        "generation-i": {
            "red-blue": {
                back_default: string;
                back_gray: string;
                front_default: string;
                front_gray: string;
            };
            yellow: {
                back_default: string;
                back_gray: string;
                front_default: string;
                front_gray: string;
            };
        };
        // Add more version generations if available
    };
}

interface Pokemon {
    abilities: Ability[];
    base_experience: number;
    forms: Form[];
    game_indices: GameIndex[];
    height: number;
    held_items: any[]; // Replace 'any' with the appropriate type if you have information about the 'held_items'.
    id: number;
    is_default: boolean;
    location_area_encounters: string;
    name: string;
    order: number;
    past_types: any[]; // Replace 'any' with the appropriate type if you have information about the 'past_types'.
    species: {
        name: string;
        url: string;
    };
    sprites: Sprites;
    stats: {
        base_stat: number;
        effort: number;
        stat: {
            name: string;
            url: string;
        };
    }[];
    types: {
        slot: number;
        type: {
            name: string;
            url: string;
        };
    }[];
    weight: number;
}

interface DamageRelation {
    name: string;
    url: string;
}

interface TypeDamageRelations {
    no_damage_to: DamageRelation[];
    half_damage_to: DamageRelation[];
    double_damage_to: DamageRelation[];
    no_damage_from: DamageRelation[];
    half_damage_from: DamageRelation[];
    double_damage_from: DamageRelation[];
}

interface PastDamageRelation {
    generation: {
        name: string;
        url: string;
    };
    damage_relations: TypeDamageRelations;
}

interface GameIndex {
    game_index: number;
    generation: {
        name: string;
        url: string;
    };
}

interface Generation {
    name: string;
    url: string;
}

interface MoveDamageClass {
    name: string;
    url: string;
}

interface Name {
    name: string;
    language: {
        name: string;
        url: string;
    };
}

interface PokemonSlot {
    slot: number;
    pokemon: {
        name: string;
        url: string;
    };
}

interface Move {
    name: string;
    url: string;
}

interface Type {
    id: number;
    name: string;
    damage_relations: TypeDamageRelations;
    past_damage_relations: PastDamageRelation[];
    game_indices: GameIndex[];
    generation: Generation;
    move_damage_class: MoveDamageClass;
    names: Name[];
    pokemon: PokemonSlot[];
    moves: Move[];
}

interface PokemonListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: PokemonResult[];
}

interface PokemonResult {
    name: string;
    url: string;
}
