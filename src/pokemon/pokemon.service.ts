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
    // el problema de hacerlo asi es que si el usuario introduce un id mongo que no exista, igual enviara un estatus 200 dando un falso positivo. y si usamnos el findOne solucionariamos el problema pero estariamos haciendo una doble consulta a la base de datos. para solucionar este problema lo haremos con el deleteOne que nos ofrece un count con los datos eliminados, si la cuenta es 0 quiere decir que no elimino ningun registro pro lo tanto no existe el id, de esta forma podemos enviar un BadRequestException

    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id });

    if ( deletedCount === 0 ) {
      throw new BadRequestException(`There not exist id ${ id }`)
    }

    return;

  //  const result = await this.pokemonModel.findByIdAndDelete( id );


   // return result;
    
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
