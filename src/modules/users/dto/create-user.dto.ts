import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsString, Length, Matches, MaxLength } from 'class-validator';

export class CreateUserDto {
  @IsOptional()
  @IsString()
  @Length(2, 100)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name?: string;

  @IsEmail({}, { message: 'email inválido' })
  @MaxLength(255)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  email: string;

  @IsString()
  @Length(8, 72, { message: 'password deve ter entre 8 e 72 caracteres' })
  @Matches(/^(?=.*[a-zA-Z])(?=.*\d).+$/, { message: 'password deve conter letras e números' })
  password: string;
}
