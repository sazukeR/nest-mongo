import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PokemonService {

  constructor(
    @InjectModel( Pokemon.name ) // el nombre del modelo que queremos usar
    private readonly pokemonModel: Model<Pokemon>
  ) {}


  async create(createPokemonDto: CreatePokemonDto) {
    
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase()


    try {
      
      const pokemon = await this.pokemonModel.create( createPokemonDto );


      return pokemon;

    } catch (error) {
      
      // 11000 es el codigo de error que se lanzaria si ya hubiera un registro creado con ese nombre de pokemon o con ese no de pokemon (recordando que nosotros validamos las entitys para preveer que hayan llaves duplicadas)

      // de esta forma manejamos los errores para poder enviarselos a front-end, siendo mas especificos en lo que causo el problema
      if (error.code === 11000) {
        throw new BadRequestException(`Pokemon exist in db ${JSON.stringify( error.keyValue )}`);
      }


      throw new InternalServerErrorException('Cant create Pokemon - check server logs')

    }

  }

  findAll() {
    return `This action returns all pokemon`;
  }

  findOne(id: number) {
    return `This action returns a #${id} pokemon`;
  }

  update(id: number, updatePokemonDto: UpdatePokemonDto) {
    return `This action updates a #${id} pokemon`;
  }

  remove(id: number) {
    return `This action removes a #${id} pokemon`;
  }
}
