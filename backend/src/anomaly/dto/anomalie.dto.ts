import { IsString, IsOptional, IsDateString, IsNotEmpty } from 'class-validator';

export class CreateAnomalieDto {
    @IsString()
    @IsOptional()
    num_equipments: string;

    @IsString()
    @IsOptional()
    duree_intervention?: string;

    @IsString()
    @IsOptional()
    unite?: string;

    @IsString()
    @IsOptional()
    systeme?: string;

    @IsString()
    @IsOptional()
    descreption_anomalie?: string;

    @IsString()
    @IsOptional()
    origine?: string;

    @IsString()
    @IsOptional()
    section_proprietaire?: string;

    @IsString()
    @IsOptional()
    fiablite_integrite?: string;

    @IsString()
    @IsOptional()
    disponsibilite?: string;

    @IsString()
    @IsOptional()
    process_safty?: string;

    @IsString()
    @IsOptional()
    Criticite?: string;

    @IsString()
    @IsOptional()
    date_detection?: string;
}

export class UpdateAnomalieDto {
    @IsString()
    @IsOptional()
    num_equipments?: string;
    @IsString()
    @IsOptional()
    duree_intervention?: string;
    @IsString()
    @IsOptional()
    unite?: string;
    @IsString()
    @IsOptional()
    systeme?: string;
    @IsString()
    @IsOptional()
    descreption_anomalie?: string;
    @IsString()
    @IsOptional()
    origine?: string;
    @IsDateString()
    @IsOptional()
    date_detection?: string;
    @IsString()
    @IsOptional()
    section_proprietaire?: string;
    @IsString()
    @IsOptional()
    fiablite_integrite?: string;
    @IsString()
    @IsOptional()
    disponsibilite?: string;
    @IsString()
    @IsOptional()
    process_safty?: string;
    @IsString()
    @IsOptional()
    Criticite?: string;
    @IsString()
    @IsOptional()
    status?: string; // Added status field

}