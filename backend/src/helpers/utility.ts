export const kilometersToRadian = function(kms:number){
    const earthRadiusInKilometers = 6371;
    return kms / earthRadiusInKilometers;
};