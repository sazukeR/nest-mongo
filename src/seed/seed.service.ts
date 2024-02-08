import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PokeRespose } from './interfaces/poke-response.interface';
import { PokemonService } from 'src/pokemon/pokemon.service';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { Model } from 'mongoose';
import { AxiosAdapter } from 'src/common/adapters/axios-adapter';


@Injectable()
export class SeedService {

  
  constructor(
    @InjectModel( Pokemon.name ) // el nombre del modelo que queremos usar
    private readonly pokemonModel: Model<Pokemon>,

    private readonly http: AxiosAdapter
  ) {}



  


  async excecuteSEED() {

    await this.pokemonModel.deleteMany({});

    const  data  = await this.http.get<PokeRespose>('https://pokeapi.co/api/v2/pokemon?limit=650');

    const pokemonsToInsert: {name: string; no: number}[] = [];

    data.results.forEach(async({name, url}) => {
      const segments = url.split('/');
      const no = +segments[segments.length - 2];


     // await this.pokemonModel.create({name, no});

     pokemonsToInsert.push({name, no})
    });

    await this.pokemonModel.insertMany(pokemonsToInsert);


    return 'SEED EXCECUTED SUCCESSFULLY'
  }

}
