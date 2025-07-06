import { IsOptional, IsString } from "class-validator";

export class ForceStopDto {
    @IsString()
    @IsOptional()
    date_debut_arret: string;

    @IsString()
    @IsOptional()
    date_fin_arret: string;


    @IsString()
    @IsOptional()
    titlte: string;


    @IsString()
    @IsOptional()
    duree_jour: string;

    @IsString()
    @IsOptional()
    duree_heure: string;
}