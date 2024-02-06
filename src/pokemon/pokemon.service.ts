import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';
import { Model, isValidObjectId } from 'mongoose';
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
      
      this.handleExceptions( error )

    }

  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(term: string) {

    let pokemon: Pokemon;

    if ( !isNaN(+term) ) {
      pokemon = await this.pokemonModel.findOne({ no: term });
    }

    if ( !pokemon && isValidObjectId(term) ) {
      pokemon = await this.pokemonModel.findById(term);
    }

    if ( !pokemon ) {
      pokemon = await this.pokemonModel.findOne({name: term});
    }


    if( !pokemon ) {
      throw new NotFoundException(`Pokemon with id, name or no. ${term} not found`);
    }

    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {

    const pokemon = await this.findOne(term);

    if ( updatePokemonDto.name ) {
      updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase();
    }

    try {
      
      await pokemon.updateOne(updatePokemonDto);

      return { ...pokemon.toJSON(), ...updatePokemonDto };


    } catch (error) {

      this.handleExceptions( error )

    }

  }

  async remove(id: string) {

    const result = await this.pokemonModel.findByIdAndDelete( id );


    return result;
    
/*     const pokemon = await this.findOne(id);
    await pokemon.deleteOne(); */

  }

  // nos creamos una funcion para amnejar los errores en el update y create, es de tipo any para que pueda manejar cualquier tipo de error
  private handleExceptions( error: any ) {
    // 11000 es el codigo de error que se lanzaria si ya hubiera un registro creado con ese nombre de pokemon o con ese no de pokemon (recordando que nosotros validamos las entitys para preveer que hayan llaves duplicadas)

    // de esta forma manejamos los errores para poder enviarselos a front-end, siendo mas especificos en lo que causo el problema
    
    if (error.code === 11000) {
      throw new BadRequestException(`Pokemon exist in db ${JSON.stringify( error.keyValue )}`);
    }

    throw new InternalServerErrorException('Cant create Pokemon - check server logs');

  }
}
