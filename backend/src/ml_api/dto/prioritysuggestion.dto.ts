import { IsOptional, IsString } from "class-validator";

export class PrioritySuggestionDto {    
    
    @IsString()
    @IsOptional()
    description?: string;
    @IsString()
    @IsOptional()
    uid?: string;
}